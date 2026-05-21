from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

import models
import schemas
from auth import check_role, get_current_user
from database import get_db

router = APIRouter(prefix="/reviews", tags=["Reviews"])


def serialize_review(review: models.Review) -> schemas.ReviewOut:
    payload = schemas.ReviewOut.model_validate(review, from_attributes=True)
    if review.user:
        payload.user = schemas.ReviewUserBrief.model_validate(review.user, from_attributes=True)
    if getattr(review, "book", None):
        payload.book_title = review.book.title
    if getattr(review, "replies", None):
        payload.replies = [
            schemas.ReviewReplyOut.model_validate(r, from_attributes=True) for r in review.replies
        ]
    return payload


@router.post("", response_model=schemas.ReviewOut, status_code=status.HTTP_201_CREATED)
async def create_review(
    body: schemas.ReviewCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    book = db.query(models.Book).filter(models.Book.id == body.book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    review = models.Review(
        user_id=current_user.id,
        book_id=body.book_id,
        rating=body.rating,
        comment=body.comment.strip(),
    )
    db.add(review)
    db.commit()
    review = (
        db.query(models.Review)
        .options(joinedload(models.Review.user))
        .filter(models.Review.id == review.id)
        .first()
    )
    return serialize_review(review)


@router.put("/{review_id}", response_model=schemas.ReviewOut)
async def update_review(
    review_id: int,
    body: schemas.ReviewUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    review = (
        db.query(models.Review)
        .options(joinedload(models.Review.user))
        .filter(models.Review.id == review_id)
        .first()
    )
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only edit your own reviews")

    review.rating = body.rating
    review.comment = body.comment.strip()
    db.commit()
    review = (
        db.query(models.Review)
        .options(joinedload(models.Review.user))
        .filter(models.Review.id == review_id)
        .first()
    )
    return serialize_review(review)


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    review = db.query(models.Review).filter(models.Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if review.user_id != current_user.id and current_user.role not in {"admin", "super_admin"}:
        raise HTTPException(status_code=403, detail="You can only delete your own reviews")

    db.delete(review)
    db.commit()
