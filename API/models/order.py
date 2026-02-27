from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime, timezone

if TYPE_CHECKING:
    from .user import User
    from .product import Product


class Order(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    total_price: float
    status: str = Field(default="pending")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    user: Optional["User"] = Relationship(back_populates="orders")
    items: List["OrderItem"] = Relationship(back_populates="order")


class OrderItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    order_id: Optional[int] = Field(default=None, foreign_key="order.id")
    product_id: Optional[int] = Field(default=None, foreign_key="product.id")
    quantity: int
    price: float

    order: Optional["Order"] = Relationship(back_populates="items")
    product: Optional["Product"] = Relationship(back_populates="order_items")


class OrderItemCreate(SQLModel):
    product_id: int
    quantity: int


class OrderCreate(SQLModel):
    pass


class OrderItemRead(SQLModel):
    id: int
    order_id: int
    product_id: int
    quantity: int
    price: float


class OrderRead(SQLModel):
    id: int
    user_id: int
    total_price: float
    status: str
    created_at: datetime
    items: List[OrderItemRead] = []