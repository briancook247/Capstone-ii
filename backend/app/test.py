"""
Capstone II STG-452
Authors: Brian Cook, Dima Bondar, James Green
Professor: Bill Hughes
Our Own Work
License: MIT
"""

import os
import uuid
import asyncio
import json
from typing import List, Optional
import requests
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

from openai import OpenAI
from pinecone import Pinecone, ServerlessSpec

from crawl4ai import (
    AsyncWebCrawler,
    BrowserConfig,
    CrawlerRunConfig,
    PruningContentFilter,
    CacheMode
)
from crawl4ai.markdown_generation_strategy import DefaultMarkdownGenerator

# ---------------- Load Environment ----------------
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENV = os.getenv("PINECONE_ENV", "us-east1-gcp")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# --------------- Initialize Clients ----------------
openai_client = OpenAI(api_key=OPENAI_API_KEY)
pc = Pinecone(api_key=PINECONE_API_KEY, environment=PINECONE_ENV)

# Initialize Supabase client
from supabase import create_client, Client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# -------------- Pinecone Index Setup ----------------
INDEX_NAME = "docs-index"
if INDEX_NAME not in pc.list_indexes().names():
    pc.create_index(
        name=INDEX_NAME,
        dimension=1536,
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1")
    )
pinecone_index = pc.Index(name=INDEX_NAME)

# ---------------- Helper Functions ----------------

def create_embedding(text: str) -> List[float]:
    resp = openai_client.embeddings.create(input=text, model="text-embedding-ada-002")
    return resp.data[0].embedding

def split_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
    """Splits the provided text into overlapping chunks by words."""
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunk = " ".join(words[start:end])
        chunks.append(chunk)
        start += (chunk_size - overlap)
    return chunks

def upsert_chunk(doc_id: str, url: str, chunk: str, chunk_index: int):
    """
    Create an embedding for a text chunk and upsert it to Pinecone.
    The vector's id is a combination of the source URL and the chunk index.
    """
    embedding = create_embedding(chunk)
    vector_id = f"{url}#{chunk_index}"
    pinecone_index.upsert(
        vectors=[
            {
                "id": vector_id,
                "values": embedding,
                "metadata": {
                    "doc_id": doc_id,
                    "source_url": url,
                    "chunk_index": chunk_index,
                    "text": chunk
                }
            }
        ]
    )

# --------- SITEMAP / MANIFEST Functions -----------
def get_urls_from_sitemap_manifest(base_url: str) -> List[str]:
    """
    Attempt to retrieve URLs from candidate files:
    Try both domain-level and subpath-level sitemaps/JSON manifests.
    Returns a deduplicated list of URLs.
    """
    parsed = urlparse(base_url)
    domain_root = f"{parsed.scheme}://{parsed.netloc}"
    candidates = set()

    # Domain-level candidates.
    candidates.add(urljoin(domain_root, '/sitemap.xml'))
    candidates.add(urljoin(domain_root, '/manifest.json'))
    candidates.add(urljoin(domain_root, '/index.json'))

    # If the base URL has a subpath (e.g. /docs), also check subpath.
    if parsed.path and parsed.path != "/":
        subpath = parsed.path.rstrip("/")
        candidates.add(urljoin(domain_root, subpath + "/sitemap.xml"))
        candidates.add(urljoin(domain_root, subpath + "/manifest.json"))
        candidates.add(urljoin(domain_root, subpath + "/index.json"))

    all_urls = []
    for candidate in candidates:
        try:
            response = requests.get(candidate, timeout=10)
            response.raise_for_status()
            candidate_urls = []
            if candidate.endswith('.xml'):
                # Parse XML sitemap
                from xml.etree import ElementTree
                root = ElementTree.fromstring(response.content)
                namespace = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
                loc_tags = root.findall('.//ns:loc', namespace)
                if not loc_tags:
                    loc_tags = root.findall('.//loc')
                candidate_urls = [loc.text.strip() for loc in loc_tags if loc.text]
            else:
                # Assume JSON format
                data = response.json()
                if isinstance(data, list):
                    candidate_urls = [u for u in data if isinstance(u, str)]
                elif isinstance(data, dict):
                    for key in ['urls', 'sitemap', 'entries']:
                        if key in data and isinstance(data[key], list):
                            candidate_urls = [u for u in data[key] if isinstance(u, str)]
                            break
            if candidate_urls:
                print(f"[INFO] Found {len(candidate_urls)} URLs from {candidate}")
                all_urls.extend(candidate_urls)
        except Exception as e:
            print(f"[INFO] Could not fetch from {candidate}: {e}")

    unique_urls = list(set(all_urls))
    return unique_urls

