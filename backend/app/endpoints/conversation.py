"""
Capstone II STG-452
Authors: Brian Cook, Dima Bondar, James Green
Professor: Bill Hughes
Our Own Work
License: MIT
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.dependencies import verify_token
from app.models.conversation import ConversationInDB, Message
from app.utils import openai_helper

router = APIRouter(prefix="/conversation", tags=["conversation"])

class ConversationRequest(BaseModel):
    document_id: int
    message: str

@router.post("/")
async def conversation(convo_req: ConversationRequest, user=Depends(verify_token)):
    """
    Endpoint to handle conversation queries.
    Uses the stored API documentation as context and returns an AI-generated answer.
    """
    # Retrieve document context from the database using document_id.
    document_context = "Simulated API documentation content..."
    
    try:
        answer = await openai_helper.get_chat_response(document_context, convo_req.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OpenAI error: {str(e)}")
    
    conversation = ConversationInDB(
        id=1,  # This would be auto-generated in a real application.
        document_id=convo_req.document_id,
        user_email=user.get("sub"),
        messages=[
            Message(role="user", content=convo_req.message),
            Message(role="assistant", content=answer)
        ]
    )
    # Code to save conversation to the database goes here.
    return {"answer": answer, "conversation_id": conversation.id}
