from fastapi import APIRouter, HTTPException
from sqlmodel import select
from db.session import SessionDep
from db.models import User
from schemas.auth import RegisterRequest, LoginRequest, UserResponse, TokenResponse
from services.auth_services import hash_password, verify_password, create_access_token, create_refresh_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse)
async def register(user: RegisterRequest, session: SessionDep):
    print(user)
    db_user = session.get(User, user.username)

    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    user_ = User(username=user.username, password=hash_password(user.password))
    session.add(user_)
    session.commit()
    session.refresh(user_)

    return user_

@router.post("/login", response_model=TokenResponse)
async def login(user: LoginRequest, session: SessionDep):

    db_user = session.get(User, user.username)

    if not db_user and not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    access_token = create_access_token(user.username)
    refresh_token = create_refresh_token(user.username)

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)

@router.delete("/delete", response_model=UserResponse)
async def delete(user: LoginRequest, session: SessionDep):
    db_user = session.get(User, user.username)

    if not db_user:
        raise HTTPException(status_code=400, detail="User not found")
    
    session.delete(db_user)
    session.commit()

    return db_user