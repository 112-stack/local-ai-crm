# Setup Commands - RTX 4090 Offline Models

## 🚀 Complete Setup Commands

Copy and paste these commands in order:

### Step 1: Install PyTorch with CUDA 12.1 (for RTX 4090)

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

**Direct Download URLs (if pip fails):**
- PyTorch wheel: https://download.pytorch.org/whl/cu121/torch-2.2.0%2Bcu121-cp311-cp311-linux_x86_64.whl
- Torchvision: https://download.pytorch.org/whl/cu121/torchvision-0.17.0%2Bcu121-cp311-cp311-linux_x86_64.whl

### Step 2: Install All Dependencies

```bash
cd /home/user/claude/backend
pip install -r requirements.txt
```

### Step 3: Download AI Models (GPU-Optimized Profile)

```bash
cd /home/user/claude/backend
python setup_offline.py --profile gpu-optimized
```

**Alternative: Download models individually**

```bash
# Core business models
python -m services.model_downloader download-hf sentiment
python -m services.model_downloader download-hf financial-sentiment
python -m services.model_downloader download-hf financial-phrase
python -m services.model_downloader download-hf emotion
python -m services.model_downloader download-hf ner

# Sentence transformers
python -m services.model_downloader download-hf sentence-transformer

# Zero-shot classification
python -m services.model_downloader download-hf zero-shot
python -m services.model_downloader download-hf zero-shot-deberta

# Advanced models
python -m services.model_downloader download-hf deberta-large

# Optional: Large language model
python -m services.model_downloader download-hf llm-7b
```

### Step 4: Start Backend Server

```bash
cd /home/user/claude/backend
python app.py
```

Or use the startup script:

```bash
cd /home/user/claude/backend
./start_backend.sh
```

### Step 5: Start Frontend (in new terminal)

```bash
cd /home/user/claude
npm install  # First time only
npm run dev
```

---

## 📥 Direct Model Download URLs

All models are from HuggingFace. You can download them manually if needed:

### Essential Models (~3GB total)

1. **Sentiment Analysis** (~250MB)
   - URL: https://huggingface.co/distilbert-base-uncased-finetuned-sst-2-english
   - Download: `git lfs clone https://huggingface.co/distilbert-base-uncased-finetuned-sst-2-english`

2. **Financial Sentiment (FinBERT)** (~440MB)
   - URL: https://huggingface.co/ProsusAI/finbert
   - Download: `git lfs clone https://huggingface.co/ProsusAI/finbert`

3. **Financial Phrase Tone** (~440MB)
   - URL: https://huggingface.co/yiyanghkust/finbert-tone
   - Download: `git lfs clone https://huggingface.co/yiyanghkust/finbert-tone`

4. **Sentence Transformer** (~420MB)
   - URL: https://huggingface.co/sentence-transformers/all-mpnet-base-v2
   - Download: `git lfs clone https://huggingface.co/sentence-transformers/all-mpnet-base-v2`

### Recommended Models (~8GB total)

5. **Emotion Detection** (~310MB)
   - URL: https://huggingface.co/j-hartmann/emotion-english-distilroberta-base
   - Download: `git lfs clone https://huggingface.co/j-hartmann/emotion-english-distilroberta-base`

6. **Named Entity Recognition** (~420MB)
   - URL: https://huggingface.co/dslim/bert-base-NER
   - Download: `git lfs clone https://huggingface.co/dslim/bert-base-NER`

7. **Zero-Shot Classification** (~1.6GB)
   - URL: https://huggingface.co/facebook/bart-large-mnli
   - Download: `git lfs clone https://huggingface.co/facebook/bart-large-mnli`

### Advanced Models (~12GB total)

8. **DeBERTa Zero-Shot** (~1.5GB)
   - URL: https://huggingface.co/MoritzLaurer/DeBERTa-v3-large-mnli-fever-anli-ling-wanli
   - Download: `git lfs clone https://huggingface.co/MoritzLaurer/DeBERTa-v3-large-mnli-fever-anli-ling-wanli`

9. **DeBERTa Large** (~1.5GB)
   - URL: https://huggingface.co/microsoft/deberta-v3-large
   - Download: `git lfs clone https://huggingface.co/microsoft/deberta-v3-large`

### Optional: Large Language Models

