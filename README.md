# ◎ Orra — AI Voice Infrastructure for Websites

> Drop one script tag onto any website. Visitors get a real-time voice AI that explains your content, answers questions, and captures leads automatically.

---

## Architecture

```
[Website Visitor]
      │  WebSocket (voice/text)
      ▼
[Voice Service :3001]  ←── Deepgram ASR + ElevenLabs TTS
      │
      ▼
[LLM Service :3003]  ←── OpenAI GPT-4o-mini
      │                    ├── Retrieval Service :3002 (Pinecone RAG)
      │                    └── Redis (session memory)
      ▼
[API Gateway :3000]  ←── JWT + API Key auth
      │
      ▼
[Postgres DB]  ←── Businesses, Assistants, Leads, Conversations

[Dashboard :5173]  ←── React (Vite) — Onboarding, Customize, Leads, Deploy
```

---

## Services

| Service | Port | Tech | Purpose |
|---------|------|------|---------|
| `apps/api-gateway` | 3000 | Express | Auth, business routes, widget API |
| `services/voice` | 3001 | WS + Express | Real-time audio pipeline |
| `services/retrieval` | 3002 | Express | Web crawler + RAG (Pinecone) |
| `services/llm` | 3003 | Express | Conversation engine (OpenAI) |
| `services/lead` | 3004 | Express | Lead capture + email notify |
| `apps/dashboard` | 5173 | React/Vite | Business owner UI |
| `apps/widget` | CDN | Vanilla JS | Embeddable chat/voice widget |

---

## Quick Start (Local Dev)

### 1. Prerequisites

- Node.js 20+
- Docker & Docker Compose (for Postgres + Redis)
- API keys (see below)

### 2. Clone & Install

```bash
git clone https://github.com/your-org/orra.git
cd orra
npm install
```

### 3. Set Up Environment

```bash
cp .env.example .env
# Edit .env with your API keys
```

### 4. API Keys You Need

| Service | Key | Free Tier | Link |
|---------|-----|-----------|------|
| **OpenAI** | `OPENAI_API_KEY` | $5 credit | [platform.openai.com](https://platform.openai.com) |
| **Pinecone** | `PINECONE_API_KEY` | 1 free index | [pinecone.io](https://pinecone.io) |
| **Deepgram** | `DEEPGRAM_API_KEY` | $200 credit | [deepgram.com](https://deepgram.com) |
| **ElevenLabs** | `ELEVENLABS_API_KEY` | 10k chars/mo | [elevenlabs.io](https://elevenlabs.io) |

#### Pinecone Setup
1. Go to [pinecone.io](https://pinecone.io) → Create Index
2. **Index name**: `orra-website`
3. **Dimensions**: `1536`
4. **Metric**: `cosine`
5. Copy the API key into `.env`

### 5. Start Infrastructure

```bash
docker compose -f infra/docker/docker-compose.yml up postgres redis -d
```

### 6. Init Database

```bash
cd packages/db
npx prisma generate
npx prisma db push
cd ../..
```

### 7. Start All Services

```bash
npm run dev
# This starts: api-gateway, voice, retrieval, llm, lead, dashboard
```

### 8. Open Dashboard

```
http://localhost:5173
```

Sign up → Enter your website URL → Crawl → Customize → Copy script tag → Done.

---

## Widget Installation

After deploying, copy this into your website before `</body>`:

```html
<script
  src="https://your-api-domain.com/widget.js"
  data-id="orra_YOUR_API_KEY"
  data-api="https://your-api-domain.com"
  data-ws="wss://your-voice-domain.com"
  async
></script>
```

---

## Docker Compose (Full Stack)

```bash
# Copy and fill your env file
cp .env.example .env

# Start everything
docker compose -f infra/docker/docker-compose.yml up -d

# View logs
docker compose -f infra/docker/docker-compose.yml logs -f
```

---

## Project Structure

```
orra/
├── apps/
│   ├── api-gateway/          # Express REST API + Auth
│   │   ├── middleware/auth.js # JWT + API key validation
│   │   ├── routes/business.js # Signup, login, assistant CRUD, leads
│   │   └── routes/widget.js   # Widget config, session init, lead capture
│   ├── dashboard/             # React dashboard (Vite)
│   │   └── src/
│   │       ├── pages/         # Login, Onboarding, Customize, Leads, Deploy
│   │       └── components/    # Layout, sidebar
│   └── widget/                # Embeddable JS widget
│       ├── index.js            # Entry point + WebSocket client
│       ├── audio.js            # Mic capture + audio playback
│       ├── context.js          # Page URL/scroll tracking
│       └── ui.js               # Floating button + chat panel UI
├── services/
│   ├── voice/                 # WebSocket voice pipeline
│   │   ├── asr.js              # Deepgram streaming transcription
│   │   └── tts.js              # ElevenLabs text-to-speech
│   ├── llm/                   # Conversation engine
│   │   ├── engine.js           # Orchestrates retrieval + OpenAI
│   │   ├── intent.js           # high_intent vs explore classifier
│   │   ├── memory.js           # Redis session memory
│   │   └── prompts.js          # 5 tone-based system prompts
│   ├── retrieval/             # RAG pipeline
│   │   ├── crawler.js          # Cheerio web crawler (20 pages)
│   │   ├── chunker.js          # Semantic text chunking
│   │   ├── embedder.js         # OpenAI → Pinecone upsert
│   │   └── search.js           # Pinecone vector search
│   └── lead/                  # Lead management
│       ├── capture.js          # Save + query leads (Prisma)
│       └── notify.js           # Email notification (Nodemailer)
├── packages/
│   ├── db/                    # Prisma client + schema
│   └── shared/                # Logger + shared utilities
└── infra/
    ├── docker/                # Dockerfiles + docker-compose.yml
    └── k8s/                   # Kubernetes deployment manifests
```

---

## Environment Variables

See `.env.example` for the full list with descriptions.

---

## Deployment (Production)

### Railway / Render (Easiest)
1. Push to GitHub
2. Connect Railway → deploy each service as a separate service
3. Add all env vars in Railway dashboard
4. Set `DATABASE_URL` to Railway's Postgres addon

### Docker on VPS
```bash
git clone your-repo && cd orra
cp .env.example .env && vim .env
docker compose -f infra/docker/docker-compose.yml up -d
```

### Kubernetes
```bash
# Create secrets first
kubectl create secret generic orra-secrets --from-env-file=.env
kubectl apply -f infra/k8s/deployment.yml
```

---

## License

MIT
