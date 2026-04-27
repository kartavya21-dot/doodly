from fastapi import APIRouter, Depends, HTTPException
from typing import List
from schemas.user import UserBase
from schemas.room import *
from db.models import Room, User
from db.session import SessionDep
from services.auth_services import get_current_user
from sqlmodel import select

router = APIRouter(prefix="/room", tags=["Room"])

@router.post("", response_model=RoomResponse)
async def create_room(room: RoomCreate, session: SessionDep, user: User = Depends(get_current_user)):
    password = None if room.is_public else room.password

    room_ = Room(name=room.name, admin_username=user.username, is_public=room.is_public, password=password) 

    room_.users.append(user)

    session.add(room_)
    session.commit()
    session.refresh(room_)

    return room_

@router.get("", response_model=list[RoomResponse], dependencies=[Depends(get_current_user)])
async def get_rooms(session: SessionDep):
    rooms = session.exec(select(Room)).all()
    return rooms

@router.get("/my", response_model=List[RoomResponse])
async def get_my_rooms(session: SessionDep, user: User = Depends(get_current_user)):
    db_user = session.get(User, user.username)

    if not db_user:
        raise HTTPException(status_code=404, detail="User not Authenticated")
    
    return db_user.rooms

@router.patch("/join-room", response_model=RoomResponse)
async def join_room(session: SessionDep, room: RoomJoin, user: User = Depends(get_current_user)):
    
    db_room = session.get(Room, room.id)

    if not db_room:
        raise HTTPException(status_code=404, detail="Room not found")

    if user in db_room.users:
        return db_room

    if db_room.is_public:
        db_room.users.append(user)
    else:
        if db_room.password == room.password:
            db_room.users.append(user)
        else:
            raise HTTPException(status_code=401, detail="Incorrect password")

    session.add(db_room)
    session.commit()
    session.refresh(db_room)
        
    return db_room

@router.get("/{room_id}/users", response_model=List[UserBase], dependencies=[Depends(get_current_user)])
async def get_room_user(room_id: int, session: SessionDep):
    db_room = session.get(Room, room_id)

    if not db_room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    return db_room.users 