from pydantic import BaseModel
from typing import List, Optional

class ThemeWordBase(BaseModel):
    word: str

class ThemeWordCreate(ThemeWordBase):
    pass

class ThemeWordResponse(ThemeWordBase):
    id: int
    theme_id: int

    class Config:
        from_attributes = True

class ThemeBase(BaseModel):
    name: str
    is_preset: bool = False
    room_id: Optional[int] = None

class ThemeCreate(ThemeBase):
    pass

class ThemeResponse(ThemeBase):
    id: int

    class Config:
        from_attributes = True

class ThemeWithWords(ThemeResponse):
    words: List[ThemeWordResponse] = []

    class Config:
        from_attributes = True
