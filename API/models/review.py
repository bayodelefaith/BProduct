from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime, timezone

if TYPE_CHECKING:
    from .user import User
    from .product import Product

class Review(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    product_id: Optional[int] = Field(default=None, foreign_key="product.id")

    user: Optional["User"] = Relationship(back_populates="reviews")
    product: Optional["Product"] = Relationship(back_populates="reviews")

class ReviewCreate(SQLModel):
    rating: int
    comment: Optional[str] = None
    product_id: int

class ReviewRead(SQLModel):
    id: int
    rating: int
    comment: Optional[str]
    created_at: datetime
    user_id: int
    product_id: int
