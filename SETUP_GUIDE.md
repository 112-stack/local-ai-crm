# CRM Business Predictor - Complete Setup Guide

This guide will help you set up the CRM Business Predictor application for **offline operation** with AI-powered business forecasting.

## Overview

The application consists of:
- **Frontend**: React-based web interface (runs on http://localhost:5173)
- **Backend**: FastAPI Python server with AI models (runs on http://localhost:8000)
- **AI Models**: HuggingFace transformer models for predictions

## Prerequisites

Before starting, ensure you have:

1. **Python 3.8 or higher**
   - Download from: https://www.python.org/downloads/
   - Verify: `python --version` or `python3 --version`

2. **Node.js 16 or higher**
   - Download from: https://nodejs.org/
   - Verify: `node --version`

3. **NVIDIA GPU (Optional but Recommended)**
   - RTX 4090 or similar for optimal performance
   - CUDA 12.1 drivers installed
   - Without GPU, the application will run on CPU (slower)

4. **Disk Space**: At least 10 GB free space for AI models

5. **Internet Connection**: Required ONLY for initial model download

---

## 🚀 Quick Start (Windows)

### Step 1: Install Dependencies

Open Command Prompt in the project directory and run:

```batch
install-dependencies.bat
```

This will:
- Install all Node.js packages for the frontend
- Create a Python virtual environment
- Install all Python dependencies including PyTorch with CUDA support

**Time required**: 10-20 minutes

### Step 2: Download AI Models (Requires Internet)

This is the **ONLY** step that requires an internet connection:

```batch
setup-offline.bat
```

This will download all required AI models (~3-5 GB). After this step, the application can run completely offline.

**Time required**: 10-30 minutes (depending on internet speed)

### Step 3: Start the Application

```batch
start-app.bat
```

This will:
- Start the backend server on http://localhost:8000
- Start the frontend on http://localhost:5173
- Open two windows (backend and frontend)

**Your application is now running offline!**

---

## 🐧 Quick Start (Linux/Mac)

### Step 1: Install Dependencies

Open Terminal in the project directory and run:

```bash
chmod +x install-dependencies.sh setup-offline.sh start-app.sh
./install-dependencies.sh
```

### Step 2: Download AI Models (Requires Internet)

```bash
./setup-offline.sh
```

### Step 3: Start the Application

```bash
./start-app.sh
```

---

## 📋 Manual Setup (Alternative Method)

If the automated scripts don't work, follow these manual steps:

### 1. Frontend Setup

```bash
npm install
```

### 2. Backend Setup

#### Windows:
```batch
cd backend
python -m venv venv
venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

#### Linux/Mac:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

### 3. Download AI Models

```bash
cd backend
# Activate virtual environment (if not already activated)
# Windows: venv\Scripts\activate
# Linux/Mac: source venv/bin/activate

python setup_offline.py --profile gpu-optimized
```

### 4. Configure Environment

Copy the example environment file:

```bash
cd backend
cp .env.example .env
```

Edit `.env` and ensure these settings:

```ini
OFFLINE_MODE=true
USE_LOCAL_GPU=true
MODEL_TYPE=transformer
HF_DATASETS_OFFLINE=1
TRANSFORMERS_OFFLINE=1
```

### 5. Start the Servers

**Terminal 1 - Backend:**
```bash
cd backend
# Activate virtual environment
python app.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

---

## 🔧 Configuration

### Environment Variables

Edit `backend/.env` to configure:

| Variable | Description | Default |
|----------|-------------|---------|
| `OFFLINE_MODE` | Enable offline operation | `true` |
| `USE_LOCAL_GPU` | Use GPU acceleration | `true` |
| `MODEL_TYPE` | Model type (`transformer` or `basic`) | `transformer` |
| `HF_DATASETS_OFFLINE` | HuggingFace offline mode for datasets | `1` |
| `TRANSFORMERS_OFFLINE` | HuggingFace offline mode for models | `1` |
| `CUDA_VISIBLE_DEVICES` | GPU device ID | `0` |

### Model Profiles

When running `setup_offline.py`, you can choose different profiles:

- **minimal**: Basic models (~500 MB)
- **standard**: Recommended models (~2 GB)
- **full**: All available models (~5 GB)
- **gpu-optimized**: Best models for RTX 4090 (~3-4 GB) - **Recommended**

```bash
python setup_offline.py --profile gpu-optimized
```

---

## 🛠️ Troubleshooting

### Issue: "ModuleNotFoundError: No module named 'fastapi'"

**Solution**: You need to install Python dependencies. Run:
```batch
# Windows
cd backend
venv\Scripts\activate
pip install -r requirements.txt

# Linux/Mac
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

### Issue: "[vite] http proxy error: /api/... ECONNREFUSED"

**Solution**: The backend server is not running. Start it:
```batch
# Windows
cd backend
venv\Scripts\activate
python app.py

# Linux/Mac
cd backend
source venv/bin/activate
python app.py
```

### Issue: "CUDA not available" or GPU not detected

**Possible causes**:
1. NVIDIA drivers not installed
2. PyTorch not installed with CUDA support
3. GPU not compatible

**Solution**:
```bash
# Reinstall PyTorch with CUDA 12.1
pip uninstall torch torchvision torchaudio
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

Verify GPU:
```python
python -c "import torch; print(f'CUDA available: {torch.cuda.is_available()}')"
```

### Issue: "Model not found" or offline mode errors

**Solution**: Download models first:
```batch
# Windows
setup-offline.bat

# Linux/Mac
./setup-offline.sh
```

### Issue: Models download very slowly

**Possible causes**: Slow internet connection

**Solutions**:
1. Use a wired connection instead of WiFi
2. Download during off-peak hours
3. Use the `minimal` profile first:
   ```bash
   python setup_offline.py --profile minimal
   ```

---

## 📊 Verifying Installation

### Check Python Dependencies

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python -c "import fastapi, torch, transformers; print('All imports successful!')"
```

### Check GPU

```bash
python -c "import torch; print(f'CUDA: {torch.cuda.is_available()}, GPU: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else \"None\"}')"
```

### Check Models

```bash
cd backend
python -c "from services.model_downloader import ModelDownloader; ModelDownloader().list_available_models()"
```

### Test Backend API

Open http://localhost:8000 in your browser (while backend is running)

You should see:
```json
{
  "message": "CRM Business Predictor API",
  "version": "1.0.0",
  "status": "running"
}
```

### Test Frontend

Open http://localhost:5173 in your browser (while both servers are running)

---

## 🎯 Next Steps

Once setup is complete:

1. **Test the application**: Upload a sample CSV file with business data
2. **Explore features**: Try predictions, risk analysis, and auto-runner
3. **Configure settings**: Adjust GPU usage and model preferences
4. **Run offline**: Disconnect from internet and verify everything works!

---

## 📁 Project Structure

```
├── backend/
│   ├── app.py                    # Main FastAPI application
│   ├── setup_offline.py          # Offline model setup script
│   ├── requirements.txt          # Python dependencies
│   ├── .env                      # Environment configuration
│   ├── models/                   # Downloaded AI models
│   │   ├── transformers_cache/   # HuggingFace models cache
│   │   └── manifest.json         # Model metadata
│   └── services/
│       ├── model_downloader.py   # Model download service
│       ├── huggingface_service.py # HuggingFace integration
│       ├── enhanced_predictor.py  # AI prediction service
│       └── ...
├── src/                          # Frontend React code
├── package.json                  # Node.js dependencies
├── vite.config.js               # Frontend dev server config
├── install-dependencies.bat/sh  # Dependency installation
├── setup-offline.bat/sh         # Model download
└── start-app.bat/sh             # Application startup
```

---

## ❓ FAQ

### Q: Can I run this without internet?

**A:** Yes! After completing the initial setup and model download, the application runs completely offline.

### Q: Can I run this without a GPU?

**A:** Yes! The application will automatically use CPU if no GPU is detected. It will be slower but fully functional.

### Q: How much disk space do I need?

**A:** Minimum 10 GB. Models take 3-5 GB, dependencies ~2-3 GB, plus working space.

### Q: Can I use a different GPU (not RTX 4090)?

**A:** Yes! Any CUDA-compatible NVIDIA GPU will work. The RTX 4090 is just optimized for.

### Q: What if model download fails?

**A:** You can retry individual models:
```bash
cd backend
python -m services.model_downloader download-hf sentiment
```

---

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Check the console output for specific error messages
4. Ensure you have sufficient disk space and memory

---

## 🔒 Security & Privacy

- All AI processing happens **locally on your machine**
- No data is sent to external servers (when in offline mode)
- Models are downloaded once and cached permanently
- Perfect for handling sensitive business data

---

**Enjoy your offline AI-powered CRM Business Predictor!** 🎉