10. **Phi-2 (Microsoft)** (~5.5GB)
    - URL: https://huggingface.co/microsoft/phi-2
    - Download: `git lfs clone https://huggingface.co/microsoft/phi-2`

11. **Mistral-7B-Instruct** (~14GB)
    - URL: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
    - Download: `git lfs clone https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2`

---

## 🔍 Verify Installation

### Check PyTorch and CUDA

```bash
python -c "import torch; print(f'PyTorch: {torch.__version__}'); print(f'CUDA Available: {torch.cuda.is_available()}'); print(f'CUDA Version: {torch.version.cuda}'); print(f'GPU: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else \"N/A\"}')"
```

Expected output:
```
PyTorch: 2.2.0+cu121
CUDA Available: True
CUDA Version: 12.1
GPU: NVIDIA GeForce RTX 4090
```

### Check Installed Models

```bash
cd /home/user/claude/backend
python -m services.model_downloader list
```

### Test Model Loading

```bash
cd /home/user/claude/backend
python -c "from services.enhanced_predictor import EnhancedPredictorService; from services.config_manager import ConfigManager; predictor = EnhancedPredictorService(ConfigManager()); print('✓ Enhanced predictor loaded successfully')"
```

---

## 📦 Installation Profile Sizes

| Profile | Total Size | Models Included |
|---------|-----------|-----------------|
| **minimal** | ~2GB | sentiment, financial-sentiment, sentence-transformer-mini |
| **standard** | ~8GB | + emotion, ner, financial-phrase, zero-shot |
| **full** | ~15GB | + roberta-large, qa, esg-analysis |
| **gpu-optimized** | ~12GB | + zero-shot-deberta, deberta-large, llm-7b |

---

## 🎯 Recommended for RTX 4090

```bash
# Install PyTorch with CUDA
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# Install dependencies
cd /home/user/claude/backend
pip install -r requirements.txt

# Download GPU-optimized models (~12GB)
python setup_offline.py --profile gpu-optimized

# Optional: Add large language model (+5.5GB)
python setup_offline.py --profile gpu-optimized --include-llm

# Start backend
python app.py
```

---

## 🔧 Alternative: Offline Installation

If you don't have internet on the target machine:

1. **On a machine with internet:**
   ```bash
   # Download models
   python setup_offline.py --profile gpu-optimized

   # Models are saved to: backend/models/transformers_cache/
   # Copy this entire folder to the offline machine
   ```

2. **On the offline machine:**
   ```bash
   # Copy models to: /home/user/claude/backend/models/transformers_cache/
   # Install PyTorch and dependencies from wheels
   # Start backend
   python app.py
   ```

---

## 📊 Bandwidth Requirements

- **Minimal Profile**: ~2GB download
- **Standard Profile**: ~8GB download
- **Full Profile**: ~15GB download
- **GPU-Optimized**: ~12GB download
- **GPU-Optimized + LLM**: ~26GB download

**First-time setup**: 30-60 minutes depending on internet speed
**Subsequent runs**: 2-5 seconds (models are cached)

---

## 🚀 Quick Start (Copy-Paste)

```bash
# Install PyTorch with CUDA
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# Install dependencies
cd /home/user/claude/backend && pip install -r requirements.txt

# Download models
python setup_offline.py --profile gpu-optimized

# Start backend
python app.py &

# Start frontend (in new terminal)
cd /home/user/claude && npm install && npm run dev
```

Then open: http://localhost:5173

---

## 💡 Pro Tips

1. **Download during off-hours**: Models are large (2-26GB)
2. **Use git lfs**: For manual downloads, install git-lfs first
3. **Monitor GPU**: Use `nvidia-smi` to check VRAM usage
4. **Cache location**: Models cached in `backend/models/transformers_cache/`
5. **Offline mode**: After setup, works 100% offline

---

## 🆘 Support

If downloads fail:
1. Check internet connection
2. Check disk space (need 30-50GB free)
3. Try manual download URLs above
4. Use smaller profile: `--profile minimal`

For GPU issues:
1. Update NVIDIA drivers: https://www.nvidia.com/Download/index.aspx
2. Install CUDA Toolkit: https://developer.nvidia.com/cuda-downloads
3. Verify with: `nvidia-smi`

---

**All set!** Your RTX 4090 is ready for offline AI-powered business predictions! 🎉
