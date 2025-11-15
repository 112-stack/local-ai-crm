"""
Model Downloader Service
Automatically downloads and caches AI models for offline use
"""

import os
import torch
import torch.nn as nn
from pathlib import Path
import json
from datetime import datetime


class ModelDownloader:
    """Handles downloading and caching of AI models for local use"""

    def __init__(self, models_dir='models'):
        self.models_dir = Path(models_dir)
        self.models_dir.mkdir(exist_ok=True)
        self.manifest_file = self.models_dir / 'manifest.json'
        self.manifest = self._load_manifest()

    def _load_manifest(self):
        """Load the models manifest file"""
        if self.manifest_file.exists():
            with open(self.manifest_file, 'r') as f:
                return json.load(f)
        return {}

    def _save_manifest(self):
        """Save the models manifest file"""
        with open(self.manifest_file, 'w') as f:
            json.dump(self.manifest, f, indent=2)

    def create_default_model(self, model_name='business_predictor.pth', input_size=10, hidden_size=64):
        """
        Create a default model with random weights
        This will be used until the model is trained with real data
        """
        model_path = self.models_dir / model_name

        if model_path.exists():
            print(f"✓ Model already exists: {model_path}")
            return str(model_path)

        print(f"Creating default model: {model_name}")

        # Define a simple neural network
        class SimplePredictor(nn.Module):
            def __init__(self, input_size, hidden_size):
                super(SimplePredictor, self).__init__()
                self.fc1 = nn.Linear(input_size, hidden_size)
                self.fc2 = nn.Linear(hidden_size, hidden_size // 2)
                self.fc3 = nn.Linear(hidden_size // 2, 3)
                self.relu = nn.ReLU()
                self.dropout = nn.Dropout(0.3)

            def forward(self, x):
                x = self.relu(self.fc1(x))
                x = self.dropout(x)
                x = self.relu(self.fc2(x))
                x = self.dropout(x)
                x = self.fc3(x)
                return x

        # Create and initialize the model
        model = SimplePredictor(input_size, hidden_size)

        # Initialize with Xavier uniform (better than random)
        for m in model.modules():
            if isinstance(m, nn.Linear):
                nn.init.xavier_uniform_(m.weight)
                nn.init.zeros_(m.bias)

        # Save the model
        torch.save(model.state_dict(), model_path)

        # Update manifest
        self.manifest[model_name] = {
            'created_at': datetime.now().isoformat(),
            'type': 'pytorch',
            'architecture': 'SimplePredictor',
            'input_size': input_size,
            'hidden_size': hidden_size,
            'status': 'initialized'
        }
        self._save_manifest()

        print(f"✓ Model created: {model_path}")
        return str(model_path)

    def download_transformers_model(self, model_name='distilbert-base-uncased'):
        """
        Download a Hugging Face transformers model for offline use
        This will cache the model locally so it doesn't need internet later
        """
        try:
            from transformers import AutoModel, AutoTokenizer

            cache_dir = self.models_dir / 'transformers_cache'
            cache_dir.mkdir(exist_ok=True)

            print(f"Downloading transformers model: {model_name}")
            print("This may take a few minutes on first run...")

            # Download model and tokenizer (will be cached)
            model = AutoModel.from_pretrained(
                model_name,
                cache_dir=str(cache_dir)
            )
            tokenizer = AutoTokenizer.from_pretrained(
                model_name,
                cache_dir=str(cache_dir)
            )

            # Update manifest
            self.manifest[f'transformers_{model_name}'] = {
                'created_at': datetime.now().isoformat(),
                'type': 'transformers',
                'model_name': model_name,
                'cache_dir': str(cache_dir),
                'status': 'downloaded'
            }
            self._save_manifest()

            print(f"✓ Model downloaded and cached: {model_name}")
            return True

        except ImportError:
            print("⚠ transformers library not installed")
            print("  Install with: pip install transformers")
            return False
        except Exception as e:
            print(f"✗ Failed to download model: {e}")
            return False

    def check_model_availability(self, model_name):
        """Check if a model is available locally"""
        model_path = self.models_dir / model_name
        return model_path.exists()

    def list_available_models(self):
        """List all available models"""
        print("\n" + "=" * 60)
        print("Available Models:")
        print("=" * 60)

        if not self.manifest:
            print("No models found. Run setup to create default models.")
        else:
            for name, info in self.manifest.items():
                status = info.get('status', 'unknown')
                model_type = info.get('type', 'unknown')
                created = info.get('created_at', 'unknown')
                print(f"\n  {name}")
                print(f"    Type: {model_type}")
                print(f"    Status: {status}")
                print(f"    Created: {created[:10]}")

        print("\n" + "=" * 60)

    def setup_all_models(self):
        """Setup all required models for offline operation"""
        print("\n🤖 Setting up AI models for offline use...")
        print("=" * 60)

        # Create default PyTorch model
        self.create_default_model('business_predictor.pth')

        # Optional: Download small transformers model for text processing
        # Uncomment if you want to use transformers
        # self.download_transformers_model('distilbert-base-uncased')

        print("\n✓ Model setup complete!")
        print("=" * 60)
        self.list_available_models()

    def cleanup_old_models(self, keep_latest=3):
        """Remove old model versions to save space"""
        # Get all .pth files
        model_files = list(self.models_dir.glob('*.pth'))

        if len(model_files) <= keep_latest:
            return

        # Sort by modification time
        model_files.sort(key=lambda x: x.stat().st_mtime, reverse=True)

        # Remove old models
        for old_model in model_files[keep_latest:]:
            print(f"Removing old model: {old_model.name}")
            old_model.unlink()

            # Update manifest
            if old_model.name in self.manifest:
                del self.manifest[old_model.name]

        self._save_manifest()


def main():
    """CLI interface for model management"""
    import sys

    downloader = ModelDownloader()

    if len(sys.argv) > 1:
        command = sys.argv[1]

        if command == 'setup':
            downloader.setup_all_models()
        elif command == 'list':
            downloader.list_available_models()
        elif command == 'cleanup':
            downloader.cleanup_old_models()
        elif command == 'create':
            downloader.create_default_model()
        else:
            print(f"Unknown command: {command}")
            print("\nAvailable commands:")
            print("  setup   - Setup all models")
            print("  list    - List available models")
            print("  create  - Create default model")
            print("  cleanup - Remove old models")
    else:
        print("Model Downloader")
        print("\nUsage: python model_downloader.py <command>")
        print("\nCommands:")
        print("  setup   - Setup all models")
        print("  list    - List available models")
        print("  create  - Create default model")
        print("  cleanup - Remove old models")


if __name__ == '__main__':
    main()
