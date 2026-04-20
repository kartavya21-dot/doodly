from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime

class RoomUser(SQLModel, table=True):
    __tablename__ = "room_users"

    user_username: str = Field(foreign_key="users.username", primary_key=True)
    room_id: int = Field(foreign_key="rooms.id", primary_key=True)

class GameUser(SQLModel, table=True):
    __tablename__ = "game_users"

    user_username: str = Field(foreign_key="users.username", primary_key=True)
    game_id: int = Field(foreign_key="games.id", primary_key=True)

class UserGameScore(SQLModel, table=True):
    __tablename__ = "user_game_scores"

    user_username: str = Field(foreign_key="users.username", primary_key=True)
    game_id: int = Field(foreign_key="games.id", primary_key=True)
    score: int = Field(default=0)

    game: "Game" = Relationship(back_populates="scores")

class User(SQLModel, table=True):
    __tablename__ = "users"

    username: str = Field(primary_key = True, default=None)
    password: str = Field(default=None)

    rooms: List["Room"] | None = Relationship(back_populates="users", link_model=RoomUser)
    games: List["Game"] | None = Relationship(back_populates="players", link_model=GameUser)

class Room(SQLModel, table=True):
    __tablename__ = "rooms"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(default="Doodly_room")
    password: Optional[str] = Field(default=None)
    is_public: bool = Field(default=False)

    admin_username: str = Field(foreign_key="users.username")
    users: List["User"] = Relationship(back_populates="rooms", link_model=RoomUser)
    games: List["Game"] = Relationship(back_populates="room")

class Game(SQLModel, table=True):
    __tablename__ = "games"

    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    room_id: int = Field(foreign_key="rooms.id")

    current_round: int = Field(default=0)
    total_round: int

    is_started: bool = Field(default=False)
    is_ended: bool = Field(default=False)

    current_player: Optional[str] = Field(foreign_key="users.username")
    current_word: Optional[str] = Field(default=None)

    room: Room = Relationship(back_populates="games")
    
    players: List["User"] = Relationship(back_populates="games", link_model=GameUser)
    scores: List["UserGameScore"] = Relationship(back_populates="game")