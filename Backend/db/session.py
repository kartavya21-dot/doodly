from sqlmodel import create_engine, Session, SQLModel
from fastapi import Depends
from typing import Annotated

file = "database.db"
url = f"sqlite:///{file}"

connect_args = {"check_same_thread": False}
engine = create_engine(file, echo=True, connect_args=connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

Session_dep = Annotated[Session, Depends(get_session)]