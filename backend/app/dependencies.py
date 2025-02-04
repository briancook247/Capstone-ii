"""
Capstone II STG-452
Authors: Brian Cook, Dima Bondar, James Green
Professor: Bill Hughes
Our Own Work
2/01/2025
License: MIT
"""

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.utils.auth import get_current_user_from_token  # auth helper

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user():
    # This function should extract and verify the user from the request (via a JWT token)
    # and return a dict containing at least the user's UUID under the key "id".
    # This is temporary and will be replaced by a proper authentication mechanism in a future section.
    user = get_current_user_from_token()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return user
