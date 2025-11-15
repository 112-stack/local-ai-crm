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


def initialize_models(download_huggingface=False):
    """
    Initialize all required models

    Args:
        download_huggingface: If True, downloads recommended Hugging Face models
                             (default: False to avoid long startup times)
    """
    print("\n" + "=" * 70)
    print("🤖 Initializing AI Models")
    print("=" * 70)

    downloader = ModelDownloader()

    # Check if business predictor model exists
    if not downloader.check_model_availability('business_predictor.pth'):
        print("\n📥 Business predictor model not found. Creating...")
        downloader.create_default_model('business_predictor.pth')
    else:
        print("\n✓ Business predictor model available")

    # Optionally download Hugging Face models
    if download_huggingface:
        print("\n" + "=" * 70)
        print("📦 Checking Hugging Face Models")
        print("=" * 70)

        # Check if recommended models are already downloaded
        recommended_models = ['sentiment', 'emotion', 'ner', 'financial-sentiment']
        missing_models = []

        for model_key in recommended_models:
            manifest_key = f'hf_{model_key}'
            if manifest_key not in downloader.manifest or \
               downloader.manifest[manifest_key].get('status') != 'downloaded':
                missing_models.append(model_key)

        if missing_models:
            print(f"\n📥 Missing models: {', '.join(missing_models)}")
            print("   Run 'python -m services.model_downloader download-recommended'")
            print("   to download recommended Hugging Face models")
        else:
            print("\n✓ All recommended Hugging Face models are available")
    else:
        print("\n💡 Tip: Run 'python -m services.model_downloader download-recommended'")
        print("   to download pre-trained Hugging Face models for advanced NLP tasks")

    print("\n" + "=" * 70)
    print("✓ Model initialization complete")
    print("=" * 70 + "\n")


if __name__ == '__main__':
    # Allow command line argument to trigger HF model download
    download_hf = '--download-hf' in sys.argv
    initialize_models(download_huggingface=download_hf)
