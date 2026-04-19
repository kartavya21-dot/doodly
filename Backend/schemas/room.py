from pydantic import BaseModel

class RoomBase(BaseModel):
    name: str
    is_public: bool

class RoomCreate(RoomBase):
    admin_username: str
    password: str

class RoomResponse(RoomBase):
    id: int

class RoomJoin(RoomBase):
    id: int
    password: str | None