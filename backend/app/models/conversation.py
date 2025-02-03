"""
Capstone II STG-452
Authors: Brian Cook, Dima Bondar, James Green
Professor: Bill Hughes
Our Own Work
License: MIT
"""

from pydantic import BaseModel
from typing import List

class Message(BaseModel):
    """
    Represents a single message within a conversation.
    """
    role: str  # 'user' or 'assistant'
    content: str

class ConversationInDB(BaseModel):
    """
    Represents a conversation session stored in the database.
    """
    id: int
    document_id: int
    user_email: str
    messages: List[Message]
