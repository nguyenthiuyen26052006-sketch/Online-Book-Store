import re
import unicodedata
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

import models, schemas
from auth import check_role, get_current_admin
from database import get_db
from routers.reviews import serialize_review

router = APIRouter(prefix="/books", tags=["Books"])


def make_slug(text: str) -> str:
    # Beginner-friendly slug generator for URL paths.
    normalized = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode(
        "ascii"
    )
    cleaned = re.sub(r"[^a-zA-Z0-9\s-]", "", normalized).strip().lower()
    return re.sub(r"[\s-]+", "-", cleaned)


@router.get("", response_model=List[schemas.BookOut])
async def get_all_books(
    search: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(models.Book)

    # Simple search on title or author.
    if search:
        query = query.filter(
            (models.Book.title.ilike(f"%{search}%"))
            | (models.Book.author.ilike(f"%{search}%"))
        )

    return query.order_by(models.Book.id.desc()).all()


@router.get("/admin/mine", response_model=List[schemas.BookOut])
async def get_my_books(
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin),
):
    return (
        db.query(models.Book)
        .filter(models.Book.admin_id == current_admin.id)
        .order_by(models.Book.id.desc())
        .all()
    )


@router.get("/admin/list", response_model=List[schemas.BookOut])
async def get_books_for_admin_or_super_admin(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role("admin", "super_admin")),
):
    query = db.query(models.Book)
    if current_user.role == "admin":
        query = query.filter(models.Book.admin_id == current_user.id)
    return query.order_by(models.Book.id.desc()).all()


@router.get("/uuid/{book_uuid}", response_model=schemas.BookOut)
async def get_book_by_uuid(book_uuid: str, db: Session = Depends(get_db)):
    book = db.query(models.Book).filter(models.Book.uuid == book_uuid).first()
    if not book:
        raise HTTPException(status_code=404, detail="Không tìm thấy sách")
    return book


@router.get("/slug/{slug}", response_model=schemas.BookOut)
async def get_book_by_slug(slug: str, db: Session = Depends(get_db)):
    """Optional SEO lookup by slug; primary route uses UUID."""
    book = db.query(models.Book).filter(models.Book.slug == slug).first()
    if not book:
        raise HTTPException(status_code=404, detail="Không tìm thấy sách")
    return book


@router.get("/{book_id}/reviews", response_model=list[schemas.ReviewOut])
async def list_book_reviews(book_id: int, db: Session = Depends(get_db)):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    reviews = (
        db.query(models.Review)
        .options(
            joinedload(models.Review.user),
            joinedload(models.Review.book),
            joinedload(models.Review.replies),
        )
        .filter(models.Review.book_id == book_id)
        .order_by(models.Review.created_at.desc())
        .all()
    )
    return [serialize_review(r) for r in reviews]


@router.get("/{book_id}/sold-count")
async def get_book_sold_count(book_id: int, db: Session = Depends(get_db)):
    """Get the total quantity of a book that has been sold (from completed/delivered orders)."""
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    sold_count = (
        db.query(func.coalesce(func.sum(models.OrderItem.quantity), 0))
        .join(models.Order, models.Order.id == models.OrderItem.order_id)
        .filter(
            models.OrderItem.book_id == book_id,
            models.Order.status.in_(("delivered", "completed"))
        )
        .scalar()
    )
    return {"book_id": book_id, "sold": int(sold_count or 0)}


@router.get("/{book_id}", response_model=schemas.BookOut)
async def get_book_details(book_id: int, db: Session = Depends(get_db)):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


@router.post("/", response_model=schemas.BookOut, status_code=status.HTTP_201_CREATED)
async def add_book(
    book_data: schemas.BookCreate,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin),
):
    if book_data.category_id:
        category = (
            db.query(models.Category)
            .filter(models.Category.id == book_data.category_id)
            .first()
        )
        if not category:
            raise HTTPException(status_code=400, detail="Invalid category")

    slug = make_slug(book_data.title)
    existing = db.query(models.Book).filter(models.Book.slug == slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Book slug already exists")

    data = book_data.model_dump()
    data["slug"] = slug
    data["uuid"] = str(uuid.uuid4())
    data["admin_id"] = current_admin.id
    if not data.get("image"):
        data["image"] = "/placeholder.svg"
    new_book = models.Book(**data)
    db.add(new_book)
    db.commit()
    db.refresh(new_book)
    return new_book


@router.put("/{book_id}", response_model=schemas.BookOut)
async def update_book(
    book_id: int,
    book_data: schemas.BookUpdate,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin),
):
    book = (
        db.query(models.Book)
        .filter(models.Book.id == book_id, models.Book.admin_id == current_admin.id)
        .first()
    )
    if not book:
        raise HTTPException(status_code=404, detail="Book not found for this admin")

    update_data = book_data.model_dump(exclude_unset=True)
    if "category_id" in update_data and update_data["category_id"]:
        category = (
            db.query(models.Category)
            .filter(models.Category.id == update_data["category_id"])
            .first()
        )
        if not category:
            raise HTTPException(status_code=400, detail="Invalid category")
    if "title" in update_data:
        new_slug = make_slug(update_data["title"])
        existing = (
            db.query(models.Book)
            .filter(models.Book.slug == new_slug, models.Book.id != book_id)
            .first()
        )
        if existing:
            raise HTTPException(status_code=400, detail="Book slug already exists")
        update_data["slug"] = new_slug
    for field, value in update_data.items():
        setattr(book, field, value)

    db.commit()
    db.refresh(book)
    return book


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_book(
    book_id: int,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin),
):
    book = (
        db.query(models.Book)
        .filter(models.Book.id == book_id, models.Book.admin_id == current_admin.id)
        .first()
    )
    if not book:
        raise HTTPException(status_code=404, detail="Book not found for this admin")

    db.delete(book)
    db.commit()