# --------- BFS Fallback -----------
def get_relevant_urls(base_url: str, max_urls: int = 500) -> List[str]:
    """
    1. Attempt to retrieve URLs from known sitemap/manifest locations (domain + subpath).
    2. If none found, fall back to a BFS approach scanning the base URL.
    """
    candidate_urls = get_urls_from_sitemap_manifest(base_url)
    if candidate_urls:
        candidate_urls = list(set(candidate_urls))
        if len(candidate_urls) > max_urls:
            candidate_urls = candidate_urls[:max_urls]
        print(f"[INFO] Using {len(candidate_urls)} URLs from sitemap/manifest.")
        return candidate_urls

    parsed = urlparse(base_url)
    base_path = parsed.path.rstrip("/")
    visited = set()
    relevant_urls = set()
    queue = [base_url]

    while queue and len(relevant_urls) < max_urls:
        current_url = queue.pop(0)
        if current_url in visited:
            continue
        visited.add(current_url)
        try:
            response = requests.get(current_url, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")
            for link in soup.find_all("a", href=True):
                href = link["href"]
                absolute_url = urljoin(current_url, href)
                parsed_abs = urlparse(absolute_url)
                if parsed_abs.netloc == parsed.netloc and parsed_abs.path.startswith(base_path):
                    if absolute_url not in visited:
                        queue.append(absolute_url)
                        relevant_urls.add(absolute_url)
                        if len(relevant_urls) >= max_urls:
                            break
        except Exception as e:
            print(f"[ERROR] Error fetching {current_url}: {e}")

    print(f"[INFO] Found {len(relevant_urls)} relevant URLs via BFS.")
    return list(relevant_urls)

# --------- Document Status Updates in the documents table -----------
def create_document(doc_id: str, base_url: str, user_id: str):
    """
Insert a new document row into Supabase if it doesn't already exist.
    """
    data = {
        "id": doc_id,
        "url": base_url,
        "user_id": user_id,
        "status": "in_progress",
        "total_urls": 0,
        "processed_urls": 0,
        "failed_urls": 0
    }
    supabase.table("documents").insert(data).execute()

def initialize_document_status(doc_id: str, total_urls: int):
    """
Update the document row with initial status values.
    """
    data = {
        "status": "in_progress",
        "total_urls": total_urls,
        "processed_urls": 0,
        "failed_urls": 0
    }
    supabase.table("documents").update(data).eq("id", doc_id).execute()

def update_document_status(doc_id: str, processed: int, failed: int):
    data = {
        "processed_urls": processed,
        "failed_urls": failed
    }
    supabase.table("documents").update(data).eq("id", doc_id).execute()

def finish_document_status(doc_id: str):
    data = {"status": "completed"}
    supabase.table("documents").update(data).eq("id", doc_id).execute()

# --------- Parallel Scraping + Embedding -----------
async def scrape_and_embed_docs_parallel(urls: List[str], doc_id: str, max_concurrent: int = 5):
    """
Crawl multiple URLs in parallel (with a concurrency limit).
For each URL, scrape the page via crawl4ai, split the text into chunks,
create embeddings, and upsert them to Pinecone.
Update the document status as progress is made.
    """
    print(f"[INFO] Found {len(urls)} URLs to crawl.")
    total_urls = len(urls)

    await asyncio.to_thread(initialize_document_status, doc_id, total_urls)

    browser_config = BrowserConfig(
        headless=True,
        extra_args=["--disable-gpu", "--disable-dev-shm-usage", "--no-sandbox"]
    )
    prune_filter = PruningContentFilter(threshold=0.25, threshold_type="dynamic")
    crawl_config = CrawlerRunConfig(
        markdown_generator=DefaultMarkdownGenerator(
            content_filter=prune_filter,
            options={"ignore_images": True}
        ),
        cache_mode=CacheMode.BYPASS
    )

    crawler = AsyncWebCrawler(config=browser_config)
    await crawler.start()
    semaphore = asyncio.Semaphore(max_concurrent)

    processed_urls = 0
    failures = []

    async def process_url(url: str):
        nonlocal processed_urls
        async with semaphore:
            try:
                result = await crawler.arun(url=url, config=crawl_config)
                if result.success:
                    text = result.markdown_v2.fit_markdown
                    chunks = split_text(text)
                    print(f"[INFO] {url} produced {len(chunks)} chunks.")
                    for idx, chunk in enumerate(chunks):
                        upsert_chunk(doc_id, url, chunk, idx)
                    processed_urls += 1
                    print(f"[INFO] Successfully crawled: {url} ({processed_urls}/{total_urls})")
                else:
                    print(f"[ERROR] Failed: {url} - {result.error_message}")
                    failures.append({"url": url, "error": result.error_message})
            except Exception as e:
                print(f"[ERROR] Exception while processing {url}: {e}")
                failures.append({"url": url, "error": str(e)})
            await asyncio.to_thread(update_document_status, doc_id, processed_urls, len(failures))

    await asyncio.gather(*(process_url(url) for url in urls))
    await crawler.close()

    print(f"[INFO] Completed crawling {processed_urls} out of {total_urls} URLs.")
    await asyncio.to_thread(finish_document_status, doc_id)

    return {"processed": processed_urls, "failed": failures}

# --------- Query + Generate Answer -----------
def query_docs(doc_id: str, query: str, top_k: int = 3):
    """
Embed the query, perform a vector similarity search in Pinecone,
and return the top_k matching chunks.
    """
    q_emb = create_embedding(query)
    search_res = pinecone_index.query(
        vector=q_emb,
        top_k=top_k,
        include_metadata=True,
        filter={"doc_id": doc_id}
    )
    results = []
    if "matches" in search_res:
        for match in search_res["matches"]:
            md = match.metadata
            results.append({
                "source_url": md.get("source_url", ""),
                "text": md.get("text", "")
            })
    return results

def generate_answer(query: str, docs: List[dict]) -> str:
    """
Generate an answer using a language model based on the provided query and document context.
    """
    system_prompt = (
        "You are an AI assistant that answers questions based on provided documentation. "
        "Use the docs if relevant; otherwise, say that no information was found. "
        "At the end, list the sources used."
    )
    docs_context = "\n\n".join(
        [f"Source: {d['source_url']}\nContent: {d['text'][:500]}" for d in docs]
    )
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "assistant", "content": f"Here are the docs:\n{docs_context}"},
        {"role": "user", "content": f"Q: {query}\nA:"}
    ]
    resp = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        temperature=0.3
    )
    return resp.choices[0].message.content

