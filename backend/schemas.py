from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


class UserRegister(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6, max_length=100)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    role: str = "user"
    is_active: int = 1
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class CategoryCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    description: Optional[str] = Field(default=None, max_length=500)
    image: Optional[str] = None


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=120)
    description: Optional[str] = Field(default=None, max_length=500)
    image: Optional[str] = None


class CategoryOut(BaseModel):
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    image: Optional[str] = None

    class Config:
        from_attributes = True


class BookCreate(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    author: str = Field(min_length=2, max_length=120)
    description: Optional[str] = Field(default=None, max_length=500)
    price: float = Field(gt=0)
    image: Optional[str] = None
    category_id: Optional[str] = None
    stock: int = Field(default=0, ge=0)


class BookUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=2, max_length=200)
    author: Optional[str] = Field(default=None, min_length=2, max_length=120)
    description: Optional[str] = Field(default=None, max_length=500)
    price: Optional[float] = Field(default=None, gt=0)
    image: Optional[str] = None
    category_id: Optional[str] = None
    stock: Optional[int] = Field(default=None, ge=0)


class BookOut(BaseModel):
    id: int
    uuid: str
    title: str
    slug: str
    author: str
    description: Optional[str] = None
    price: float
    image: Optional[str] = None
    category_id: Optional[str] = None
    stock: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CartItemCreate(BaseModel):
    book_id: int
    quantity: int = Field(default=1, ge=1)


class CartItemUpdate(BaseModel):
    quantity: int = Field(ge=1)


class CartItemOut(BaseModel):
    id: int
    quantity: int
    book: BookOut

    class Config:
        from_attributes = True


class OrderItemOut(BaseModel):
    id: int
    book_id: int
    title: str
    image: Optional[str] = None
    quantity: int
    price_at_purchase: float

    class Config:
        from_attributes = True


class OrderOut(BaseModel):
    id: int
    total_amount: float
    status: str
    shipping_address: Optional[str] = None
    phone: Optional[str] = None
    payment_method: Optional[str] = None
    note: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemOut]

    @field_validator("status", mode="before")
    @classmethod
    def normalize_order_status_field(cls, value: object) -> object:
        from order_utils import normalize_order_status

        if isinstance(value, str):
            return normalize_order_status(value)
        return value

    class Config:
        from_attributes = True


class OrderCreateItem(BaseModel):
    book_id: int
    quantity: int = Field(default=1, ge=1)


class OrderCreateRequest(BaseModel):
    shipping_address: str
    phone: str
    payment_method: str
    note: Optional[str] = None
    items: Optional[List[OrderCreateItem]] = None


class OrderStatusUpdate(BaseModel):
    status: str
    note: Optional[str] = None


class OrderStatusHistoryOut(BaseModel):
    id: int
    status: str
    changed_at: datetime
    note: Optional[str] = None

    @field_validator("status", mode="before")
    @classmethod
    def normalize_history_status(cls, value: object) -> object:
        from order_utils import normalize_order_status

        if isinstance(value, str):
            return normalize_order_status(value)
        return value

    class Config:
        from_attributes = True


class OrderDetailOut(OrderOut):
    """Same shape as OrderOut; separate type for OpenAPI clarity on detail routes."""

    pass


class OrderTrackingOut(BaseModel):
    order_id: int
    current_status: str
    history: List["OrderStatusHistoryOut"]


class ReviewUserBrief(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class ReviewReplyOut(BaseModel):
    id: int
    review_id: int
    message: str
    display_name: str
    created_at: datetime

    class Config:
        from_attributes = True


class ReviewReplyCreate(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    display_name: str = Field(default="Book Store")

    @field_validator("display_name")
    @classmethod
    def validate_display_name(cls, value: str) -> str:
        allowed = {"Book Store", "Seller", "Shop Admin"}
        if value not in allowed:
            raise ValueError("display_name must be one of: Book Store, Seller, Shop Admin")
        return value


class ReviewOut(BaseModel):
    id: int
    user_id: int
    book_id: int
    rating: int
    comment: str
    created_at: datetime
    updated_at: datetime
    user: Optional[ReviewUserBrief] = None
    book_title: Optional[str] = None
    replies: List["ReviewReplyOut"] = []

    class Config:
        from_attributes = True


class ReviewCreate(BaseModel):
    book_id: int
    rating: int = Field(ge=1, le=5)
    comment: str = Field(min_length=1, max_length=8000)


class ReviewUpdate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str = Field(min_length=1, max_length=8000)


class AdminReviewBookRating(BaseModel):
    book_id: int
    title: str
    average_rating: float
    review_count: int


class AdminOrderStatusPatch(BaseModel):
    status: str
    note: Optional[str] = None


class SuperAdminDashboardOut(BaseModel):
    total_revenue: float
    total_orders: int
    pending_orders: int
    delivered_orders: int
    total_users: int
    new_users_30d: int
    total_books: int
    total_reviews: int
    top_selling_books: List[dict]
    most_reviewed_books: List[dict]
    sales_by_day: List[dict]
    sales_by_month: List[dict]
    recent_orders: List[dict]
    recent_activities: List[dict]
