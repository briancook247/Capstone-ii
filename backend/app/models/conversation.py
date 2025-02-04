"""
Capstone II STG-452
Authors: Brian Cook, Dima Bondar, James Green
Professor: Bill Hughes
Our Own Work
2/01/2025
License: MIT
"""

# app/models/conversation.py

from sqlalchemy import Column, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.database import Base 

# This is the model for the conversation table in the database.
# we will implement the conversation table later in the project.