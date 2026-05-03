from pydantic import BaseModel
from schemas.user import UserBase
from typing import List

class RoomBase(BaseModel):
    name: str
    is_public: bool

class RoomCreate(RoomBase):
    password: str

class RoomResponse(RoomBase):
    id: int
    admin_username: str
    users: List["UserBase"]

class RoomJoin(RoomBase):
    id: int
    password: str | None