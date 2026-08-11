from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from db.models import Theme, ThemeWord, Room, User
from db.session import SessionDep, Session
from services.auth_services import get_current_user
from schemas.theme import ThemeResponse, ThemeWithWords, ThemeCreate, ThemeWordResponse, ThemeWordCreate
from sqlmodel import select

router = APIRouter(prefix="/themes", tags=["Theme"])

# Seeding preset themes
PRESET_THEMES = {
    "Indian Movies": [
        "Sholay", "Dilwale", "Lagaan", "Dangal", "Baahubali",
        "Pushpa", "3 Idiots", "PK", "Golmaal", "Hera Pheri",
        "Krrish", "Koi Mil Gaya", "Don", "Kabir Singh", "Barfi",
        "Queen", "War", "Jawan", "Pathaan"
    ],
    "Marvel Movies": [
        "Iron Man", "Avengers", "Thor", "Captain America", "Black Widow",
        "Hulk", "Spider-Man", "Black Panther", "Doctor Strange", "Ant-Man",
        "Captain Marvel", "Loki", "Groot", "Thanos", "Wolverine",
        "Deadpool", "Daredevil", "Hawkeye", "Star-Lord", "Gamora"
    ],
    "Superheroes": [
        "Batman", "Superman", "Spider-Man", "Wonder Woman", "Flash",
        "Aquaman", "Iron Man", "Thor", "Hulk", "Captain America",
        "Green Lantern", "Robin", "Catwoman", "Joker", "Wolverine",
        "Deadpool", "Black Panther", "Doctor Strange", "Shazam", "Cyborg"
    ],
    "Animals": [
        "Elephant", "Lion", "Tiger", "Giraffe", "Zebra",
        "Monkey", "Kangaroo", "Penguin", "Panda", "Koala",
        "Hippopotamus", "Crocodile", "Dolphin", "Whale", "Shark",
        "Eagle", "Owl", "Rabbit", "Squirrel", "Fox"
    ],
    "Historical Figures": [
        "Gandhi", "Einstein", "Newton", "Lincoln", "Cleopatra",
        "Napoleon", "Shakespeare", "Columbus", "Da Vinci", "Galileo",
        "Aristotle", "Socrates", "Washington", "Alexander", "Julius Caesar",
        "Buddha", "Mandela", "Mother Teresa", "Tesla", "Darwin"
    ],
    "Food": [
        "Biryani", "Pizza", "Burger", "Pasta", "Sushi",
        "Taco", "Noodles", "Samosa", "Dosa", "Sandwich",
        "Ice Cream", "Cake", "Chocolate", "Donut", "Salad",
        "Soup", "Waffle", "Pancake", "Kebab", "Paneer"
    ]
}

def seed_themes(session: Session):
    for theme_name, words in PRESET_THEMES.items():
        # Check if theme already exists
        existing_theme = session.exec(
            select(Theme).where(Theme.name == theme_name, Theme.is_preset == True)
        ).first()

        if not existing_theme:
            theme = Theme(name=theme_name, is_preset=True, room_id=None)
            session.add(theme)
            session.commit()
            session.refresh(theme)

            for w in words:
                word_obj = ThemeWord(theme_id=theme.id, word=w)
                session.add(word_obj)
            session.commit()

@router.get("", response_model=List[ThemeWithWords])
def get_themes(
    session: SessionDep,
    room_id: Optional[int] = None,
    user: User = Depends(get_current_user)
):
    if room_id:
        room = session.get(Room, room_id)
        if not room or user not in room.users:
            raise HTTPException(status_code=403, detail="Not authorized or Room does not exist")

        # Fetch presets and custom themes for this room
        stmt = select(Theme).where((Theme.is_preset == True) | (Theme.room_id == room_id))
    else:
        # Fetch only presets
        stmt = select(Theme).where(Theme.is_preset == True)

    return session.exec(stmt).all()

@router.get("/{theme_id}", response_model=ThemeWithWords)
def get_theme_by_id(
    theme_id: int,
    session: SessionDep,
    user: User = Depends(get_current_user)
):
    theme = session.get(Theme, theme_id)
    if not theme:
        raise HTTPException(status_code=404, detail="Theme not found")

    if not theme.is_preset:
        room = session.get(Room, theme.room_id)
        if not room or user not in room.users:
            raise HTTPException(status_code=403, detail="Not authorized to access this custom theme")

    return theme

@router.post("/room/{room_id}", response_model=ThemeResponse)
def create_custom_theme(
    room_id: int,
    theme_data: ThemeCreate,
    session: SessionDep,
    user: User = Depends(get_current_user)
):
    room = session.get(Room, room_id)
    if not room or user not in room.users:
        raise HTTPException(status_code=403, detail="Not authorized to create custom theme in this room")

    theme = Theme(name=theme_data.name, is_preset=False, room_id=room_id)
    session.add(theme)
    session.commit()
    session.refresh(theme)
    return theme

@router.post("/{theme_id}/words", response_model=ThemeWordResponse)
def add_word_to_theme(
    theme_id: int,
    word_data: ThemeWordCreate,
    session: SessionDep,
    user: User = Depends(get_current_user)
):
    theme = session.get(Theme, theme_id)
    if not theme:
        raise HTTPException(status_code=404, detail="Theme not found")

    if theme.is_preset:
        raise HTTPException(status_code=400, detail="Cannot modify preset themes")

    room = session.get(Room, theme.room_id)
    if not room or user not in room.users:
        raise HTTPException(status_code=403, detail="Not authorized to modify this custom theme")

    word_clean = word_data.word.strip()
    if not word_clean:
        raise HTTPException(status_code=400, detail="Word cannot be empty")

    # Check for duplicates in theme
    existing = session.exec(
        select(ThemeWord).where(ThemeWord.theme_id == theme_id, ThemeWord.word == word_clean)
    ).first()
    if existing:
        return existing

    word_obj = ThemeWord(theme_id=theme_id, word=word_clean)
    session.add(word_obj)
    session.commit()
    session.refresh(word_obj)
    return word_obj

@router.delete("/{theme_id}/words/{word_id}")
def delete_word_from_theme(
    theme_id: int,
    word_id: int,
    session: SessionDep,
    user: User = Depends(get_current_user)
):
    theme = session.get(Theme, theme_id)
    if not theme:
        raise HTTPException(status_code=404, detail="Theme not found")

    if theme.is_preset:
        raise HTTPException(status_code=400, detail="Cannot modify preset themes")

    room = session.get(Room, theme.room_id)
    if not room or user not in room.users:
        raise HTTPException(status_code=403, detail="Not authorized to modify this custom theme")

    word_obj = session.get(ThemeWord, word_id)
    if not word_obj or word_obj.theme_id != theme_id:
        raise HTTPException(status_code=404, detail="Word not found in this theme")

    session.delete(word_obj)
    session.commit()
    return {"message": "Word deleted successfully"}

@router.delete("/{theme_id}")
def delete_custom_theme(
    theme_id: int,
    session: SessionDep,
    user: User = Depends(get_current_user)
):
    theme = session.get(Theme, theme_id)
    if not theme:
        raise HTTPException(status_code=404, detail="Theme not found")

    if theme.is_preset:
        raise HTTPException(status_code=400, detail="Cannot delete preset themes")

    room = session.get(Room, theme.room_id)
    # Only room admin can delete themes
    if not room or room.admin_username != user.username:
        raise HTTPException(status_code=403, detail="Only room admin can delete themes")

    session.delete(theme)
    session.commit()
    return {"message": "Theme deleted successfully"}
