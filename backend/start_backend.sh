#!/bin/bash

# CRM Business Predictor - Backend Startup Script
# Optimized for RTX 4090

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║   CRM Business Predictor - Backend Server                     ║"
echo "║   Optimized for RTX 4090                                       ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Python is available
if ! command -v python &> /dev/null; then
    if ! command -v python3 &> /dev/null; then
        echo "❌ Python not found! Please install Python 3.9 or higher."
        exit 1
    fi
    PYTHON_CMD=python3
else
    PYTHON_CMD=python
fi

echo "✓ Using Python: $PYTHON_CMD"
$PYTHON_CMD --version
echo ""

# Check if virtual environment exists
if [ -d "venv" ]; then
    echo "✓ Virtual environment found"
    source venv/bin/activate 2>/dev/null || . venv/Scripts/activate 2>/dev/null
    echo "✓ Virtual environment activated"
elif [ -d "../venv" ]; then
    echo "✓ Virtual environment found"
    source ../venv/bin/activate 2>/dev/null || . ../venv/Scripts/activate 2>/dev/null
    echo "✓ Virtual environment activated"
else
    echo "⚠ No virtual environment found (optional)"
fi
echo ""

# Check if models directory exists
if [ ! -d "models" ]; then
    echo "⚠ Models directory not found!"
    echo "  Run setup first: python setup_offline.py --profile gpu-optimized"
    echo ""
    read -p "Would you like to run setup now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        $PYTHON_CMD setup_offline.py --profile gpu-optimized
    else
        echo "  Starting without pre-downloaded models (will use fallback)..."
    fi
else
    echo "✓ Models directory exists"
fi
echo ""

# Set environment variables for optimal GPU performance
export CUDA_LAUNCH_BLOCKING=0
export TOKENIZERS_PARALLELISM=false
export TRANSFORMERS_OFFLINE=0  # Allow downloads if models missing

# Start the backend server
echo "🚀 Starting backend server..."
echo "  URL: http://localhost:8000"
echo "  Press Ctrl+C to stop"
echo ""

$PYTHON_CMD app.py
