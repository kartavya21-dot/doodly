from datetime import datetime, timedelta
from jose import jwt
import bcrypt
from fastapi import HTTPException, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel import select
from db.session import Session, get_session
from db.models import User

SECRET_KEY = "09d25e094faa6ca2556c81"

def hash_password(password: str) -> str:
    # Convert to bytes, salt it, hash it, return as string
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(password: str, hashed_password: str) -> bool:
    password_bytes = password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)

def create_access_token(username: str):
    payload = {
        "sub": username,
        "type": "access",
        "exp": datetime.utcnow() + timedelta(minutes=3000000)
    }

    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def create_refresh_token(username: str):
    payload = {
        "sub": username,
        "type": "refresh",
        "exp": datetime.utcnow() + timedelta(days=7)
    }

    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def decode_token(token: str):
    return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])

security = HTTPBearer()

def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session),
):
    try:
        payload = jwt.decode(creds.credentials, SECRET_KEY, algorithms=["HS256"])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401)

        user = session.get(User, payload["sub"])
        if not user:
            raise HTTPException(status_code=401)

        return user
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
    
# eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzdHJpbmciLCJ0eXBlIjoiYWNjZXNzIiwiZXhwIjoxOTU3MjE2NDA3fQ.-30yb_YsIihmnYRxWsusFRP0Hav52puEKCFR3XNyQuQ
# eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huIiwidHlwZSI6ImFjY2VzcyIsImV4cCI6MTk1NzIxNjM0OH0.44X-kvrbIRzGg4Np43yroHrO8Sc4SNxG5U0mnOyCP1Q
# eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzZWFuIiwidHlwZSI6ImFjY2VzcyIsImV4cCI6MTk1NzIxNjM4MH0.Pxk_z_9G2L0npFfmFhyTyjJ1dAsfGYR0CYYUDgBt9og