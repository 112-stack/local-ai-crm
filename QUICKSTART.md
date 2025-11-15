# CRM Business Predictor - Quick Start

## 🚀 Fast Setup for RTX 4090

### 1. Install PyTorch with CUDA (One-time)

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

### 2. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3. Download AI Models (One-time, ~10-12GB)

```bash
cd backend

# Recommended for RTX 4090 (best performance)
python setup_offline.py --profile gpu-optimized

# Or use minimal profile if limited on storage (~2GB)
python setup_offline.py --profile minimal
```

### 4. Start Backend

```bash
cd backend
python app.py

# Or use the startup script
./start_backend.sh
```

### 5. Start Frontend (New Terminal)

```bash
npm install  # First time only
npm run dev
```

### 6. Open Application

http://localhost:5173

---

## 📋 Model Profiles

| Profile | Size | Models | Use Case |
|---------|------|--------|----------|
| **minimal** | ~2GB | 3 models | Testing, limited storage |
| **standard** | ~8GB | 7 models | Balanced setup |
| **full** | ~15GB | 10 models | Maximum accuracy |
| **gpu-optimized** | ~12GB | 10 models | **RTX 4090 (RECOMMENDED)** |

---

## ✅ Verify Setup

### Check GPU

```bash
python -c "import torch; print(f'CUDA: {torch.cuda.is_available()}'); print(f'GPU: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else None}')"
```

Expected output:
```
CUDA: True
GPU: NVIDIA GeForce RTX 4090
```

### Check Models

```bash
cd backend
python -m services.model_downloader list
```

---

## 🔧 Troubleshooting

### Backend won't start?

1. Check Python version: `python --version` (need 3.9+)
2. Install dependencies: `pip install -r backend/requirements.txt`
3. Check port 8000: `lsof -i :8000` (should be free)

### No GPU detected?

1. Install NVIDIA drivers
2. Install CUDA 12.1+
3. Reinstall PyTorch with CUDA:
   ```bash
   pip install torch --index-url https://download.pytorch.org/whl/cu121
   ```

### Models not downloading?

1. Check internet connection
2. Try again: `python setup_offline.py --profile gpu-optimized`
3. Manual download: `python -m services.model_downloader download-hf sentiment`

---

## 📊 What You Get

### Offline AI Capabilities

- **Sentiment Analysis**: Detect positive/negative sentiment
- **Emotion Detection**: Identify joy, sadness, anger, fear, etc.
- **Financial Analysis**: FinBERT for financial sentiment
- **Risk Assessment**: Zero-shot classification
- **Entity Extraction**: Find companies, people, locations
- **Business Scoring**: Comprehensive risk evaluation

### Performance (RTX 4090)

- **Prediction Speed**: 200-500ms per analysis
- **Batch Processing**: 100+ predictions/minute
- **GPU Utilization**: ~4-8GB VRAM typical
- **Accuracy**: Professional-grade AI models

---

For detailed information, see [OFFLINE_SETUP.md](OFFLINE_SETUP.md)
