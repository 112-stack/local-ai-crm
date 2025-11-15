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

    # Curated list of pre-trained Hugging Face models optimized for RTX 4090
    HUGGINGFACE_MODELS = {
        # === CORE BUSINESS MODELS (Recommended for offline use) ===
        'sentiment': {
            'name': 'distilbert-base-uncased-finetuned-sst-2-english',
            'description': 'Sentiment analysis (positive/negative)',
            'task': 'text-classification',
            'size': '~250MB',
            'url': 'https://huggingface.co/distilbert-base-uncased-finetuned-sst-2-english',
            'priority': 'high'
        },
        'emotion': {
            'name': 'j-hartmann/emotion-english-distilroberta-base',
            'description': 'Emotion detection (joy, sadness, anger, fear, etc.)',
            'task': 'text-classification',
            'size': '~310MB',
            'url': 'https://huggingface.co/j-hartmann/emotion-english-distilroberta-base',
            'priority': 'high'
        },
        'ner': {
            'name': 'dslim/bert-base-NER',
            'description': 'Named Entity Recognition (person, organization, location)',
            'task': 'token-classification',
            'size': '~420MB',
            'url': 'https://huggingface.co/dslim/bert-base-NER',
            'priority': 'high'
        },
        'financial-sentiment': {
            'name': 'ProsusAI/finbert',
            'description': 'Financial sentiment analysis (bullish/bearish)',
            'task': 'text-classification',
            'size': '~440MB',
            'url': 'https://huggingface.co/ProsusAI/finbert',
            'priority': 'high'
        },

        # === ADVANCED FINANCIAL & BUSINESS MODELS ===
        'financial-phrase': {
            'name': 'yiyanghkust/finbert-tone',
            'description': 'Financial phrase tone analysis (positive/negative/neutral)',
            'task': 'text-classification',
            'size': '~440MB',
            'url': 'https://huggingface.co/yiyanghkust/finbert-tone',
            'priority': 'high'
        },
        'esg-analysis': {
            'name': 'ESGBERT/EnvironmentalBERT-environmental',
            'description': 'ESG (Environmental, Social, Governance) analysis',
            'task': 'text-classification',
            'size': '~440MB',
            'url': 'https://huggingface.co/ESGBERT/EnvironmentalBERT-environmental',
            'priority': 'medium'
        },

        # === SENTENCE EMBEDDINGS (GPU Optimized) ===
        'sentence-transformer': {
            'name': 'sentence-transformers/all-mpnet-base-v2',
            'description': 'Best sentence embeddings for semantic similarity',
            'task': 'feature-extraction',
            'size': '~420MB',
            'url': 'https://huggingface.co/sentence-transformers/all-mpnet-base-v2',
            'priority': 'high'
        },
        'sentence-transformer-mini': {
            'name': 'sentence-transformers/all-MiniLM-L6-v2',
            'description': 'Fast sentence embeddings (5x faster)',
            'task': 'feature-extraction',
            'size': '~80MB',
            'url': 'https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2',
            'priority': 'high'
        },

        # === POWERFUL CLASSIFICATION MODELS (RTX 4090 Optimized) ===
        'roberta-large': {
            'name': 'roberta-large',
            'description': 'Large RoBERTa for high-accuracy classification',
            'task': 'fill-mask',
            'size': '~1.4GB',
            'url': 'https://huggingface.co/roberta-large',
            'priority': 'medium'
        },
        'deberta-large': {
            'name': 'microsoft/deberta-v3-large',
            'description': 'State-of-the-art DeBERTa for classification',
            'task': 'fill-mask',
            'size': '~1.5GB',
            'url': 'https://huggingface.co/microsoft/deberta-v3-large',
            'priority': 'medium'
        },

        # === ZERO-SHOT & MULTI-PURPOSE ===
        'zero-shot': {
            'name': 'facebook/bart-large-mnli',
            'description': 'Zero-shot classification (no training needed)',
            'task': 'zero-shot-classification',
            'size': '~1.6GB',
            'url': 'https://huggingface.co/facebook/bart-large-mnli',
            'priority': 'high'
        },
        'zero-shot-deberta': {
            'name': 'MoritzLaurer/DeBERTa-v3-large-mnli-fever-anli-ling-wanli',
            'description': 'Advanced zero-shot classification',
            'task': 'zero-shot-classification',
            'size': '~1.5GB',
            'url': 'https://huggingface.co/MoritzLaurer/DeBERTa-v3-large-mnli-fever-anli-ling-wanli',
            'priority': 'medium'
        },

        # === TEXT GENERATION & QA ===
        'qa': {
            'name': 'distilbert-base-cased-distilled-squad',
            'description': 'Question Answering from context',
            'task': 'question-answering',
            'size': '~260MB',
            'url': 'https://huggingface.co/distilbert-base-cased-distilled-squad',
            'priority': 'medium'
        },
        'summarization': {
            'name': 'facebook/bart-large-cnn',
            'description': 'Text summarization',
            'task': 'summarization',
            'size': '~1.6GB',
            'url': 'https://huggingface.co/facebook/bart-large-cnn',
            'priority': 'low'
        },
        'text-generation': {
            'name': 'distilgpt2',
            'description': 'Text generation (GPT-2 small)',
            'task': 'text-generation',
            'size': '~350MB',
            'url': 'https://huggingface.co/distilgpt2',
            'priority': 'low'
        },

        # === LIGHTWEIGHT LLM (fits in 4090) ===
        'llm-7b': {
            'name': 'microsoft/phi-2',
            'description': 'Phi-2 2.7B parameter LLM (fits in 24GB GPU)',
            'task': 'text-generation',
            'size': '~5.5GB',
            'url': 'https://huggingface.co/microsoft/phi-2',
            'priority': 'medium'
        },
        'mistral-7b-instruct': {
            'name': 'mistralai/Mistral-7B-Instruct-v0.2',
            'description': 'Mistral 7B Instruct (requires 16GB+ VRAM)',
            'task': 'text-generation',
            'size': '~14GB',
            'url': 'https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2',
            'priority': 'low'
        }
    }

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

    def list_available_huggingface_models(self):
        """List all available Hugging Face models"""
        print("\n" + "=" * 70)
        print("Available Hugging Face Models:")
        print("=" * 70)

        for key, info in self.HUGGINGFACE_MODELS.items():
            print(f"\n  [{key}]")
            print(f"    Model: {info['name']}")
            print(f"    Description: {info['description']}")
            print(f"    Task: {info['task']}")
            print(f"    Size: {info['size']}")

        print("\n" + "=" * 70)

    def download_huggingface_model(self, model_key=None, model_name=None):
        """
        Download a Hugging Face transformers model for offline use

        Args:
            model_key: Key from HUGGINGFACE_MODELS dict (e.g., 'sentiment', 'ner')
            model_name: Direct model name from Hugging Face (e.g., 'bert-base-uncased')
        """
        try:
            from transformers import (
                AutoModel,
                AutoTokenizer,
                AutoModelForSequenceClassification,
                AutoModelForTokenClassification,
                AutoModelForQuestionAnswering,
                AutoModelForSeq2SeqLM,
                pipeline
            )

            cache_dir = self.models_dir / 'transformers_cache'
            cache_dir.mkdir(exist_ok=True)

            # Determine model name and info
            if model_key and model_key in self.HUGGINGFACE_MODELS:
                model_info = self.HUGGINGFACE_MODELS[model_key]
                model_name = model_info['name']
                task = model_info['task']
                description = model_info['description']
            elif model_name:
                task = 'auto'
                description = 'Custom model'
                model_key = model_name
            else:
                print("✗ Please provide either model_key or model_name")
                return False

            print(f"\n📥 Downloading: {model_name}")
            print(f"   Task: {task}")
            print(f"   Description: {description}")
            print("   This may take a few minutes on first run...")

            # Download using pipeline (automatically downloads model + tokenizer)
            # This ensures compatibility and proper model loading
            if task != 'auto':
                pipe = pipeline(task, model=model_name, cache_dir=str(cache_dir))
                print(f"✓ Pipeline created successfully")
            else:
                # For custom models, download model and tokenizer separately
                model = AutoModel.from_pretrained(
                    model_name,
                    cache_dir=str(cache_dir)
                )
                tokenizer = AutoTokenizer.from_pretrained(
                    model_name,
                    cache_dir=str(cache_dir)
                )

            # Update manifest
            manifest_key = f'hf_{model_key}'
            self.manifest[manifest_key] = {
                'created_at': datetime.now().isoformat(),
                'type': 'huggingface',
                'model_name': model_name,
                'model_key': model_key,
                'task': task,
                'description': description,
                'cache_dir': str(cache_dir),
                'status': 'downloaded'
            }
            self._save_manifest()

            print(f"✓ Model downloaded and cached: {model_name}\n")
            return True

        except ImportError:
            print("⚠ transformers library not installed")
            print("  Install with: pip install transformers")
            return False
        except Exception as e:
            print(f"✗ Failed to download model: {e}")
            return False

    def download_all_huggingface_models(self, include_large=False):
        """
        Download all curated Hugging Face models

        Args:
            include_large: If True, downloads large models (>1GB) as well
        """
        print("\n" + "=" * 70)
        print("🤖 Downloading All Hugging Face Models")
        print("=" * 70)

        success_count = 0
        skip_count = 0
        fail_count = 0

        for key, info in self.HUGGINGFACE_MODELS.items():
            # Skip large models if not requested
            if not include_large and 'GB' in info['size']:
                print(f"\n⏭️  Skipping {key} (large model: {info['size']})")
                skip_count += 1
                continue

            # Check if already downloaded
            manifest_key = f'hf_{key}'
            if manifest_key in self.manifest and self.manifest[manifest_key].get('status') == 'downloaded':
                print(f"\n✓ {key} already downloaded")
                success_count += 1
                continue

            # Download
            if self.download_huggingface_model(model_key=key):
                success_count += 1
            else:
                fail_count += 1

        print("\n" + "=" * 70)
        print(f"Download Summary:")
        print(f"  ✓ Success: {success_count}")
        print(f"  ⏭️  Skipped: {skip_count}")
        print(f"  ✗ Failed: {fail_count}")
        print("=" * 70)

        return success_count, skip_count, fail_count

    def download_recommended_models(self, profile='standard'):
        """
        Download a recommended subset of models for business use

        Args:
            profile: 'minimal', 'standard', 'full', or 'gpu-optimized'
        """
        print("\n" + "=" * 70)
        print(f"📦 Downloading Recommended Models - {profile.upper()} Profile")
        print("=" * 70)

        profiles = {
            'minimal': [
                'sentiment', 'financial-sentiment', 'sentence-transformer-mini'
            ],
            'standard': [
                'sentiment', 'emotion', 'ner', 'financial-sentiment',
                'financial-phrase', 'sentence-transformer', 'zero-shot'
            ],
            'full': [
                'sentiment', 'emotion', 'ner', 'financial-sentiment',
                'financial-phrase', 'sentence-transformer', 'zero-shot',
                'roberta-large', 'qa', 'esg-analysis'
            ],
            'gpu-optimized': [
                'sentiment', 'emotion', 'ner', 'financial-sentiment',
                'financial-phrase', 'sentence-transformer', 'zero-shot',
                'zero-shot-deberta', 'deberta-large', 'llm-7b'
            ]
        }

        recommended = profiles.get(profile, profiles['standard'])

        print(f"\n📋 Models to download ({len(recommended)}):")
        total_size = 0
        for key in recommended:
            model_info = self.HUGGINGFACE_MODELS.get(key, {})
            print(f"  • {key}: {model_info.get('description', 'N/A')} ({model_info.get('size', 'Unknown')})")

        print("\n⏳ Starting downloads...")
        success_count = 0
        failed = []

        for key in recommended:
            # Check if already downloaded
            manifest_key = f'hf_{key}'
            if manifest_key in self.manifest and self.manifest[manifest_key].get('status') == 'downloaded':
                print(f"\n✓ {key} - Already downloaded")
                success_count += 1
                continue

            if self.download_huggingface_model(model_key=key):
                success_count += 1
            else:
                failed.append(key)

        print("\n" + "=" * 70)
        print(f"✓ Downloaded {success_count}/{len(recommended)} models")
        if failed:
            print(f"⚠ Failed: {', '.join(failed)}")
        print("=" * 70)

        return success_count == len(recommended)

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

    def setup_all_models(self, include_huggingface=True, include_large=False):
        """
        Setup all required models for offline operation

        Args:
            include_huggingface: If True, downloads recommended Hugging Face models
            include_large: If True, includes large models (>1GB)
        """
        print("\n🤖 Setting up AI models for offline use...")
        print("=" * 70)

        # Create default PyTorch model
        self.create_default_model('business_predictor.pth')

        # Download Hugging Face models
        if include_huggingface:
            print("\n" + "=" * 70)
            print("📦 Downloading Hugging Face Models")
            print("=" * 70)
            self.download_recommended_models()

        print("\n✓ Model setup complete!")
        print("=" * 70)
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
        elif command == 'list-hf':
            downloader.list_available_huggingface_models()
        elif command == 'download-hf':
            if len(sys.argv) > 2:
                model_key = sys.argv[2]
                downloader.download_huggingface_model(model_key=model_key)
            else:
                print("Usage: python model_downloader.py download-hf <model_key>")
                print("\nRun 'python model_downloader.py list-hf' to see available models")
        elif command == 'download-all-hf':
            include_large = '--include-large' in sys.argv
            downloader.download_all_huggingface_models(include_large=include_large)
        elif command == 'download-recommended':
            downloader.download_recommended_models()
        elif command == 'cleanup':
            downloader.cleanup_old_models()
        elif command == 'create':
            downloader.create_default_model()
        else:
            print(f"Unknown command: {command}")
            print("\nAvailable commands:")
            print("  setup                 - Setup all models (PyTorch + recommended HF models)")
            print("  list                  - List downloaded models")
            print("  list-hf               - List available Hugging Face models")
            print("  download-hf <key>     - Download specific Hugging Face model")
            print("  download-all-hf       - Download all Hugging Face models")
            print("  download-recommended  - Download recommended models for business use")
            print("  create                - Create default PyTorch model")
            print("  cleanup               - Remove old models")
    else:
        print("=" * 70)
        print("Model Downloader - AI Model Management Tool")
        print("=" * 70)
        print("\nUsage: python model_downloader.py <command> [options]")
        print("\nCommands:")
        print("  setup                 - Setup all models (PyTorch + recommended HF models)")
        print("  list                  - List downloaded models")
        print("  list-hf               - List available Hugging Face models")
        print("  download-hf <key>     - Download specific Hugging Face model")
        print("  download-all-hf       - Download all Hugging Face models")
        print("                          Use --include-large to download large models")
        print("  download-recommended  - Download recommended models for business use")
        print("  create                - Create default PyTorch model")
        print("  cleanup               - Remove old models")
        print("\nExamples:")
        print("  python model_downloader.py setup")
        print("  python model_downloader.py list-hf")
        print("  python model_downloader.py download-hf sentiment")
        print("  python model_downloader.py download-recommended")
        print("=" * 70)


if __name__ == '__main__':
    main()
