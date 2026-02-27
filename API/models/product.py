from typing import Optional, TYPE_CHECKING, List
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from .user import User
    from .cart import CartItem
    from .order import OrderItem
    from .review import Review

class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: str
    price: float
    quantity: int
    image_path: str  # stores the path/filename of the uploaded image
    category: Optional[str] = None

    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    user: Optional["User"] = Relationship(back_populates="products")
    cart_items: List["CartItem"] = Relationship(back_populates="product")
    order_items: List["OrderItem"] = Relationship(back_populates="product")
    reviews: List["Review"] = Relationship(back_populates="product")


class ProductCreate(SQLModel):
    name: str
    description: str
    price: float
    category: Optional[str] = None


class ProductRead(SQLModel):
    id: int
    name: str
    description: str
    price: float
    image_path: str
    category: Optional[str]
    user_id: int