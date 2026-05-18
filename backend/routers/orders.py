from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

import models
import schemas
from auth import check_role, get_current_user
from database import get_db
from order_utils import append_order_history, normalize_order_status, set_order_status

router = APIRouter(prefix="/orders", tags=["Orders"])


def _order_allowed(db: Session, order_id: int, user: models.User) -> models.Order | None:
    order = (
        db.query(models.Order)
        .options(joinedload(models.Order.items))
        .filter(models.Order.id == order_id)
        .first()
    )
    if not order:
        return None
    if user.role == "super_admin":
        return order
    if order.user_id == user.id:
        return order
    if user.role == "admin":
        linked = (
            db.query(models.Order.id)
            .join(models.OrderItem, models.OrderItem.order_id == models.Order.id)
            .join(models.Book, models.Book.id == models.OrderItem.book_id)
            .filter(models.Order.id == order_id, models.Book.admin_id == user.id)
            .first()
        )
        return order if linked else None
    return None


@router.post("", response_model=schemas.OrderOut, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: schemas.OrderCreateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if order_data.items:
        cart_items = []
        for raw_item in order_data.items:
            book = db.query(models.Book).filter(models.Book.id == raw_item.book_id).first()
            if not book:
                raise HTTPException(status_code=404, detail="Book not found")

            temp_item = models.CartItem(
                user_id=current_user.id,
                book_id=book.id,
                quantity=raw_item.quantity,
            )
            temp_item.book = book
            cart_items.append(temp_item)
    else:
        cart_items = (
            db.query(models.CartItem)
            .filter(models.CartItem.user_id == current_user.id)
            .all()
        )
        if not cart_items:
            raise HTTPException(status_code=400, detail="Cart is empty")

    valid_cart_items = []
    total = 0.0
    for item in cart_items:
        if not item.book:
            if item.id:
                db.delete(item)
            continue
        if item.book.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Not enough stock for '{item.book.title}'",
            )
        valid_cart_items.append(item)
        total += item.book.price * item.quantity

    if not valid_cart_items:
        db.commit()
        raise HTTPException(
            status_code=400,
            detail="Cart has no valid items. Please refresh your cart.",
        )

    order = models.Order(
        user_id=current_user.id,
        total_amount=total,
        status="pending",
        shipping_address=order_data.shipping_address,
        phone=order_data.phone,
        payment_method=order_data.payment_method,
        note=order_data.note,
    )
    db.add(order)
    db.flush()

    append_order_history(db, order.id, "pending", note="Order placed")

    # Create order items and reduce stock
    ordered_book_ids = []
    for item in valid_cart_items:
        order_item = models.OrderItem(
            order_id=order.id,
            book_id=item.book_id,
            title=item.book.title,
            image=item.book.image,
            quantity=item.quantity,
            price_at_purchase=item.book.price,
        )
        db.add(order_item)
        item.book.stock -= item.quantity
        ordered_book_ids.append(item.book_id)

    if ordered_book_ids:
        db.query(models.CartItem).filter(
            models.CartItem.user_id == current_user.id,
            models.CartItem.book_id.in_(ordered_book_ids)
        ).delete(synchronize_session=False)

    db.commit()
    db.refresh(order)
    order = (
        db.query(models.Order)
        .options(joinedload(models.Order.items))
        .filter(models.Order.id == order.id)
        .first()
    )
    return order


@router.get("/", response_model=List[schemas.OrderOut])
@router.get("/me", response_model=List[schemas.OrderOut])
async def get_my_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.Order)
        .options(joinedload(models.Order.items))
        .filter(models.Order.user_id == current_user.id)
        .order_by(models.Order.id.desc())
        .all()
    )


@router.get("/all", response_model=List[schemas.OrderOut])
async def get_all_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role("admin", "super_admin")),
):
    if current_user.role == "super_admin":
        return (
            db.query(models.Order)
            .options(joinedload(models.Order.items))
            .order_by(models.Order.id.desc())
            .all()
        )

    return (
        db.query(models.Order)
        .options(joinedload(models.Order.items))
        .join(models.OrderItem, models.OrderItem.order_id == models.Order.id)
        .join(models.Book, models.Book.id == models.OrderItem.book_id)
        .filter(models.Book.admin_id == current_user.id)
        .distinct()
        .order_by(models.Order.id.desc())
        .all()
    )


@router.get("/{order_id}/tracking", response_model=schemas.OrderTrackingOut)
async def get_order_tracking(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    order = _order_allowed(db, order_id, current_user)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    history_rows = (
        db.query(models.OrderStatusHistory)
        .filter(models.OrderStatusHistory.order_id == order_id)
        .order_by(models.OrderStatusHistory.changed_at.asc())
        .all()
    )
    return schemas.OrderTrackingOut(
        order_id=order_id,
        current_status=normalize_order_status(order.status),
        history=[schemas.OrderStatusHistoryOut.model_validate(h, from_attributes=True) for h in history_rows],
    )


@router.get("/{order_id}", response_model=schemas.OrderDetailOut)
async def get_order_detail(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    order = _order_allowed(db, order_id, current_user)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.put("/{order_id}/status", response_model=schemas.OrderOut)
async def update_order_status(
    order_id: int,
    status_payload: schemas.OrderStatusUpdate,
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
        set_order_status(db, order, status_payload.status, note=status_payload.note)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    db.commit()
    db.refresh(order)
    return order
