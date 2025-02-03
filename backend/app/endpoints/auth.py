"""
Capstone II STG-452
Authors: Brian Cook, Dima Bondar, James Green
Professor: Bill Hughes
Our Own Work
License: MIT
"""

from fastapi import APIRouter, HTTPException, status
import jwt
from datetime import datetime, timedelta
from pydantic import BaseModel
from app.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

class AuthPayload(BaseModel):
    email: str
    password: str

@router.post("/signin")
def signin(payload: AuthPayload):
    """
    Sign in endpoint. Accepts user credentials and returns a JWT token.
    """
    token_data = {
        "sub": payload.email,
        "exp": datetime.utcnow() + timedelta(hours=2)
    }
    token = jwt.encode(token_data, settings.JWT_SECRET, algorithm="HS256")
    return {"access_token": token, "token_type": "bearer"}

@router.post("/signup")
def signup(payload: AuthPayload):
    """
    Sign up endpoint. Creates a new user record and returns a JWT token.
    """
    token_data = {
        "sub": payload.email,
        "exp": datetime.utcnow() + timedelta(hours=2)
    }
    token = jwt.encode(token_data, settings.JWT_SECRET, algorithm="HS256")
    return {"access_token": token, "token_type": "bearer"}
