"""
Capstone II STG-452
Authors: Brian Cook, Dima Bondar, James Green
Professor: Bill Hughes
Our Own Work
License: MIT
"""

from pydantic import BaseModel

class DocumentInDB(BaseModel):
    """
    Represents an ingested API document stored in the database.
    """
    id: int
    api_url: str
    content: str
    user_email: str
