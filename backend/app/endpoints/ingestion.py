"""
Capstone II STG-452
Authors: Brian Cook, Dima Bondar, James Green
Professor: Bill Hughes
Our Own Work
2/01/2025
License: MIT
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, HttpUrl
from app.dependencies import verify_token
from app.utils import scraper
from app.models.document import DocumentInDB

router = APIRouter(prefix="/ingest", tags=["ingestion"])

# Later, we might need this ingestion file to handle the ingestion of new documents.