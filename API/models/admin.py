from typing import Optional
from sqlmodel import Field, SQLModel


class Admin(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str
    name: str
    created_at: Optional[str] = None


class AdminCreate(SQLModel):
    email: str
    password: str
    name: str


class AdminRead(SQLModel):
    id: int
    email: str
    name: str
