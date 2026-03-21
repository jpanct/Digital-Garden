#!/bin/bash
# Digital Garden Learning App - Start Script

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

echo "🌱 Starting Digital Garden Learning App..."

# Check for .env
if [ ! -f "$BACKEND_DIR/.env" ]; then
  echo "⚠️  No backend/.env found. Copying from .env.example..."
  cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
  echo "❗ Please edit backend/.env and add your API keys:"
  echo "   - ANTHROPIC_API_KEY"
  echo "   - TAVILY_API_KEY"
  echo ""
  echo "Then re-run this script."
  exit 1
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd "$BACKEND_DIR"
python3 -m pip install -r requirements.txt -q
cd "$SCRIPT_DIR"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd "$FRONTEND_DIR"
npm install --silent
cd "$SCRIPT_DIR"

echo ""
echo "✅ Ready! Starting servers..."
echo "   Backend: http://localhost:8000"
echo "   Frontend: http://localhost:5173"
echo ""

# Start backend in background
cd "$BACKEND_DIR" && python3 run.py &
BACKEND_PID=$!

# Start frontend
cd "$FRONTEND_DIR" && npm run dev &
FRONTEND_PID=$!

echo "Press Ctrl+C to stop both servers."

# Wait and cleanup
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
