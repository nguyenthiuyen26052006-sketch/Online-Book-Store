from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

import models, schemas
from auth import check_role, get_current_admin
from database import get_db
from order_utils import set_order_status
from routers.reviews import serialize_review

router = APIRouter(prefix="/admin", tags=["Admin"])

_DELIVERED_STATUSES = ("delivered", "completed")


@router.get("/stats/orders")
async def get_order_stats(
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin),
):
    orders = (
        db.query(models.Order)
        .join(models.OrderItem, models.OrderItem.order_id == models.Order.id)
        .join(models.Book, models.Book.id == models.OrderItem.book_id)
        .filter(models.Book.admin_id == current_admin.id)
        .distinct()
        .order_by(models.Order.created_at.desc())
        .all()
    )
    total_orders = len(orders)
    completed_orders = len(
        [order for order in orders if order.status in _DELIVERED_STATUSES]
    )
    pending_orders = len([order for order in orders if order.status == "pending"])
    completed_order_ids = [
        order.id for order in orders if order.status in _DELIVERED_STATUSES
    ]
    total_revenue = 0.0
    if completed_order_ids:
        total_revenue = float(
            db.query(func.coalesce(func.sum(models.OrderItem.price_at_purchase * models.OrderItem.quantity), 0))
            .join(models.Book, models.Book.id == models.OrderItem.book_id)
            .filter(
                models.OrderItem.order_id.in_(completed_order_ids),
                models.Book.admin_id == current_admin.id,
            )
            .scalar()
            or 0
        )

    recent_orders = [
        {
            "id": order.id,
            "total_amount": order.total_amount,
            "status": order.status,
            "created_at": order.created_at,
        }
        for order in orders[:5]
    ]

    return {
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "completed_orders": completed_orders,
        "pending_orders": pending_orders,
        "recent_orders": recent_orders,
    }


@router.get("/stats/users")
async def get_user_stats(
    db: Session = Depends(get_db),
    _: models.User = Depends(check_role("super_admin")),
):
    users = db.query(models.User).order_by(models.User.created_at.desc()).all()
    total_users = len(users)
    active_users = len([user for user in users if bool(user.is_active)])

    recent_cutoff = datetime.utcnow() - timedelta(days=7)
    recent_users = [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "is_active": bool(user.is_active),
            "created_at": user.created_at,
        }
        for user in users
        if user.created_at and user.created_at >= recent_cutoff
    ][:5]

    return {
        "total_users": total_users,
        "active_users": active_users,
        "recent_users": recent_users,
    }


@router.get("/books", response_model=list[schemas.BookOut])
async def get_admin_books(
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin),
):
    return (
        db.query(models.Book)
        .filter(models.Book.admin_id == current_admin.id)
        .order_by(models.Book.id.desc())
        .all()
    )


@router.get("/orders", response_model=list[schemas.OrderOut])
async def get_admin_orders(
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin),
):
    return (
        db.query(models.Order)
        .options(joinedload(models.Order.items))
        .join(models.OrderItem, models.OrderItem.order_id == models.Order.id)
        .join(models.Book, models.Book.id == models.OrderItem.book_id)
        .filter(models.Book.admin_id == current_admin.id)
        .distinct()
        .order_by(models.Order.id.desc())
        .all()
    )


@router.get("/sales-summary")
async def get_admin_sales_summary(
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin),
):
    total_revenue = (
        db.query(func.coalesce(func.sum(models.OrderItem.price_at_purchase * models.OrderItem.quantity), 0))
        .join(models.Order, models.Order.id == models.OrderItem.order_id)
        .join(models.Book, models.Book.id == models.OrderItem.book_id)
        .filter(
            models.Order.status.in_(_DELIVERED_STATUSES),
            models.Book.admin_id == current_admin.id,
        )
        .scalar()
        or 0
    )
    total_books_sold = (
        db.query(func.coalesce(func.sum(models.OrderItem.quantity), 0))
        .join(models.Book, models.Book.id == models.OrderItem.book_id)
        .join(models.Order, models.Order.id == models.OrderItem.order_id)
        .filter(
            models.Order.status.in_(_DELIVERED_STATUSES),
            models.Book.admin_id == current_admin.id,
        )
        .scalar()
        or 0
    )
    return {
        "total_revenue": float(total_revenue),
        "total_books_sold": int(total_books_sold),
    }


