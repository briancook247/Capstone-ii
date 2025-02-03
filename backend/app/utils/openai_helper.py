"""
Capstone II STG-452
Authors: Brian Cook, Dima Bondar, James Green
Professor: Bill Hughes
Our Own Work
License: MIT
"""

import openai
from app.config import settings

# Configure the OpenAI API key
openai.api_key = settings.OPENAI_API_KEY

async def get_chat_response(document_context: str, user_message: str) -> str:
    """
    Uses OpenAI's API to generate a response based on the document context and the user's message.
    """
    prompt = (
        f"Using the following API documentation context:\n{document_context}\n\n"
        f"User question: {user_message}\nAnswer:"
    )
    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=prompt,
        max_tokens=200,
        temperature=0.2,
    )
    answer = response.choices[0].text.strip()
    return answer
