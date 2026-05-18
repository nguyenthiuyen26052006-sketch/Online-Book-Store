from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

import models, schemas
from auth import get_current_super_admin
from database import get_db

router = APIRouter(prefix="/super-admin", tags=["Super Admin"])

_DELIVERED = ("delivered", "completed")


class SuperAdminRoleUpdate(BaseModel):
    role: str


@router.get("/dashboard", response_model=schemas.SuperAdminDashboardOut)
async def get_super_admin_dashboard(
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_super_admin),
):
    total_revenue = float(
        db.query(func.coalesce(func.sum(models.Order.total_amount), 0))
        .filter(models.Order.status.in_(_DELIVERED))
        .scalar()
        or 0
    )
    total_orders = db.query(func.count(models.Order.id)).scalar() or 0
    pending_orders = (
        db.query(func.count(models.Order.id))
        .filter(models.Order.status == "pending")
        .scalar()
        or 0
    )
    delivered_orders = (
        db.query(func.count(models.Order.id))
        .filter(models.Order.status.in_(_DELIVERED))
        .scalar()
        or 0
    )
    total_users = db.query(func.count(models.User.id)).scalar() or 0
    cutoff_30d = datetime.utcnow() - timedelta(days=30)
    new_users_30d = (
        db.query(func.count(models.User.id))
        .filter(models.User.created_at >= cutoff_30d)
        .scalar()
        or 0
    )
    total_books = db.query(func.count(models.Book.id)).scalar() or 0
    total_reviews = db.query(func.count(models.Review.id)).scalar() or 0

    top_selling = (
        db.query(
            models.Book.id,
            models.Book.title,
            models.Book.uuid,
            func.coalesce(func.sum(models.OrderItem.quantity), 0).label("sold"),
            models.Book.price,
        )
        .outerjoin(models.OrderItem, models.OrderItem.book_id == models.Book.id)
        .group_by(models.Book.id, models.Book.title, models.Book.uuid, models.Book.price)
        .order_by(func.coalesce(func.sum(models.OrderItem.quantity), 0).desc())
        .limit(8)
        .all()
    )
    most_reviewed = (
        db.query(
            models.Book.id,
            models.Book.title,
            models.Book.uuid,
            func.count(models.Review.id).label("review_count"),
        )
        .outerjoin(models.Review, models.Review.book_id == models.Book.id)
        .group_by(models.Book.id, models.Book.title, models.Book.uuid)
        .order_by(func.count(models.Review.id).desc())
        .limit(8)
        .all()
    )

    sales_by_day_rows = (
        db.query(
            func.date(models.Order.created_at).label("day"),
            func.count(models.Order.id).label("orders"),
            func.coalesce(func.sum(models.Order.total_amount), 0).label("revenue"),
        )
        .filter(
            models.Order.status.in_(_DELIVERED),
            models.Order.created_at >= datetime.utcnow() - timedelta(days=14),
        )
        .group_by(func.date(models.Order.created_at))
        .order_by(func.date(models.Order.created_at))
        .all()
    )
    sales_by_month_rows = (
        db.query(
            func.date_format(models.Order.created_at, "%Y-%m").label("month"),
            func.count(models.Order.id).label("orders"),
            func.coalesce(func.sum(models.Order.total_amount), 0).label("revenue"),
        )
        .filter(models.Order.status.in_(_DELIVERED))
        .group_by(func.date_format(models.Order.created_at, "%Y-%m"))
        .order_by(func.date_format(models.Order.created_at, "%Y-%m"))
        .limit(12)
        .all()
    )

    recent_orders = (
        db.query(models.Order)
        .options(joinedload(models.Order.items))
        .order_by(models.Order.created_at.desc())
        .limit(8)
        .all()
    )

    recent_activities: list[dict] = []
    for order in recent_orders[:5]:
        recent_activities.append(
            {
                "type": "order",
                "id": order.id,
                "label": f"Đơn hàng #{order.id}",
                "detail": f"{order.status} · {float(order.total_amount):,.0f}đ",
                "at": order.created_at.isoformat() if order.created_at else None,
            }
        )
    recent_reviews = (
        db.query(models.Review)
        .options(joinedload(models.Review.book))
        .order_by(models.Review.created_at.desc())
        .limit(5)
        .all()
    )
    for rev in recent_reviews:
        recent_activities.append(
            {
                "type": "review",
                "id": rev.id,
                "label": f"Đánh giá mới · {rev.rating}★",
                "detail": rev.book.title if rev.book else f"Sách #{rev.book_id}",
                "at": rev.created_at.isoformat() if rev.created_at else None,
            }
        )
    recent_activities.sort(key=lambda x: x.get("at") or "", reverse=True)
    recent_activities = recent_activities[:10]

    return schemas.SuperAdminDashboardOut(
        total_revenue=total_revenue,
        total_orders=int(total_orders),
        pending_orders=int(pending_orders),
        delivered_orders=int(delivered_orders),
        total_users=int(total_users),
        new_users_30d=int(new_users_30d),
        total_books=int(total_books),
        total_reviews=int(total_reviews),
        top_selling_books=[
            {
                "book_id": r[0],
                "uuid": r[2],
                "title": r[1],
                "sold": int(r[3] or 0),
                "price": float(r[4] or 0),
            }
            for r in top_selling
        ],
        most_reviewed_books=[
            {
                "book_id": r[0],
                "uuid": r[2],
                "title": r[1],
                "review_count": int(r[3] or 0),
            }
            for r in most_reviewed
        ],
        sales_by_day=[
            {
                "day": str(r[0]),
                "orders": int(r[1]),
                "revenue": float(r[2] or 0),
            }
            for r in sales_by_day_rows
        ],
        sales_by_month=[
            {
                "month": str(r[0]),
                "orders": int(r[1]),
                "revenue": float(r[2] or 0),
            }
            for r in sales_by_month_rows
        ],
        recent_orders=[
            {
                "id": o.id,
                "total_amount": float(o.total_amount),
                "status": o.status,
                "created_at": o.created_at.isoformat() if o.created_at else None,
                "item_count": len(o.items),
            }
            for o in recent_orders
        ],
        recent_activities=recent_activities,
    )


