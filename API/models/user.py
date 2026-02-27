from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Session, create_engine, Relationship
from fastapi import Depends
from typing import Annotated

if TYPE_CHECKING:
    from .post import Post
    from .product import Product
    from .cart import CartItem
    from .order import Order
    from .review import Review
    from .comment import Comment

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str = Field(index=True, unique=True)
    hashed_password: str
    is_admin: bool = Field(default=False)
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    
    # Relations
    posts: List["Post"] = Relationship(back_populates="user")
    products: List["Product"] = Relationship(back_populates="user")
    cart_items: List["CartItem"] = Relationship(back_populates="user")
    orders: List["Order"] = Relationship(back_populates="user")
    reviews: List["Review"] = Relationship(back_populates="user")
    comments: List["Comment"] = Relationship(back_populates="user")


class UserCreate(SQLModel):
    name: str
    email: str
    password: str


class UserUpdate(SQLModel):
    name: Optional[str] = None
    bio: Optional[str] = None

class UserRead(SQLModel):
    id: int
    name: str
    email: str
    is_admin: bool
    bio: Optional[str]
    avatar_url: Optional[str]


class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]