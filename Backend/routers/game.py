from fastapi import APIRouter, Depends, HTTPException
from db.session import SessionDep
from db.models import Game, User, Room, GameUser
from services.auth_services import get_current_user
from schemas.game import GameResponse, GameCreate, GameWithPlayers, GameUserBase
from sqlmodel import select
from typing import List

router = APIRouter(prefix="/game", tags=["Game"])

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

@router.get("/{game_id}", response_model=GameWithPlayers)
def get_players(game_id: int, session: SessionDep, user: User = Depends(get_current_user)):
    db_game = session.get(Game, game_id)

    if not db_game:
        raise HTTPException(status_code=404, detail="Game doesnt exist")
    
    db_room = session.get(Room, db_game.room_id)

    if user not in db_room.users:
        raise HTTPException(status_code=401, detail="User not authorised")

    return db_game

@router.get("/{game_id}/players", response_model=List[GameUserBase])
def get_game_players(game_id: int, session: SessionDep, user: User = Depends(get_current_user)):
    db_game = session.get(Game, game_id)

    if not db_game:
        raise HTTPException(status_code=404, detail="Game doesnt exist")
    
    db_room = session.get(Room, db_game.room_id)

    if user not in db_room.users:
        raise HTTPException(status_code=401, detail="User not authorised")
    
    db_game_user:List[GameUserBase] = session.exec(select(GameUser.user_username, GameUser.turn, GameUser.is_active).where(GameUser.game_id == game_id)).all()

    return db_game_user

@router.delete("/{game_id}/delete/{username}")
def delete_game_user(game_id: int, username: str, session: SessionDep):
    db_game: Game = session.get(Game, game_id)
    db_user: User = session.get(User, username)
    db_game.players.remove(db_user)
    session.commit()
    session.refresh(db_game)
    return db_game

@router.delete("/{game_id}/delete")
def delete_game(game_id: int, session: SessionDep):
    db_game: Game = session.get(Game, game_id)
    session.delete(db_game)
    session.commit()
    return db_game

@router.get("/{game_id}/scores")
def get_game_scores(game_id: int, session: SessionDep):
    db_game: Game = session.get(Game, game_id)
    return db_game.scores