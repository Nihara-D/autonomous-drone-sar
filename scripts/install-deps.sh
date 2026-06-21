#!/bin/bash

# Install all dependencies for the Drone SAR system

set -e

echo "================================"
echo "Installing Dependencies"
echo "================================"

# Update system packages
echo "Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Python and build tools
echo "Installing Python and build tools..."
sudo apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    build-essential \
    python3-dev \
    git \
    pkg-config

# Install OpenCV dependencies
echo "Installing OpenCV dependencies..."
sudo apt-get install -y \
    libatlas-base-dev \
    libjasper-dev \
    libtiff5-dev \
    libjasper-dev \
    libharfbuzz0b \
    libwebp6 \
    libtiff5 \
    libjasper1 \
    libharfbuzz0b \
    libwebp6 \
    libtiff5 \
    libjasper1

# Create Python virtual environment
echo "Creating Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install Python packages
echo "Installing Python packages..."
pip install --upgrade pip setuptools wheel
pip install -r backend/requirements.txt

# Install Node.js (if not present)
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install Node packages
echo "Installing Node packages..."
npm install

# Make scripts executable
chmod +x scripts/*.sh

echo ""
echo "================================"
echo "Installation Complete!"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Activate Python virtual environment:"
echo "   source venv/bin/activate"
echo ""
echo "2. Start ArduPilot SITL:"
echo "   ./scripts/start-sitl.sh"
echo ""
echo "3. In another terminal, start dev server:"
echo "   ./scripts/start-dev.sh"
echo ""
