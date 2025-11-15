#!/bin/bash
echo "Starting React CRM Business Predictor..."
echo ""
echo "Backend will run on http://localhost:8000"
echo "Frontend will run on http://localhost:5173"
echo ""

# Start backend in background
cd backend
source venv/bin/activate
python app.py &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✓ Both servers are running!"
echo "  Backend PID: $BACKEND_PID"
echo "  Frontend PID: $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Trap Ctrl+C and cleanup
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT

# Wait for both processes
wait
