-- Capstone II STG-452
-- Authors: Brian Cook, Dima Bondar, James Green
-- Professor: Bill Hughes
-- Our Own Work
-- License: MIT

-- Table for storing ingested API documentation
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  api_url TEXT NOT NULL,
  content TEXT NOT NULL,
  user_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- Table for conversation sessions linked to a document
CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- Table for conversation messages to record each chat turn
CREATE TABLE IF NOT EXISTS conversation_messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);
