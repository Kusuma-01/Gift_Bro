# GiftBro AI Architecture

## Overview

GiftBro AI follows a modular, monolithic architecture using Express.js (Node.js) on the backend and React/Vite on the frontend. The system relies heavily on AI APIs (Gemini/OpenAI) for core business logic, with deterministic caching to optimize latency and cost.

## Request Lifecycle

```mermaid
sequenceDiagram
    participant C as React Client
    participant API as Express Router
    participant Auth as Auth Middleware
    participant Val as Validation Middleware
    participant Ctl as Controller
    participant AI as aiService
    participant Cache as cacheService
    participant DB as dbService / SQLite
    
    C->>API: POST /api/recommend-gifts
    API->>Auth: Verify JWT Token
    Auth->>Val: Check input schema
    Val->>Ctl: Pass validated payload
    Ctl->>AI: generateRecommendations()
    
    AI->>Cache: generateCacheKey()
    Cache-->>AI: Cache Miss
    
    AI->>AI: Request LLM (Gemini/OpenAI)
    AI-->>AI: Receive JSON response
    
    AI->>Cache: setCachedResponse()
    AI-->>Ctl: Return suggestions
    
    Ctl->>DB: Save generated gifts
    DB-->>Ctl: Persist success
    
    Ctl-->>C: 200 OK + Payload
```

## Scaling the Database

Currently, GiftBro AI uses `sql.js` for zero-configuration, in-memory SQLite storage that writes back to disk on every mutating transaction (`saveDatabase()`). 

**Scaling Limit:** This approach means the entire database is held in application memory, and concurrent disk writes are not safely isolated for high traffic. 

**Migration Path for Production:**
1. **Short Term:** Swap `sql.js` for `better-sqlite3`. This provides native bindings, file-based WAL (Write-Ahead Logging), and supports concurrent reads/writes without loading the entire dataset into RAM.
2. **Long Term:** Migrate to PostgreSQL. Update `getDatabase()` and `runQuery()` in `database.js` and `dbService.js` to use `pg` or an ORM like Sequelize/Prisma to accommodate horizontal scaling of the backend fleet.
