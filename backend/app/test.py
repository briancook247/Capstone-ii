import os
import time
import requests
from bs4 import BeautifulSoup
import numpy as np
import openai
from pinecone.core.openapi.shared.exceptions import PineconeApiException
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Retrieve configuration from environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_CLOUD = os.getenv("PINECONE_CLOUD", "aws")
PINECONE_REGION = os.getenv("PINECONE_REGION", "us-east-1")

# Initialize OpenAI
openai.api_key = OPENAI_API_KEY

# Import the latest Pinecone classes

app = FastAPI()

# Global variables for the Pinecone client and index instance.
# We use a single index (named "website-docs") to store embeddings for all websites.
pinecone_client = None
index = None
INDEX_NAME = "website-docs"  # common index name for all websites

# --------------------------------------------------
# Helper Functions
# --------------------------------------------------

def get_page(url: str) -> str:
    """Fetch a webpage and return its HTML content."""
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.text
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def parse_index(base_url, max_pages=100):
    """
Recursively scrapes the base_url and finds all documentation pages
within the same domain. Limits to max_pages to prevent infinite loops.
    """
    visited = set()  # Track visited URLs to avoid duplicates
    to_visit = [base_url]  # Start with the base URL
    pages = set()

    while to_visit and len(pages) < max_pages:
        url = to_visit.pop(0)
        if url in visited:
            continue

        print(f"Scraping: {url}")
        html = get_page(url)
        if not html:
            continue

        visited.add(url)
        soup = BeautifulSoup(html, "html.parser")

        # Collect this page as part of the documentation
        pages.add(url)

        # Extract all links from the page
        for a in soup.find_all("a", href=True):
            href = a["href"]
            full_url = requests.compat.urljoin(base_url, href)  # Handle relative URLs

            # Only include links within the documentation domain
            if full_url.startswith(base_url) and full_url not in visited:
                to_visit.append(full_url)

    return list(pages)

def create_embedding(text: str) -> list:
    """Create an embedding for the given text using OpenAI."""
    try:
        response = openai.embeddings.create(
            input=text,
            model="text-embedding-ada-002"
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"Error creating embedding: {e}")
        return None

def create_document_embeddings(base_url):
    """
    Recursively scrapes documentation pages, generates embeddings, and prepares
    vectors for Pinecone storage.
    """
    pages = parse_index(base_url, max_pages=100)  # Adjust max_pages as needed
    print(f"Found {len(pages)} pages to process for indexing.")

    vectors = []
    for page in pages:
        print(f"Processing: {page}")
        html = get_page(page)
        if not html:
            continue

        soup = BeautifulSoup(html, "html.parser")
        content_div = soup.find("div", {"class": "body"}) or soup.body
        content_text = content_div.get_text(separator=" ", strip=True) if content_div else ""

        if len(content_text) > 4000:
            content_text = content_text[:4000]  # Limit text size for embedding

        embedding = create_embedding(content_text)
        if embedding:
            vectors.append({
                "id": page,
                "values": embedding,
                "metadata": {"url": page, "text": content_text, "website": base_url}
            })

        time.sleep(1)  # Respect API rate limits

    return vectors

def build_context_prompt(query: str, relevant_docs: list) -> str:
    """
Build a prompt for ChatGPT that includes the user query and documentation excerpts.
Each excerpt is labeled with its source URL.
    """
    context_texts = []
    for doc in relevant_docs:
        url = doc["metadata"].get("url", "")
        text = doc["metadata"].get("text", "")
        context_texts.append(f"Source: {url}\nExcerpt: {text}")
    context = "\n\n".join(context_texts)
    prompt = f"""You are an assistant knowledgeable about the documentation provided.
Based on the following documentation excerpts (each labeled with its source URL), answer the query as accurately as possible.
Include references (the source URLs) for any information you use.

Documentation Context:
----------------------
        {context}
----------------------
        User Query: {query}
        """
    return prompt

