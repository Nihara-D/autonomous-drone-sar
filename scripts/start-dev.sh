#!/bin/bash

# Autonomous Drone SAR - Development Startup Script
# This script starts all components needed for local development

set -e

echo "================================"
echo "Drone SAR - Development Setup"
echo "================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check Python installation
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed"
    exit 1
fi

# Check Node installation
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    exit 1
fi

# Start backend in background
echo -e "${BLUE}Starting Python Backend...${NC}"
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install requirements
pip install -r requirements.txt > /dev/null 2>&1

# Start backend
python main.py &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"

cd ..

# Wait for backend to be ready
echo "Waiting for backend to be ready..."
sleep 3

# Start frontend
echo -e "${BLUE}Starting Frontend...${NC}"
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Development Environment Ready!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8000"
echo "WebSocket: ws://localhost:8765"
echo ""
echo "To stop, press Ctrl+C or run: kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "Next steps:"
echo "1. Start ArduPilot SITL in another terminal:"
echo "   sim_vehicle.py -v ArduCopter --home=6.9271,79.8612,0,0 --model=quad"
echo "2. Open http://localhost:3000 in your browser"
echo "3. Click 'Connect' to connect to the drone"
echo ""

# Wait for processes
wait
