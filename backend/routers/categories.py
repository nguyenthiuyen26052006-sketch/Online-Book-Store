import re
import unicodedata
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import models, schemas
from auth import get_current_super_admin
from database import get_db

router = APIRouter(prefix="/categories", tags=["Categories"])


def make_slug(text: str) -> str:
    normalized = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode(
        "ascii"
    )
    cleaned = re.sub(r"[^a-zA-Z0-9\s-]", "", normalized).strip().lower()
    return re.sub(r"[\s-]+", "-", cleaned)


@router.get("", response_model=List[schemas.CategoryOut])
async def get_all_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).order_by(models.Category.name.asc()).all()


@router.get("/{category_id}", response_model=schemas.CategoryOut)
async def get_category_by_id(category_id: str, db: Session = Depends(get_db)):
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.post(
    "/", response_model=schemas.CategoryOut, status_code=status.HTTP_201_CREATED
)
async def create_category(
    category_data: schemas.CategoryCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_super_admin),
):
    slug = make_slug(category_data.name)
    existing_slug = db.query(models.Category).filter(models.Category.slug == slug).first()
    if existing_slug:
        raise HTTPException(status_code=400, detail="Category already exists")

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


@router.put("/{category_id}", response_model=schemas.CategoryOut)
async def update_category(
    category_id: str,
    category_data: schemas.CategoryUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_super_admin),
):
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

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
            raise HTTPException(status_code=400, detail="Category already exists")
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


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: str,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_super_admin)
):
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    books_using_category = (
        db.query(models.Book).filter(models.Book.category_id == category_id).count()
    )
    if books_using_category > 0:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete category that is used by books",
        )

    db.delete(category)
    db.commit()
