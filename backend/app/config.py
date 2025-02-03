"""
Capstone II STG-452
Authors: Brian Cook, Dima Bondar, James Green
Professor: Bill Hughes
Our Own Work
License: MIT
"""

import os
from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv()

class Settings:
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "your_jwt_secret_here")

settings = Settings()