@router.get("/stats/overview")
async def get_overview_stats(
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin),
):
    total_books = (
        db.query(func.count(models.Book.id))
        .filter(models.Book.admin_id == current_admin.id)
        .scalar()
        or 0
    )
    total_users = 0
    total_orders = (
        db.query(func.count(func.distinct(models.Order.id)))
        .join(models.OrderItem, models.OrderItem.order_id == models.Order.id)
        .join(models.Book, models.Book.id == models.OrderItem.book_id)
        .filter(models.Book.admin_id == current_admin.id)
        .scalar()
        or 0
    )
    completed_orders = (
        db.query(func.count(func.distinct(models.Order.id)))
        .join(models.OrderItem, models.OrderItem.order_id == models.Order.id)
        .join(models.Book, models.Book.id == models.OrderItem.book_id)
        .filter(
            models.Order.status.in_(_DELIVERED_STATUSES),
            models.Book.admin_id == current_admin.id,
        )
        .scalar()
        or 0
    )
    pending_orders = (
        db.query(func.count(func.distinct(models.Order.id)))
        .join(models.OrderItem, models.OrderItem.order_id == models.Order.id)
        .join(models.Book, models.Book.id == models.OrderItem.book_id)
        .filter(models.Order.status == "pending", models.Book.admin_id == current_admin.id)
        .scalar()
        or 0
    )
    total_revenue = (
        db.query(func.coalesce(func.sum(models.OrderItem.price_at_purchase * models.OrderItem.quantity), 0))
        .join(models.Order, models.Order.id == models.OrderItem.order_id)
        .join(models.Book, models.Book.id == models.OrderItem.book_id)
        .filter(
            models.Order.status.in_(_DELIVERED_STATUSES),
            models.Book.admin_id == current_admin.id,
        )
        .scalar()
        or 0
    )
    active_users = 0

    return {
        "total_books": total_books,
        "total_users": total_users,
        "active_users": active_users,
        "total_orders": total_orders,
        "completed_orders": completed_orders,
        "pending_orders": pending_orders,
        "total_revenue": float(total_revenue),
    }


@router.get("/reviews/book-analytics", response_model=list[schemas.AdminReviewBookRating])
async def admin_book_review_analytics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role("admin", "super_admin")),
):
    q = (
        db.query(
            models.Book.id,
            models.Book.title,
            func.coalesce(func.avg(models.Review.rating), 0.0),
            func.count(models.Review.id),
        )
        .outerjoin(models.Review, models.Review.book_id == models.Book.id)
    )
    if current_user.role == "admin":
        q = q.filter(models.Book.admin_id == current_user.id)
    rows = (
        q.group_by(models.Book.id, models.Book.title).order_by(models.Book.id.desc()).all()
    )
    return [
        schemas.AdminReviewBookRating(
            book_id=int(r[0]),
            title=str(r[1]),
            average_rating=round(float(r[2] or 0), 2),
            review_count=int(r[3] or 0),
        )
        for r in rows
    ]


@router.get("/reviews", response_model=list[schemas.ReviewOut])
async def admin_list_reviews(
    rating: int | None = Query(None, ge=1, le=5),
    book_id: int | None = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role("admin", "super_admin")),
):
    q = (
        db.query(models.Review)
        .options(joinedload(models.Review.user), joinedload(models.Review.book))
        .join(models.Book, models.Book.id == models.Review.book_id)
    )
    if current_user.role == "admin":
        q = q.filter(models.Book.admin_id == current_user.id)
    if rating is not None:
        q = q.filter(models.Review.rating == rating)
    if book_id is not None:
        q = q.filter(models.Review.book_id == book_id)
    reviews = (
        q.options(joinedload(models.Review.replies))
        .order_by(models.Review.created_at.desc())
        .all()
    )
    return [serialize_review(r) for r in reviews]


@router.post(
    "/reviews/{review_id}/reply",
    response_model=schemas.ReviewReplyOut,
    status_code=201,
)
async def admin_reply_to_review(
    review_id: int,
    body: schemas.ReviewReplyCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role("admin", "super_admin")),
):
    review = (
        db.query(models.Review)
        .join(models.Book, models.Book.id == models.Review.book_id)
        .filter(models.Review.id == review_id)
        .first()
    )
    if not review:
        raise HTTPException(status_code=404, detail="Không tìm thấy đánh giá")
    if current_user.role == "admin":
        book = db.query(models.Book).filter(models.Book.id == review.book_id).first()
        if not book or book.admin_id != current_user.id:
            raise HTTPException(status_code=403, detail="Không có quyền trả lời đánh giá này")

    reply = models.ReviewReply(
        review_id=review_id,
        message=body.message.strip(),
        display_name=body.display_name,
    )
    db.add(reply)
    db.commit()
    db.refresh(reply)
    return reply


@router.patch("/orders/{order_id}/status", response_model=schemas.OrderOut)
async def admin_patch_order_status(
    order_id: int,
    body: schemas.AdminOrderStatusPatch,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role("admin", "super_admin")),
):
    if current_user.role == "super_admin":
        order = (
            db.query(models.Order)
            .options(joinedload(models.Order.items))
            .filter(models.Order.id == order_id)
            .first()
        )
    else:
        order = (
            db.query(models.Order)
            .options(joinedload(models.Order.items))
            .join(models.OrderItem, models.OrderItem.order_id == models.Order.id)
            .join(models.Book, models.Book.id == models.OrderItem.book_id)
            .filter(models.Order.id == order_id, models.Book.admin_id == current_user.id)
            .first()
        )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    try:
        set_order_status(db, order, body.status, note=body.note)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    db.commit()
    db.refresh(order)
    return order
