#!/bin/bash
# Setup script for offline mode - Downloads all required AI models
# This is the ONLY step that requires internet connection

set -e

echo "========================================"
echo " CRM Business Predictor"
echo " Offline Model Setup"
echo "========================================"
echo
echo "This script will download all required AI models"
echo "for offline operation. This is the ONLY step that"
echo "requires an internet connection."
echo
echo "Model download size: ~3-5 GB"
echo "Time required: 10-30 minutes (depending on internet speed)"
echo
read -p "Press Enter to continue..."

cd backend

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

echo
echo "Starting model download..."
echo

# Run the offline setup script
python setup_offline.py --profile gpu-optimized

cd ..

echo
echo "========================================"
echo " Offline Setup Complete!"
echo "========================================"
echo
echo "All models have been downloaded."
echo "You can now run the application OFFLINE!"
echo
echo "To start: ./start-app.sh"
echo
