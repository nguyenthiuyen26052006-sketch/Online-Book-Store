from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import models, schemas
from auth import get_current_user
from database import get_db

router = APIRouter(prefix="/cart", tags=["Cart"])


@router.get("", response_model=List[schemas.CartItemOut])
async def get_my_cart(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.CartItem)
        .filter(models.CartItem.user_id == current_user.id)
        .all()
    )


@router.post("", response_model=schemas.CartItemOut, status_code=status.HTTP_201_CREATED)
async def add_to_cart(
    item_data: schemas.CartItemCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    book = db.query(models.Book).filter(models.Book.id == item_data.book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    if book.stock < item_data.quantity:
        raise HTTPException(status_code=400, detail="Not enough stock")

    cart_item = (
        db.query(models.CartItem)
        .filter(
            models.CartItem.user_id == current_user.id,
            models.CartItem.book_id == item_data.book_id,
        )
        .first()
    )

    if cart_item:
        new_quantity = cart_item.quantity + item_data.quantity
        if new_quantity > book.stock:
            raise HTTPException(status_code=400, detail="Not enough stock")
        cart_item.quantity = new_quantity
    else:
        cart_item = models.CartItem(
            user_id=current_user.id,
            book_id=item_data.book_id,
            quantity=item_data.quantity,
        )
        db.add(cart_item)

    db.commit()
    db.refresh(cart_item)
    return cart_item


@router.put("/{cart_item_id}", response_model=schemas.CartItemOut)
async def update_cart_quantity(
    cart_item_id: int,
    item_data: schemas.CartItemUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    cart_item = (
        db.query(models.CartItem)
        .filter(
            models.CartItem.id == cart_item_id,
            models.CartItem.user_id == current_user.id,
        )
        .first()
    )
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    if cart_item.book.stock < item_data.quantity:
        raise HTTPException(status_code=400, detail="Not enough stock")

    cart_item.quantity = item_data.quantity
    db.commit()
    db.refresh(cart_item)
    return cart_item


@router.delete("/{cart_item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_cart(
    cart_item_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    cart_item = (
        db.query(models.CartItem)
        .filter(
            models.CartItem.id == cart_item_id,
            models.CartItem.user_id == current_user.id,
        )
        .first()
    )
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    db.delete(cart_item)
    db.commit()
