from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload

import models, schemas
from auth import (
    check_role,
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from database import get_db
from routers.reviews import serialize_review

router = APIRouter(prefix="/users", tags=["Users"])


class UserProfileUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    address: str | None = None


class UserRoleUpdate(BaseModel):
    role: str


@router.post("/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: schemas.UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = models.User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/login", response_model=schemas.Token)
async def login_user(user_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is inactive")

    # 'sub' stores the user id in JWT payload.
    token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.UserOut)
async def get_my_profile(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.get("/{user_id}/reviews", response_model=list[schemas.ReviewOut])
async def list_user_reviews(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.id != user_id and current_user.role not in {"admin", "super_admin"}:
        raise HTTPException(status_code=403, detail="Not allowed to view these reviews")
    reviews = (
        db.query(models.Review)
        .options(joinedload(models.Review.user))
        .filter(models.Review.user_id == user_id)
        .order_by(models.Review.created_at.desc())
        .all()
    )
    return [serialize_review(r) for r in reviews]


@router.put("/me", response_model=schemas.UserOut)
async def update_my_profile(
    profile_data: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    data = profile_data.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/all", response_model=list[schemas.UserOut])
async def get_all_users(
    db: Session = Depends(get_db),
    _: models.User = Depends(check_role("super_admin")),
):
    return db.query(models.User).order_by(models.User.id.desc()).all()


@router.put("/{user_id}/role", response_model=schemas.UserOut)
async def update_user_role(
    user_id: int,
    role_data: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role("super_admin")),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Super admin cannot change their own role",
        )
    if role_data.role not in ["user", "admin", "super_admin"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    user.role = role_data.role
    db.commit()
    db.refresh(user)
    return user


@router.put("/{user_id}/active", response_model=schemas.UserOut)
async def toggle_user_active(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role("super_admin")),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Super admin cannot deactivate their own account",
        )
    user.is_active = 0 if user.is_active else 1
    db.commit()
    db.refresh(user)
    return user
