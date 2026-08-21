import os
from dotenv import load_dotenv
from sqlmodel import create_engine, Session, SQLModel
from fastapi import Depends
from typing import Annotated

load_dotenv()

# Read DATABASE_URL from env
database_url = os.getenv("DATABASE_URL")

if database_url:
    # Handle postgresql compatibility fix
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    print("DATABASE URL:", database_url)
    engine = create_engine(database_url, echo=True)
else:
    sqlite_file_name = "database.db"
    sqlite_url = f"sqlite:///{sqlite_file_name}"
    connect_args = {"check_same_thread": False}
    engine = create_engine(sqlite_url, echo=True, connect_args=connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]