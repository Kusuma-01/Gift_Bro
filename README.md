# 🎁 GiftBro AI – Personalized Gift Recommendation Engine

> **"Find a gift they'll actually love."**  
> An intelligent, end-to-end web application that transforms recipient personalities, interests, relationships, occasions, budgets, and past gifts into thoughtful, non-generic recommendations with conversational refinement.

---

## 🌟 Key Features

- **Empathetic Natural-Language Input**: Describe recipients naturally (e.g. *"My 34-year-old brother. Loves hiking, sci-fi books, and board games. Budget $60. Already has most outdoor gear."*). Optional structured fields for Name, Relationship, Occasion, Budget, and Age are also supported.
- **Tailored, Specific Recommendations**: Generates 6–8 ranked gifts with exact item names, estimated price ranges, category classifications, match scores (80%–99%), and clear explanations of why each item fits without duplicating items they already own.
- **Conversational Refinement**:
  - Refine results conversationally: *"Make them cheaper"*, *"Show me something more unique"*, *"No clothing"*, *"Give me something weird"*, *"Show me gifts under $40"*, *"Give me experience-based gifts"*, or *"Surprise me"*.
  - Maintains conversation context and constraints across turns.
  - Automatically avoids recommending previously rejected, bought, or archived gifts.
- **Recipient Profiles Dashboard**:
  - Save recipient profiles (e.g. Mom, Brother, Coworker, Best Friend).
  - Track last recommendation date and gift counts (Saved, Bought, Archived).
  - 1-click reload into generator to brainstorm new ideas anytime.
- **Gift History & Wishlist Tracker**:
  - Categorized into **Suggested**, **⭐ Saved**, **🛍️ Bought**, and **📁 Archived**.
  - Inline status transitions (e.g. marking a gift as Bought triggers a celebration animation).
  - Prevents the AI from repeating gifts you have already purchased or archived.
- **Export Functionality**:
  - **Copy Gift List**: Formatted text copied to clipboard with 1 click.
  - **Download Gift List**: Exports formatted `.txt` file for sharing or shopping.
- **Dual AI Operation Mode**:
  - **Live LLM Mode**: Seamlessly integrates with Google Gemini (`GEMINI_API_KEY`) or OpenAI (`OPENAI_API_KEY`).
  - **Zero-Config Heuristic Demo Mode**: If no API key is set, an intelligent local rule-based recommendation engine runs out-of-the-box.
- **⚡ AI Response Caching**: Deterministic SHA-256 cache with configurable TTL (`AI_CACHE_TTL_SECONDS`) eliminates duplicate LLM calls, preserves provider/model safety, and returns fast responses (`source: "cache"`).
- **🎙️ Voice Recognition Input**: Native browser speech-to-text dictation (`window.SpeechRecognition`) lets users speak recipient details directly into the description field with graceful permission fallback.
- **1-Click Pre-configured Personas**: Includes instant test buttons for all 4 benchmark personas (Brother, Mom, Coworker, 5yo Daughter).

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | React 18, Vite | High-performance SPA with fast HMR |
| **Styling** | Tailwind CSS | Modern, warm gift-oriented design system |
| **Icons & UX** | Lucide React, Canvas Confetti | Crisp icons, toast alerts, celebration animations |
| **Backend** | Node.js, Express.js (ES Modules) | RESTful API with structured routes & controllers |
| **Database** | SQLite (`sql.js`) | File-persisted local SQLite database (`giftbro.db`) |
| **AI Layer** | Dedicated AI Service | Gemini REST API / OpenAI API with fallback engine |

---

## 🏛️ Architecture & Folder Structure

