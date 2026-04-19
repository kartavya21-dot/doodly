from fastapi import FastAPI
from db.session import create_db_and_tables
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, room

app = FastAPI()

# Testing
@app.get("/")
async def root():
    return {"message": "Hello World"}

# DB Tables
@app.on_event("startup")
def on_startup():
    create_db_and_tables()

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
# app.include_router(game.router)