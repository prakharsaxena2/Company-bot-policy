# Company Chatbot

A simple company knowledge chatbot with a browser UI and backend retrieval powered by Groq and Pinecone.

## Features

- Company landing page with chatbot access
- Floating open/close chatbot panel
- File upload to index custom PDF documents
- POST `/api/chat` endpoint for sending questions
- Retrieval-based answers using indexed company docs

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the project root with at least:
   ```env
   GROQ_API_KEY=your_groq_api_key
   PINECONE_API_KEY=your_pinecone_api_key
   PINECONE_ENVIRONMENT=your_pinecone_environment
   PINECONE_INDEX_NAME=your_pinecone_index_name
   ```

3. Start the app:
   ```bash
   npm start
   ```

4. Open the page in your browser:
   ```text
   http://localhost:3000
   ```

5. Upload a PDF document via the chatbot panel to index it for questions.

## Notes

- The frontend is served from `Frontend/index.html`.
- The backend is implemented in `server.js`.
- The original CLI chatbot logic is reused through the same retrieval flow.
