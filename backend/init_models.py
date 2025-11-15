"""
Initialize models on backend startup
This ensures all required models are available before the server starts
"""

import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from services.model_downloader import ModelDownloader


def initialize_models():
    """Initialize all required models"""
    print("\n" + "=" * 60)
    print("🤖 Initializing AI Models")
    print("=" * 60)

    downloader = ModelDownloader()

    # Check if business predictor model exists
    if not downloader.check_model_availability('business_predictor.pth'):
        print("\n📥 Business predictor model not found. Creating...")
        downloader.create_default_model('business_predictor.pth')
    else:
        print("\n✓ Business predictor model available")

    print("\n" + "=" * 60)
    print("✓ Model initialization complete")
    print("=" * 60 + "\n")


if __name__ == '__main__':
    initialize_models()