@router.get("/orders", response_model=list[schemas.OrderOut])
async def get_all_orders_super_admin(
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_super_admin),
):
    return (
        db.query(models.Order)
        .options(joinedload(models.Order.items))
        .order_by(models.Order.id.desc())
        .all()
    )


@router.get("/users", response_model=list[schemas.UserOut])
async def get_all_users_super_admin(
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_super_admin),
):
    return db.query(models.User).order_by(models.User.id.desc()).all()


@router.put("/users/{user_id}/role", response_model=schemas.UserOut)
async def update_user_role_super_admin(
    user_id: int,
    role_data: SuperAdminRoleUpdate,
    db: Session = Depends(get_db),
    current_super_admin: models.User = Depends(get_current_super_admin),
):
    """
    Update user role - Super Admin only.
    Super Admin cannot change their own role for security reasons.
    """
    # Prevent self-role change
    if user_id == current_super_admin.id:
        raise HTTPException(
            status_code=403,
            detail="Super admin không thể đổi vai trò của chính mình vì lý do bảo mật",
        )
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")

    new_role = role_data.role
    if new_role not in ["user", "admin", "super_admin"]:
        raise HTTPException(status_code=400, detail="Vai trò không hợp lệ")

    # Prevent downgrading the only super admin
    if user.role == "super_admin" and new_role != "super_admin":
        super_admin_count = db.query(models.User).filter(models.User.role == "super_admin").count()
        if super_admin_count == 1:
            raise HTTPException(
                status_code=400,
                detail="Không thể xóa vai trò Super Admin cuối cùng. Hệ thống phải có ít nhất một Super Admin.",
            )

    user.role = new_role
    db.commit()
    db.refresh(user)
    return user


# Category Management Endpoints - Super Admin Only
@router.get("/categories", response_model=list[schemas.CategoryOut])
async def get_all_categories_super_admin(
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_super_admin),
):
    """Get all categories - Super Admin only"""
    return db.query(models.Category).order_by(models.Category.name.asc()).all()


@router.post(
    "/categories", response_model=schemas.CategoryOut, status_code=201
)
async def create_category_super_admin(
    category_data: schemas.CategoryCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_super_admin),
):
    """Create a new category - Super Admin only"""
    import re
    import unicodedata

    def make_slug(text: str) -> str:
        normalized = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode(
            "ascii"
        )
        cleaned = re.sub(r"[^a-zA-Z0-9\s-]", "", normalized).strip().lower()
        return re.sub(r"[\s-]+", "-", cleaned)

    slug = make_slug(category_data.name)
    existing_slug = db.query(models.Category).filter(models.Category.slug == slug).first()
    if existing_slug:
        raise HTTPException(status_code=400, detail="Danh mục đã tồn tại")

    category = models.Category(
        id=slug,
        name=category_data.name.strip(),
        slug=slug,
        description=category_data.description,
        image=category_data.image,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.put(
    "/categories/{category_id}", response_model=schemas.CategoryOut
)
async def update_category_super_admin(
    category_id: str,
    category_data: schemas.CategoryUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_super_admin),
):
    """Update a category - Super Admin only"""
    import re
    import unicodedata

    def make_slug(text: str) -> str:
        normalized = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode(
            "ascii"
        )
        cleaned = re.sub(r"[^a-zA-Z0-9\s-]", "", normalized).strip().lower()
        return re.sub(r"[\s-]+", "-", cleaned)

    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Không tìm thấy danh mục")

    update_data = category_data.model_dump(exclude_unset=True)
    if "name" in update_data:
        new_name = update_data["name"].strip()
        new_slug = make_slug(new_name)
        existing_slug = (
            db.query(models.Category)
            .filter(models.Category.slug == new_slug, models.Category.id != category_id)
            .first()
        )
        if existing_slug:
            raise HTTPException(status_code=400, detail="Danh mục đã tồn tại")
        category.id = new_slug
        category.slug = new_slug
        category.name = new_name
        # Keep existing books mapped to renamed category.
        db.query(models.Book).filter(models.Book.category_id == category_id).update(
            {models.Book.category_id: new_slug}
        )
    if "description" in update_data:
        category.description = update_data["description"]
    if "image" in update_data:
        category.image = update_data["image"]

    db.commit()
    db.refresh(category)
    return category


@router.delete(
    "/categories/{category_id}", status_code=204
)
async def delete_category_super_admin(
    category_id: str,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_super_admin),
):
    """Delete a category - Super Admin only"""
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Không tìm thấy danh mục")

    books_using_category = (
        db.query(models.Book).filter(models.Book.category_id == category_id).count()
    )
    if books_using_category > 0:
        raise HTTPException(
            status_code=400,
            detail="Không thể xóa danh mục đang được sử dụng bởi các sách",
        )

    db.delete(category)
    db.commit()
