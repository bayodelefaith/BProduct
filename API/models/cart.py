from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from .user import User
    from .product import Product


class CartItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    quantity: int = Field(default=1)

    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    product_id: Optional[int] = Field(default=None, foreign_key="product.id")

    user: Optional["User"] = Relationship(back_populates="cart_items")
    product: Optional["Product"] = Relationship(back_populates="cart_items")


class CartItemCreate(SQLModel):
    product_id: int
    quantity: int


class CartItemRead(SQLModel):
    id: int
    quantity: int
    product_id: int
    user_id: int


class CartItemUpdate(SQLModel):
    quantity: int