def query_chatgpt(prompt: str) -> dict:
    """Send the prompt to ChatGPT and return its answer."""
    try:
        response = openai.chat.completions.create(
            model="gpt-4o-mini",  # Adjust the model if needed
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=800,
            temperature=0.2,
        )
        return response.choices[0].message
    except Exception as e:
        print(f"Error querying ChatGPT: {e}")
        return None

# --------------------------------------------------
# FastAPI Endpoints
# --------------------------------------------------

def check_if_indexed(namespace):
    """
Checks if the Pinecone namespace already contains data.
If it has data, we do NOT need to scrape again.
    """
    try:
        stats = index.describe_index_stats()
        namespace_info = stats["namespaces"].get(namespace, None)

        if namespace_info and namespace_info["vector_count"] > 0:
            print(f"✅ Namespace '{namespace}' already has {namespace_info['vector_count']} vectors. Skipping scraping.")
            return True  # Data exists, no need to scrape again

        print(f"⚠ Namespace '{namespace}' is empty. Scraping is required.")
        return False  # No vectors found, scraping is needed

    except Exception as e:
        print(f"Error checking Pinecone namespace: {e}")
        return False

class ChatRequest(BaseModel):
    website_url: str  # the base URL to scrape (e.g. a documentation site)
    query: str        # the user’s question about the documentation

@app.post("/chat")
async def chat_about_documentation(request: ChatRequest):
    website_url = request.website_url.strip()
    user_query = request.query.strip()
    namespace = website_url  # Use the website URL as the namespace

    # ✅ Check if vectors already exist in Pinecone
    if check_if_indexed(namespace):
        print("✅ Using existing vectors in Pinecone.")
    else:
        print(f"⚠ No vectors found for {website_url}. Starting the scraping and embedding process...")
        vectors = create_document_embeddings(website_url)

        if not vectors:
            raise HTTPException(status_code=500, detail="Failed to scrape and embed any pages.")

        index.upsert(vectors=vectors, namespace=namespace)
        print(f"✅ Successfully upserted {len(vectors)} new vectors into Pinecone.")
        time.sleep(5)  # Allow Pinecone time to index the new data

    # ✅ Now process the query using stored embeddings
    query_embedding = create_embedding(user_query)
    if not query_embedding:
        raise HTTPException(status_code=500, detail="Failed to compute query embedding.")

    try:
        result = index.query(
            namespace=namespace,
            vector=query_embedding,
            top_k=3,
            include_metadata=True,
            include_values=False
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pinecone query error: {e}")

    matches = result.get("matches", [])
    if not matches:
        raise HTTPException(status_code=404, detail="No matching documents found.")

    prompt = build_context_prompt(user_query, matches)
    answer = query_chatgpt(prompt)

    return {"answer": answer.content, "sources": [match["metadata"]["url"] for match in matches]}

# --------------------------------------------------
# Pinecone Initialization on Startup
# --------------------------------------------------

@app.on_event("startup")
def startup_event():
    global pinecone_client, index
    pinecone_client = Pinecone(api_key=PINECONE_API_KEY)
    # For text-embedding-ada-002, the embedding dimension is typically 1536.
    dimension = 1536

    # List existing indexes
    existing_indexes = pinecone_client.list_indexes()
    if INDEX_NAME not in existing_indexes:
        try:
            pinecone_client.create_index(
                name=INDEX_NAME,
                dimension=dimension,
                metric="cosine",
                spec=ServerlessSpec(
                    cloud=PINECONE_CLOUD,
                    region=PINECONE_REGION
                )
            )
        except PineconeApiException as e:
            # If the index already exists, we can catch the 409 conflict error and ignore it.
            if e.status == 409 or "ALREADY_EXISTS" in str(e):
                print(f"Index {INDEX_NAME} already exists. Skipping creation.")
            else:
                raise e
    else:
        print(f"Index {INDEX_NAME} already exists.")

    # Initialize the index object for further operations.
    index = pinecone_client.Index(INDEX_NAME)
    print(f"Pinecone index '{INDEX_NAME}' is ready.")

# --------------------------------------------------
# Run the App (for local testing)
# --------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)