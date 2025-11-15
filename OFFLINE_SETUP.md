# CRM Business Predictor - Offline Setup Guide

## RTX 4090 Optimized Configuration

This guide will help you set up the CRM Business Predictor to run completely offline using pre-trained AI models optimized for the NVIDIA RTX 4090 GPU.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Model Profiles](#model-profiles)
4. [Available Models](#available-models)
5. [Manual Installation](#manual-installation)
6. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

### Hardware Requirements

- **GPU**: NVIDIA RTX 4090 (24GB VRAM) - recommended
- **RAM**: 32GB+ recommended for large models
- **Storage**: 30-50GB free space for all models
- **CPU**: Modern multi-core processor

### Software Requirements

- **Python**: 3.9 or higher
- **CUDA**: 12.1 or higher
- **CUDA Drivers**: Latest NVIDIA drivers

---

## 🚀 Quick Start

### 1. Install PyTorch with CUDA Support

```bash
# For CUDA 12.1 (RTX 4090)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

### 2. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3. Run Automated Setup

```bash
cd backend

# GPU-Optimized Profile (Recommended for RTX 4090)
python setup_offline.py --profile gpu-optimized

# With Large Language Model (adds 14GB download)
python setup_offline.py --profile gpu-optimized --include-llm

# Other profiles
python setup_offline.py --profile minimal      # ~2GB - Essential models only
python setup_offline.py --profile standard     # ~8GB - Balanced selection
python setup_offline.py --profile full         # ~15GB - All models except LLM
```

### 4. Start the Backend

```bash
cd backend
python app.py
```

### 5. Start the Frontend

```bash
# In a new terminal
npm run dev
```

### 6. Access the Application

Open http://localhost:5173 in your browser.

---

## 📦 Model Profiles

### Minimal Profile (~2GB)
**Use case**: Limited storage, CPU-only, or quick testing

- Sentiment analysis
- Financial sentiment
- Fast sentence embeddings

### Standard Profile (~8GB)
**Use case**: Balanced performance and storage

- All minimal models
- Emotion detection
- Named Entity Recognition (NER)
- Financial phrase analysis
- Sentence transformers
- Zero-shot classification

### Full Profile (~15GB)
**Use case**: Maximum accuracy without LLM

- All standard models
- RoBERTa Large
- Question Answering
- ESG Analysis

### GPU-Optimized Profile (~12GB) - **RECOMMENDED FOR RTX 4090**
**Use case**: Best performance on high-end GPUs

- Core business models (sentiment, emotion, NER)
- Advanced financial models (FinBERT, FinBERT-tone)
- Best sentence transformers
- Advanced zero-shot (DeBERTa)
- DeBERTa Large
- Phi-2 LLM (2.7B parameters)

### GPU-Optimized + LLM (~26GB)
**Use case**: Maximum capability on RTX 4090

- All GPU-optimized models
- Mistral-7B-Instruct (7B parameters) - Full conversational AI

---

## 🤖 Available Models

### Core Business Models (Priority: HIGH)

#### 1. Sentiment Analysis
- **Model**: `distilbert-base-uncased-finetuned-sst-2-english`
- **Size**: ~250MB
- **Task**: Text classification (positive/negative)
- **URL**: https://huggingface.co/distilbert-base-uncased-finetuned-sst-2-english
- **Use**: General sentiment analysis of business communications

#### 2. Emotion Detection
- **Model**: `j-hartmann/emotion-english-distilroberta-base`
- **Size**: ~310MB
- **Task**: Multi-class emotion classification
- **URL**: https://huggingface.co/j-hartmann/emotion-english-distilroberta-base
- **Use**: Detect emotions (joy, sadness, anger, fear, surprise, disgust, neutral)

#### 3. Named Entity Recognition
- **Model**: `dslim/bert-base-NER`
- **Size**: ~420MB
- **Task**: Token classification
- **URL**: https://huggingface.co/dslim/bert-base-NER
- **Use**: Extract person, organization, location names

#### 4. Financial Sentiment (FinBERT)
- **Model**: `ProsusAI/finbert`
- **Size**: ~440MB
- **Task**: Financial text classification
- **URL**: https://huggingface.co/ProsusAI/finbert
- **Use**: Analyze financial sentiment (positive/negative/neutral)

### Advanced Financial Models (Priority: HIGH)

#### 5. Financial Phrase Tone
- **Model**: `yiyanghkust/finbert-tone`
- **Size**: ~440MB
- **Task**: Financial sentiment analysis
- **URL**: https://huggingface.co/yiyanghkust/finbert-tone
- **Use**: Detailed financial phrase analysis

#### 6. ESG Analysis
- **Model**: `ESGBERT/EnvironmentalBERT-environmental`
- **Size**: ~440MB
- **Task**: ESG classification
- **URL**: https://huggingface.co/ESGBERT/EnvironmentalBERT-environmental
- **Use**: Environmental, Social, Governance analysis

### Sentence Embeddings (Priority: HIGH)

#### 7. Sentence Transformer (Best Quality)
- **Model**: `sentence-transformers/all-mpnet-base-v2`
- **Size**: ~420MB
- **Task**: Feature extraction
- **URL**: https://huggingface.co/sentence-transformers/all-mpnet-base-v2
- **Use**: Best quality sentence embeddings for semantic similarity

#### 8. Sentence Transformer (Fast)
- **Model**: `sentence-transformers/all-MiniLM-L6-v2`
- **Size**: ~80MB
- **Task**: Feature extraction
- **URL**: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- **Use**: 5x faster embeddings with good quality

### Advanced Classification (Priority: MEDIUM)

#### 9. RoBERTa Large
- **Model**: `roberta-large`
- **Size**: ~1.4GB
- **Task**: Masked language modeling
- **URL**: https://huggingface.co/roberta-large
- **Use**: High-accuracy classification tasks

#### 10. DeBERTa v3 Large
- **Model**: `microsoft/deberta-v3-large`
- **Size**: ~1.5GB
- **Task**: Masked language modeling
- **URL**: https://huggingface.co/microsoft/deberta-v3-large
- **Use**: State-of-the-art classification

### Zero-Shot Classification (Priority: HIGH)

#### 11. BART Large MNLI
- **Model**: `facebook/bart-large-mnli`
- **Size**: ~1.6GB
- **Task**: Zero-shot classification
- **URL**: https://huggingface.co/facebook/bart-large-mnli
- **Use**: Classify text without training

#### 12. DeBERTa Zero-Shot
- **Model**: `MoritzLaurer/DeBERTa-v3-large-mnli-fever-anli-ling-wanli`
- **Size**: ~1.5GB
- **Task**: Advanced zero-shot classification
- **URL**: https://huggingface.co/MoritzLaurer/DeBERTa-v3-large-mnli-fever-anli-ling-wanli
- **Use**: More accurate zero-shot classification

### Text Generation & QA (Priority: MEDIUM)

#### 13. Question Answering
- **Model**: `distilbert-base-cased-distilled-squad`
- **Size**: ~260MB
- **Task**: Extractive QA
- **URL**: https://huggingface.co/distilbert-base-cased-distilled-squad
- **Use**: Answer questions from context

#### 14. Summarization
- **Model**: `facebook/bart-large-cnn`
- **Size**: ~1.6GB
- **Task**: Text summarization
- **URL**: https://huggingface.co/facebook/bart-large-cnn
- **Use**: Summarize long documents

#### 15. Text Generation (Small)
- **Model**: `distilgpt2`
- **Size**: ~350MB
- **Task**: Text generation
- **URL**: https://huggingface.co/distilgpt2
- **Use**: Basic text generation

### Large Language Models (Priority: MEDIUM/LOW)

#### 16. Phi-2 (Microsoft)
- **Model**: `microsoft/phi-2`
- **Size**: ~5.5GB
- **Task**: Text generation
- **URL**: https://huggingface.co/microsoft/phi-2
- **Use**: 2.7B parameter LLM, fits easily on RTX 4090
- **VRAM**: ~6-8GB

#### 17. Mistral-7B-Instruct
- **Model**: `mistralai/Mistral-7B-Instruct-v0.2`
- **Size**: ~14GB
- **Task**: Text generation
- **URL**: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- **Use**: 7B parameter instruction-tuned LLM
- **VRAM**: ~16GB (fits on RTX 4090)

---

## 🔨 Manual Installation

If you prefer to download models individually:

```bash
cd backend

# List all available models
python -m services.model_downloader list-hf

# Download specific model
python -m services.model_downloader download-hf sentiment
python -m services.model_downloader download-hf financial-sentiment
python -m services.model_downloader download-hf zero-shot

# Download all recommended models
python -m services.model_downloader download-recommended

# List downloaded models
python -m services.model_downloader list
```

### Using Python API

```python
from services.model_downloader import ModelDownloader

downloader = ModelDownloader()

# Download specific model
downloader.download_huggingface_model(model_key='sentiment')

# Download by direct name
downloader.download_huggingface_model(model_name='ProsusAI/finbert')

# Download all
downloader.download_recommended_models(profile='gpu-optimized')

# List available
downloader.list_available_models()
```

---

## 🔍 Verifying Installation

### Check GPU

```python
import torch

print(f"CUDA Available: {torch.cuda.is_available()}")
print(f"CUDA Version: {torch.version.cuda}")
print(f"GPU Name: {torch.cuda.get_device_name(0)}")
print(f"GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB")
```

### Test Model Loading

```python
from transformers import pipeline

# Test sentiment model
sentiment = pipeline(
    "text-classification",
    model="distilbert-base-uncased-finetuned-sst-2-english",
    device=0  # Use GPU
)

result = sentiment("This is a great opportunity!")
print(result)
```

### Check Downloaded Models

```bash
cd backend
python -m services.model_downloader list
```

---

## 🐛 Troubleshooting

### Issue: CUDA Out of Memory

**Solution**: Use a lighter model profile or enable memory optimization

```python
# In enhanced_predictor.py, models are loaded lazily
# Only loaded models use VRAM
# Close unused models to free memory
```

### Issue: Models Download Slowly

**Solution**: Models are cached after first download

```bash
# Models are stored in backend/models/transformers_cache
# Once downloaded, they work offline
```

### Issue: Backend Won't Start

**Check**:
1. Python version: `python --version` (should be 3.9+)
2. Dependencies: `pip install -r requirements.txt`
3. Port 8000 available: `lsof -i :8000`

### Issue: Models Not Found

**Solution**: Run setup again

```bash
cd backend
python setup_offline.py --profile gpu-optimized
```

### Issue: Slow CPU Performance

**Solution**: Ensure GPU is being used

```python
# Check in backend logs
# Should see: "Enhanced Predictor initialized on cuda"
# If it says "cpu", check CUDA installation
```

---

## 📊 Performance Expectations (RTX 4090)

| Task | Model | Speed | Quality |
|------|-------|-------|---------|
| Sentiment | DistilBERT | ~200ms | Good |
| Financial Sentiment | FinBERT | ~250ms | Excellent |
| Zero-shot | BART/DeBERTa | ~500ms | Excellent |
| NER | BERT-NER | ~300ms | Good |
| Embeddings | MPNet | ~100ms | Excellent |
| LLM (Phi-2) | Phi-2 | ~2-5s | Good |
| LLM (Mistral-7B) | Mistral | ~3-8s | Excellent |

---

## 📝 Model Sources

All models are from Hugging Face:
- **Hugging Face Hub**: https://huggingface.co/models
- **License**: Most models use Apache 2.0 or MIT licenses
- **Usage**: Free for commercial use (check individual model licenses)

---

## 🔄 Updating Models

```bash
cd backend

# Remove old models
python -m services.model_downloader cleanup

# Re-download latest versions
python setup_offline.py --profile gpu-optimized
```

---

## 💾 Storage Requirements

| Profile | Download Size | Disk Space |
|---------|---------------|------------|
| Minimal | ~1.5GB | ~2GB |
| Standard | ~6GB | ~8GB |
| Full | ~12GB | ~15GB |
| GPU-Optimized | ~10GB | ~12GB |
| GPU-Optimized + LLM | ~24GB | ~26GB |

---

## ⚡ Tips for RTX 4090

1. **Use GPU-Optimized Profile**: Best performance-to-size ratio
2. **Enable Mixed Precision**: Automatically enabled for supported models
3. **Batch Processing**: Process multiple predictions together
4. **Model Caching**: Models are loaded once and kept in memory
5. **VRAM Monitoring**: Use `nvidia-smi` to monitor usage

```bash
# Monitor GPU usage
watch -n 1 nvidia-smi
```

---

## 🎯 Recommended Setup for Production

```bash
# 1. Install PyTorch with CUDA
pip install torch --index-url https://download.pytorch.org/whl/cu121

# 2. Install dependencies
pip install -r backend/requirements.txt

# 3. Download models (GPU-optimized for RTX 4090)
cd backend
python setup_offline.py --profile gpu-optimized

# 4. Start backend
python app.py

# 5. Start frontend (new terminal)
npm run dev
```

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review backend logs: `backend/logs/`
3. Check model manifest: `backend/models/manifest.json`

---

## 📄 License

This application uses various open-source models:
- Most HuggingFace models: Apache 2.0
- Some models: MIT or other permissive licenses
- Check individual model pages for specific licenses

---

**Last Updated**: 2025-11-15
**Optimized for**: NVIDIA RTX 4090 (24GB VRAM)
