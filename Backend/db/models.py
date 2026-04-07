from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List

class RoomUser(SQLModel, table=True):
    __tablename__ = "room_users"
    user_username: str = Field(foreign_key="users.username", primary_key=True)
    room_id: int = Field(foreign_key="rooms.id", primary_key=True)

class User(SQLModel, table=True):
    __tablename__ = "users"
    username: str = Field(primary_key = True, default=None)
    room: List["Room"] | None = Relationship(back_populates="users", link_model=RoomUser)

class Room(SQLModel, table=True):
    __tablename__ = "rooms"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(default="Doodly_room")
    admin_username: str = Field(foreign_key="users.username")
    users: List["User"] = Relationship(back_populates="rooms", link_model=RoomUser)

class Game(SQLModel, table=True):
    __tablename__ = "games"
    id: Optional[int] = Field(default=None, primary_key=True)
    room_id: int = Field(foreign_key="rooms.id")
    