from fastapi import FastAPI
from app.endpoints import conversation, ingestion, auth

app = FastAPI()

app.include_router(auth.router, prefix="/auth")
app.include_router(conversation.router)
app.include_router(ingestion.router)
