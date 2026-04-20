from pydantic import BaseModel
from typing import List
from schemas.user import UserBase
from datetime import datetime

class GameBase(BaseModel):
    room_id: int
    created_at: datetime = datetime.utcnow
    total_round: int

class GameCreate(GameBase):
    pass

class GameResponse(GameBase):
    id: int
    current_round: int

    is_started: bool
    is_ended: bool

class UserGameScore(BaseModel):
    user_username: str
    game_id: int
    score: int

class GameWithPlayerAndScores(GameResponse):
    players: List["UserBase"]
    scores: List["UserGameScore"]