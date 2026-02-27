from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime, timezone

if TYPE_CHECKING:
    from .user import User
    from .post import Post

class Comment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    content: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    post_id: Optional[int] = Field(default=None, foreign_key="post.id")

    user: Optional["User"] = Relationship(back_populates="comments")
    post: Optional["Post"] = Relationship(back_populates="comments")

class CommentCreate(SQLModel):
    content: str
    post_id: int

class CommentRead(SQLModel):
    id: int
    content: str
    created_at: datetime
    user_id: int
    post_id: int
