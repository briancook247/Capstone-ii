"""
Capstone II STG-452
Authors: Brian Cook, Dima Bondar, James Green
Professor: Bill Hughes
Our Own Work
License: MIT
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.conversation import Conversation
from app.models.document import Document
from app.utils.dependencies import get_db, get_current_user

router = APIRouter()


class ConversationCreate(BaseModel):
    url: str


@router.post("/conversation", response_model=dict)
def create_conversation(
    data: ConversationCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Creates a new conversation entry for the given documentation URL.
    This endpoint first checks if a document exists for this user and URL.
    If not, it creates a new document record. Then it creates a new conversation
    tied to that document and the user's UUID.
    """
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    # Check if the document exists for this user and URL
    document = (
        db.query(Document)
        .filter(Document.url == data.url, Document.user_id == user_id)
        .first()
    )
    if not document:
        document = Document(url=data.url, user_id=user_id)
        db.add(document)
        db.commit()
        db.refresh(document)

    # Create a new conversation tied to this document and the user
    conversation = Conversation(document_id=document.id, user_id=user_id)
    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    # Return the conversation info (adjust the response format as needed)
    return {
        "conversation": {
            "id": str(conversation.id),
            "document_id": str(document.id),
            "user_id": str(user_id),
            "created_at": conversation.created_at.isoformat()
        }
    }
