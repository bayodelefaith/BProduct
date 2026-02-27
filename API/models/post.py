from typing import Optional, TYPE_CHECKING, List
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from .user import User  # only imported for type checking, not at runtime
    from .comment import Comment

class Post(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    content: str
    category: Optional[str] = None
    likes: int = Field(default=0)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")

    # Relationship
    user: Optional["User"] = Relationship(back_populates="posts")
    comments: List["Comment"] = Relationship(back_populates="post")

class PostCreate(SQLModel):
    title: str
    content: str
    category: Optional[str] = None

class PostRead(SQLModel):
    id: int
    title: str
    content: str
    category: Optional[str]
    likes: int
    user_id: Optional[int]