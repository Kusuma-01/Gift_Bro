# GiftBro AI

GiftBro AI is a personalized gift recommendation engine that leverages advanced AI (Gemini/OpenAI) to generate thoughtful, tailored gift ideas.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Environment Variables**
   The backend requires a `.env` file to function properly. See `backend/.env.example`.
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env to include a secure JWT_SECRET and your AI API keys
   ```
   **Required variables in production:**
   - `JWT_SECRET`: Used to sign authentication tokens. Generate a secure random string (e.g. `openssl rand -hex 32`).

3. **Running the Application**
   ```bash
   # Run backend
   cd backend && npm start
   
   # Run frontend
   cd frontend && npm run dev
   ```

## Demo / Fallback Mode

If you don't configure an AI provider API key (like `GEMINI_API_KEY` or `OPENAI_API_KEY`), the backend automatically drops into **Fallback/Demo Mode**. In this mode, it uses an extensive internal catalog to mock AI responses instantly. It is safe for development without incurring API costs.

## Security & Robustness
- **Authentication**: JWT-based. Passwords use PBKDF2 with SHA-512 (documented parameters).
- **Resource Ownership**: Endpoints rigorously check user ownership before returning or modifying resources (403 Forbidden).
- **Protection**: Includes `helmet` for security headers, strict CORS validation, and `express-rate-limit` to prevent brute force on auth endpoints.

## API Documentation

GiftBro AI uses OpenAPI 3.0 for its API specification. 
Once the backend is running, visit:
**`http://localhost:3001/api-docs`**

## Testing

The project uses Node's native test runner (`node:test`).
- **Run all tests**: `npm test`
- **Run with coverage**: `npm run test:coverage` (Requires `c8`)

## Advanced Features
- **Semantic Deduplication**: Integrates AI embeddings to prevent recommending conceptually identical gifts during conversational refinement.
- **Feedback Loop**: Support for user thumbs-up/down feedback to inform future personalized suggestions.
