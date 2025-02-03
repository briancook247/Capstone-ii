"""
Capstone II STG-452
Authors: Brian Cook, Dima Bondar, James Green
Professor: Bill Hughes
Our Own Work
License: MIT
"""

import httpx
from bs4 import BeautifulSoup

async def fetch_and_scrape(url: str) -> str:
    """
    Fetches the HTML content from the given URL and extracts readable text.
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
    if response.status_code != 200:
        raise Exception("Unable to fetch the URL")
    soup = BeautifulSoup(response.text, "html.parser")
    text = soup.get_text(separator="\n")
    return text
