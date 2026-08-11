from fastapi import FastAPI
from db.session import create_db_and_tables, engine
from sqlmodel import Session
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, room, game, webscocket_connection, theme
from routers.theme import seed_themes

app = FastAPI()

# Testing
@app.get("/")
async def root():
    return {"message": "Hello World"}

# DB Tables # Alembic is managing
@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    with Session(engine) as session:
        seed_themes(session)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(room.router)
app.include_router(game.router)
app.include_router(theme.router)
app.include_router(webscocket_connection.router)