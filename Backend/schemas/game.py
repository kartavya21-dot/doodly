from pydantic import BaseModel
from typing import List
from schemas.user import UserBase
from datetime import datetime

class GameBase(BaseModel):
    room_id: int
    total_round: int

class GameCreate(GameBase):
    pass

class GameResponse(GameBase):
    id: int
    current_round: int
    created_at: datetime
    round_ended: int
    is_started: bool
    is_ended: bool

class UserGameScoreSchema(BaseModel):
    user_username: str
    game_id: int
    score: int

class GameWithPlayers(GameResponse):
    current_player: str | None = None
    players: List["UserBase"]

class GameWithPlayerAndScores(GameResponse):
    players: List["UserBase"]
    scores: List["UserGameScoreSchema"]

class GameCompleteSchema(GameResponse):
    current_player: str
    current_word: str

class GameUserBase(BaseModel):
    user_username: str
    turn: int
    is_active: bool