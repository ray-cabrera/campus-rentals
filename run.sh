#!/bin/bash

# Campus Rentals - Quick Start Script

echo "=========================================="
echo "   Campus Rentals - Quick Start"
echo "=========================================="
echo ""

# Check if running in project root
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "Error: Please run this script from the project root directory"
    exit 1
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for required tools
if ! command_exists python3; then
    echo "Error: Python 3 is required"
    exit 1
fi

if ! command_exists npm; then
    echo "Error: Node.js/npm is required"
    exit 1
fi

echo "Starting Campus Rentals..."
echo ""

# Start backend
echo "[1/4] Setting up Python virtual environment..."
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate

echo "[2/4] Installing Python dependencies..."
pip install -r requirements.txt -q

echo "[3/4] Seeding database with demo data..."
python seed_data.py

echo "[4/4] Starting backend server..."
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
echo ""
echo "Starting frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "=========================================="
echo "   Campus Rentals is running!"
echo "=========================================="
echo ""
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "   Demo Login:"
echo "   Email: demo@princeton.edu"
echo "   Password: demo123"
echo ""
echo "   Press Ctrl+C to stop all servers"
echo "=========================================="

# Trap to cleanup on exit
cleanup() {
    echo ""
    echo "Shutting down..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for processes
wait
