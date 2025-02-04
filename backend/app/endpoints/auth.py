"""
Capstone II STG-452
Authors: Brian Cook, Dima Bondar, James Green
Professor: Bill Hughes
Our Own Work
2/01/2025
License: MIT
"""

from fastapi import APIRouter, HTTPException, status
import jwt
from datetime import datetime, timedelta
from pydantic import BaseModel
from app.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

# Later, we might need this auth file to handle user authentication in the backend.