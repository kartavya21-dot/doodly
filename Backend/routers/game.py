from fastapi import APIRouter, Depends, HTTPException
from db.session import SessionDep
from db.models import Game, User, Room
from services.auth_services import get_current_user
from schemas.game import GameResponse, GameCreate

router = APIRouter(prefix="/game", tags=["Game"])

@router.get("/{room_id}")
def get_room_games(room_id: int, session: SessionDep, user: User = Depends(get_current_user)):
    db_room = session.get(Room, room_id)

    if user not in db_room.users:
        raise HTTPException(status_code=401, detail="Join the room first")
    
    return db_room.games

@router.post("/{room_id}", response_model=GameResponse)
def create_game(room_id: int, game: GameCreate, session: SessionDep,  user: User = Depends(get_current_user)):
    db_room = session.get(Room, room_id)

    if not db_room:
        raise HTTPException(status_code=404, detail="Room doesnt exist")
    
    if user not in db_room.users:
        raise HTTPException(status_code=401, detail="User not authorised")

    db_game = Game.model_validate(game)

    session.add(db_game)
    session.commit()
    session.refresh(db_game)

    return db_game