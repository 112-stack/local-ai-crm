#!/usr/bin/env python3
"""
Offline Setup Script for CRM Business Predictor
Downloads all required models for offline operation
Optimized for RTX 4090 GPU
"""

import os
import sys
import argparse
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from services.model_downloader import ModelDownloader


def print_banner():
    """Print setup banner"""
    print("""
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   CRM Business Predictor - Offline Setup                      ║
║   Optimized for RTX 4090 GPU                                   ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
""")


def check_gpu():
    """Check GPU availability"""
    try:
        import torch

        print("\n" + "=" * 70)
        print("🔍 System Check")
        print("=" * 70)

        print(f"  Python version: {sys.version.split()[0]}")
        print(f"  PyTorch version: {torch.__version__}")
        print(f"  CUDA available: {torch.cuda.is_available()}")

        if torch.cuda.is_available():
            print(f"  CUDA version: {torch.version.cuda}")
            print(f"  GPU name: {torch.cuda.get_device_name(0)}")

            gpu_memory = torch.cuda.get_device_properties(0).total_memory / (1024**3)
            print(f"  GPU memory: {gpu_memory:.1f} GB")

            if gpu_memory < 8:
                print(f"\n  ⚠ Warning: GPU has limited memory ({gpu_memory:.1f}GB)")
                print(f"    Some larger models may not fit. Consider using 'minimal' profile.")
            elif gpu_memory >= 20:
                print(f"\n  ✓ Excellent! Your GPU can run all models including large LLMs")
            else:
                print(f"\n  ✓ Good! Your GPU can run most models")

            return True
        else:
            print("\n  ⚠ No GPU detected. Models will run on CPU (slower)")
            print("    For RTX 4090, ensure CUDA drivers and PyTorch with CUDA are installed")
            print("    Install PyTorch with CUDA: pip install torch --index-url https://download.pytorch.org/whl/cu121")
            return False

    except ImportError:
        print("\n  ✗ PyTorch not installed!")
        print("    Install with: pip install torch --index-url https://download.pytorch.org/whl/cu121")
        return False


def download_models(profile='gpu-optimized', include_llm=False):
    """Download models based on profile"""
    downloader = ModelDownloader()

    print("\n" + "=" * 70)
    print("📦 Model Download Configuration")
    print("=" * 70)
    print(f"  Profile: {profile}")
    print(f"  Include LLM: {'Yes' if include_llm else 'No'}")

    # Create default PyTorch model
    print("\n" + "=" * 70)
    print("🔧 Creating Default PyTorch Model")
    print("=" * 70)
    downloader.create_default_model('business_predictor.pth')

    # Download HuggingFace models
    print("\n" + "=" * 70)
    print("🤖 Downloading HuggingFace Transformer Models")
    print("=" * 70)

    success = downloader.download_recommended_models(profile=profile)

    # Optionally download LLM
    if include_llm:
        print("\n" + "=" * 70)
        print("🧠 Downloading Large Language Model")
        print("=" * 70)
        print("  This may take a while (5-15GB download)...")

        # Try Phi-2 first (smaller), then Mistral if user has enough GPU memory
        try:
            import torch
            gpu_memory = torch.cuda.get_device_properties(0).total_memory / (1024**3) if torch.cuda.is_available() else 0

            if gpu_memory >= 16:
                print("  Downloading Mistral-7B-Instruct (recommended for RTX 4090)")
                downloader.download_huggingface_model(model_key='mistral-7b-instruct')
            else:
                print("  Downloading Phi-2 (smaller LLM)")
                downloader.download_huggingface_model(model_key='llm-7b')
        except:
            print("  Downloading Phi-2 (smaller LLM)")
            downloader.download_huggingface_model(model_key='llm-7b')

    # Print summary
    print("\n" + "=" * 70)
    print("📊 Download Summary")
    print("=" * 70)
    downloader.list_available_models()

    return success


def verify_installation():
    """Verify that all dependencies are installed"""
    print("\n" + "=" * 70)
    print("✅ Verifying Installation")
    print("=" * 70)

    required_packages = [
        'torch',
        'transformers',
        'sentence_transformers',
        'numpy',
        'pandas',
        'sklearn'
    ]

    missing = []
    for package in required_packages:
        try:
            __import__(package)
            print(f"  ✓ {package}")
        except ImportError:
            print(f"  ✗ {package} - NOT INSTALLED")
            missing.append(package)

    if missing:
        print(f"\n  ⚠ Missing packages: {', '.join(missing)}")
        print(f"    Install with: pip install -r requirements.txt")
        return False
    else:
        print(f"\n  ✓ All required packages installed")
        return True


def main():
    """Main setup function"""
    parser = argparse.ArgumentParser(
        description='Setup CRM Business Predictor for offline use'
    )
    parser.add_argument(
        '--profile',
        choices=['minimal', 'standard', 'full', 'gpu-optimized'],
        default='gpu-optimized',
        help='Model download profile (default: gpu-optimized for RTX 4090)'
    )
    parser.add_argument(
        '--include-llm',
        action='store_true',
        help='Download large language model (Phi-2 or Mistral-7B)'
    )
    parser.add_argument(
        '--skip-verify',
        action='store_true',
        help='Skip dependency verification'
    )
    parser.add_argument(
        '--list-models',
        action='store_true',
        help='List all available models and exit'
    )

    args = parser.parse_args()

    print_banner()

    # List models and exit if requested
    if args.list_models:
        downloader = ModelDownloader()
        downloader.list_available_huggingface_models()
        return

    # Verify installation
    if not args.skip_verify:
        if not verify_installation():
            print("\n❌ Please install missing dependencies first:")
            print("   pip install -r requirements.txt")
            sys.exit(1)

    # Check GPU
    has_gpu = check_gpu()

    if not has_gpu and args.profile == 'gpu-optimized':
        print("\n⚠ No GPU detected but 'gpu-optimized' profile selected")
        print("  Consider using 'standard' or 'minimal' profile for CPU")

        response = input("\nContinue anyway? (y/n): ").strip().lower()
        if response != 'y':
            print("Setup cancelled.")
            sys.exit(0)

    # Download models
    try:
        success = download_models(
            profile=args.profile,
            include_llm=args.include_llm
        )

        if success:
            print("\n" + "=" * 70)
            print("✅ Setup Complete!")
            print("=" * 70)
            print("\nYour system is ready for offline operation.")
            print("\nNext steps:")
            print("  1. Start the backend: cd backend && python app.py")
            print("  2. Start the frontend: npm run dev")
            print("  3. Open http://localhost:5173 in your browser")
            print("\n" + "=" * 70)
        else:
            print("\n" + "=" * 70)
            print("⚠ Setup completed with some warnings")
            print("=" * 70)
            print("\nSome models may not have downloaded successfully.")
            print("The application will fall back to available models.")
            print("\n" + "=" * 70)

    except KeyboardInterrupt:
        print("\n\n⚠ Setup interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Setup failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
