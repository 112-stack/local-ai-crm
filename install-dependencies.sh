#!/bin/bash
# Installation script for Linux/Mac
# Installs all dependencies for CRM Business Predictor

set -e

echo "========================================"
echo " CRM Business Predictor Setup"
echo " Installing Dependencies"
echo "========================================"
echo

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 not found! Please install Python 3.8 or higher"
    exit 1
fi

echo "[1/4] Python version:"
python3 --version
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js not found! Please install Node.js 16 or higher"
    exit 1
fi

echo "[2/4] Node.js version:"
node --version
echo

# Install frontend dependencies
echo "[3/4] Installing frontend dependencies..."
npm install
echo "Frontend dependencies installed successfully!"
echo

# Install backend dependencies
echo "[4/4] Installing backend dependencies..."
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment and install dependencies
echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing Python packages..."
python -m pip install --upgrade pip
pip install -r requirements.txt

# Install PyTorch with CUDA support for RTX 4090
echo
echo "Installing PyTorch with CUDA 12.1 support (for RTX 4090)..."
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

cd ..

echo
echo "========================================"
echo " Installation Complete!"
echo "========================================"
echo
echo "Next steps:"
echo "  1. Download AI models: ./setup-offline.sh"
echo "  2. Start the application: ./start-app.sh"
echo

chmod +x setup-offline.sh start-app.sh