```
giftbro-ai/
├── backend/
│   ├── data/
│   │   └── giftbro.db              # Persisted SQLite database
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js         # SQLite connection & schema init
│   │   ├── controllers/
│   │   │   ├── recommendationController.js
│   │   │   ├── recipientController.js
│   │   │   └── giftController.js
│   │   ├── routes/
│   │   │   └── apiRoutes.js        # Express router
│   │   ├── services/
│   │   │   ├── aiService.js        # Live LLM provider (Gemini / OpenAI)
│   │   │   ├── mockAiService.js    # Heuristic fallback recommendation engine
│   │   │   ├── promptTemplates.js  # System prompts & schema specifications
│   │   │   └── dbService.js        # SQLite repository abstraction layer
│   │   ├── utils/
│   │   │   └── jsonValidator.js    # JSON sanitization & normalization
│   │   └── server.js               # Express application entry point
│   ├── test/
│   │   └── api.test.js             # Automated end-to-end test suite
│   ├── .env.example
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Header navigation & AI status indicator
│   │   │   ├── HeroSection.jsx     # Headline & 1-click test persona buttons
│   │   │   ├── RecipientInput.jsx  # Conversational input & structured fields
│   │   │   ├── RecommendationCards.jsx # Results grid & profile breakdown
│   │   │   ├── RecommendationCard.jsx  # Individual ranked card with actions
│   │   │   ├── ChatRefinement.jsx  # Chat stream & quick refinement chips
│   │   │   ├── RecipientProfiles.jsx   # Saved recipients management dashboard
│   │   │   ├── GiftHistory.jsx     # History & wishlist tracker with filters
│   │   │   ├── ExportButton.jsx    # Formatted Copy & Download handlers
│   │   │   ├── LoadingState.jsx    # Shimmer skeleton loader cards
│   │   │   ├── ErrorMessage.jsx    # Friendly retry alert
│   │   │   ├── EmptyState.jsx      # Welcoming placeholder
│   │   │   └── Toast.jsx           # Animated floating notifications
│   │   ├── context/
│   │   │   └── AppContext.jsx      # Global state provider
│   │   ├── services/
│   │   │   └── api.js              # Centralized fetch API client
│   │   ├── App.jsx                 # Main layout
│   │   ├── index.css               # Tailwind directives & shimmer styles
│   │   └── main.jsx                # React DOM root
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── README.md
└── .gitignore
```

---

## 🔑 Environment Variables

The backend uses a `.env` file located in `backend/.env`.

| Variable | Description | Default | Required? |
|---|---|---|---|
| `PORT` | Backend server port | `3001` | No |
| `GEMINI_API_KEY` | Google Gemini API Key | *(empty)* | Optional (Falls back to Demo mode if missing) |
| `OPENAI_API_KEY` | OpenAI API Key | *(empty)* | Optional |
| `OPENAI_MODEL` | OpenAI Model Name | `gpt-4o-mini` | No |

> 🔒 **Security Notice**: API keys are strictly loaded on the backend and are **never** exposed to client-side code.

---

## 🚀 Quickstart & Installation

### Prerequisites
- Node.js (v18 or newer; tested on Node v24)
- npm (v9 or newer)

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 2: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

## 💻 Running the Application

### Start the Backend Server (Port 3001)
```bash
cd backend
npm start
```
*The server will start on `http://localhost:3001` and initialize `backend/data/giftbro.db`.*