# --------- FastAPI Setup + Endpoints -----------
app = FastAPI()

class DocsCrawlRequest(BaseModel):
    base_url: str  # e.g. "https://supabase.com/docs"
    user_id: str   # Supplied from the signed-in user context.
    doc_id: Optional[str] = None

@app.post("/crawl_docs")
async def crawl_docs_endpoint(req: DocsCrawlRequest):
    """
1. If doc_id is not provided, generate a new UUID and insert a new document row (with user_id).
2. Collect up to 500 URLs from sitemap/manifest or via BFS.
3. Crawl them in parallel, store embeddings in Pinecone, and update document status.
    """
    doc_id = req.doc_id or str(uuid.uuid4())

    if not req.doc_id:
        create_document(doc_id, req.base_url, req.user_id)

    urls = get_relevant_urls(req.base_url, max_urls=500)
    if not urls:
        raise HTTPException(status_code=404, detail="No relevant URLs found on the provided base URL.")

    result = await scrape_and_embed_docs_parallel(urls, doc_id, max_concurrent=5)
    return {
        "message": f"Processed {result['processed']} pages from the base URL.",
        "doc_id": doc_id,
        "urls_found": len(urls),
        "failed": result["failed"]
    }

class ChatRequest(BaseModel):
    doc_id: str
    query: str
    top_k: Optional[int] = 3

@app.post("/chat")
def chat_endpoint(req: ChatRequest):
    docs = query_docs(req.doc_id, req.query, top_k=req.top_k)
    if not docs:
        return {"answer": "No relevant docs found for this doc_id. Please run the crawl first or verify your doc_id."}
    answer = generate_answer(req.query, docs)
    return {"answer": answer}

@app.get("/document_status/{doc_id}")
def get_document_status(doc_id: str):
    """
Return the current status of a document (in_progress, completed, etc.) along with totals.
    """
    response = supabase.table("documents").select(
        "id, status, total_urls, processed_urls, failed_urls"
    ).eq("id", doc_id).execute()
    if response.data:
        return response.data[0]
    else:
        raise HTTPException(status_code=404, detail="No document found for this doc_id.")

@app.get("/")
def root():
    return {"message": "Documentation Crawler + Embedding Uploader + Chat API"}

# To run: poetry run uvicorn test:app --reload
