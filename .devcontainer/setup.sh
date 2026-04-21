#!/bin/bash
set -e

echo "==> Installing npm dependencies..."
cd /workspace && npm install

echo "==> Enabling pgvector extension..."
PGPASSWORD=postgres psql -h localhost -U postgres -d orra \
  -c "CREATE EXTENSION IF NOT EXISTS vector;" 2>/dev/null || \
  echo "pgvector already enabled or postgres not ready yet — run manually"

echo "==> Running Prisma migrations..."
cd /workspace/packages/db && npx prisma generate && npx prisma db push

echo "==> Pulling Ollama models (this takes 3-5 min)..."
ollama pull llama3.2          # ~2GB — main LLM
ollama pull nomic-embed-text  # ~270MB — embeddings

echo ""
echo "✅ Orra is ready!"
echo "   Run: npm run dev"
echo "   Dashboard opens automatically at port 5173"
