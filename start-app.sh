#!/bin/bash
# Startup script for CRM Business Predictor (Linux/Mac)
# Runs both frontend and backend servers

set -e

echo "========================================"
echo " CRM Business Predictor"
echo " Starting Application (Offline Mode)"
echo "========================================"
echo

# Check if models are downloaded
if [ ! -f "backend/models/manifest.json" ]; then
    echo "WARNING: AI models not found!"
    echo "Please run ./setup-offline.sh first to download models."
    echo
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo
    echo "Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null || true
    exit 0
}

trap cleanup EXIT INT TERM

# Start backend in background
echo "Starting backend server..."
cd backend
source venv/bin/activate
python app.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 5

# Start frontend
echo
echo "========================================"
echo " Application Starting"
echo "========================================"
echo
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8000"
echo
echo "  Press Ctrl+C to stop both servers"
echo "========================================"
echo

npm run dev