### Start the Frontend Dev Server (Port 5173)
```bash
cd frontend
npm run dev
```
*Open [http://localhost:5173](http://localhost:5173) in your browser.*

---

## 🧪 Running Automated Tests

GiftBro AI includes a comprehensive automated test suite testing:
- SQLite schema & database persistence
- Recipient Profile CRUD operations
- All 4 Benchmark personas (Brother, Mom, Founder Coworker, 5yo Daughter)
- Conversational refinement loops (*"Make them cheaper"*, *"No clothing"*)
- Status transitions (`suggested` -> `saved` -> `bought` -> `archived`)
- Exclusion of past and redundant items

To run the tests:
```bash
cd backend
npm test
```

---

## 📡 API Endpoints

### 1. Recommendations
- `POST /api/recommend-gifts`
  - **Body**: `{ description: string, name?: string, relationship?: string, budget?: string, age?: string, occasion?: string, recipient_id?: string }`
  - **Returns**: `{ recipient_id, recipient_summary, gifts: [...], is_demo_mode, provider }`
- `POST /api/refine-gifts`
  - **Body**: `{ user_refinement: string, recipient_id?: string, recipient_info?: object, previous_recommendations?: array, conversation_history?: array }`
  - **Returns**: Refined gift list adhering to new constraints.
- `GET /api/ai-status`
  - **Returns**: Current AI provider and mode (`Live AI Mode` or `Demo / Heuristic Fallback Mode`).

### 2. Recipients
- `POST /api/recipients`: Create a recipient profile.
- `GET /api/recipients`: Retrieve all profiles with gift statistics.
- `GET /api/recipients/:id`: Retrieve single profile with full gift history.
- `PUT /api/recipients/:id`: Update profile info.
- `DELETE /api/recipients/:id`: Delete profile and cascade-delete its gifts.

### 3. Gifts & History
- `POST /api/recipients/:id/gifts`: Save a gift directly to a recipient.
- `PUT /api/gifts/:id/status`: Update status to `bought`, `archived`, `saved`, or `suggested`.
- `GET /api/recipients/:id/history`: Get grouped gift history for a recipient.

---

## 🤖 AI Schema & Prompt Formatting

The backend enforces strict JSON output from LLMs:

```json
{
  "recipient_summary": "Empathetic 1-2 sentence breakdown of recipient personality and constraints",
  "gifts": [
    {
      "rank": 1,
      "name": "Dune: Imperium – Board Game",
      "price_range": "$50-$60",
      "category": "Board Games & Sci-Fi",
      "reasoning": "Blends his love for sci-fi literature and high-depth board games without adding clutter to his outdoor gear.",
      "match_score": 98
    }
  ]
}
```

---

## 📋 Export Format Specification

The export button generates cleanly structured text for messaging or printing:

```text
Gift Ideas for: Brother

1. Dune: Imperium – Board Game
Price: $50-$60
Why: Blends his love for sci-fi literature and high-depth board games without adding clutter to his outdoor gear.

2. Project Hail Mary (Special Illustrated Hardcover by Andy Weir)
Price: $30-$40
Why: A modern sci-fi masterpiece by the author of The Martian that any sci-fi devotee will binge in a weekend.
```

---

## 🛒 Shopping Integration

GiftBro AI includes a modular shopping integration allowing users to immediately explore, price check, and purchase recommended gifts on leading e-commerce platforms.

### Supported Platforms
- **Amazon**: `https://www.amazon.com/s?k={query}`
- **Flipkart**: `https://www.flipkart.com/search?q={query}`
- **Google Shopping**: `https://www.google.com/search?tbm=shop&q={query}`

### How Shopping Links Work
1. **Targeted Search Queries**: Avoids vague categories (e.g. searching for `"Vintage Enamel Camping Mug"` rather than generic `"mug"`).
2. **Safe URL Encoding**: All search queries are sanitized and encoded with `encodeURIComponent` to prevent breakage from spaces and special characters (`&`, `:`, quotes, `#`).
3. **New Tab Isolation**: External merchant links open in a separate tab with `rel="noopener noreferrer"` security attributes.
4. **Estimated vs. Live Pricing**: Recommendation cards explicitly label prices as **Estimated Price** to clarify that live inventory and pricing are confirmed on the retailer's site.
5. **Anonymous Click Tracking**: Clicking a merchant search triggers an event to `POST /api/tracking/shopping-click` for usage analytics without collecting personal data.

### How to Add Another Shopping Platform
Platforms are centrally configured in `frontend/src/services/shoppingService.js`:

```javascript
export const SHOPPING_PLATFORMS = [
  // ... existing platforms
  {
    id: 'etsy',
    name: 'Etsy',
    badge: 'Handmade & Vintage',
    tagline: 'Unique handcrafted gifts & artisan crafts',
    color: 'from-orange-500 to-amber-600',
    icon: '🎨',
    urlTemplate: 'https://www.etsy.com/search?q={query}',
    isAvailable: true,
  }
];
```

### Future Real-Product API Integration
The shopping architecture defines an extensible abstract base class `ShoppingProvider`:

```javascript
export class ShoppingProvider {
  async searchProducts(query) { /* ... */ }
  async getProductDetails(productId) { /* ... */ }
  async getPrice(productId) { /* ... */ }
  async getAvailability(productId) { /* ... */ }
}
```

When live store credentials (such as Amazon PA-API, Flipkart Affiliate, or Google Content API for Shopping) are configured via backend environment variables, a concrete provider subclass can be registered to fetch live store pricing and direct affiliate checkout URLs without altering the React UI.

---

## 🔮 Future Enhancements

- **Direct Affiliate Checkouts**: Plug live Amazon PA-API or Flipkart Affiliate API into `ShoppingProvider`.
- **PostgreSQL / Firebase Migration**: Seamlessly replace `dbService.js` with Prisma or Supabase.
- **Occasion Reminders**: Automated email/calendar notifications 2 weeks before birthdays and holidays.
- **Collaborative Group Gifting**: Shareable wishlist links for family and friends to coordinate who buys what.
