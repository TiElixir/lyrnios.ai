import os
import jwt
from datetime import datetime, timedelta
from typing import Optional
from fastapi import HTTPException, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
from database import get_db, get_user_by_google_id, create_user

# Load environment variables
config = Config('.env')

# OAuth setup
oauth = OAuth(config)

GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-change-this-in-production')
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')

# Register Google OAuth
oauth.register(
    name='google',
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

# Security
security = HTTPBearer()


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=7)  # Default 7 days
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")
    return encoded_jwt


def verify_token(token: str):
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db = Depends(get_db)
):
    """Get current authenticated user from JWT token"""
    token = credentials.credentials
    payload = verify_token(token)
    
    google_id = payload.get("sub")
    if not google_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    
    user = get_user_by_google_id(db, google_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user


def get_or_create_user(db, user_info: dict):
    """Get existing user or create new one from Google user info"""
    google_id = user_info.get('sub')
    email = user_info.get('email')
    name = user_info.get('name')
    picture = user_info.get('picture')
    
    # Check if user exists
    user = get_user_by_google_id(db, google_id)
    
    if not user:
        # Create new user
        user = create_user(
            db=db,
            google_id=google_id,
            email=email,
            name=name,
            picture=picture
        )
    
    return user
