# 🔧 Troubleshooting Guide

## Your Current Issues - SOLVED ✅

### Issue 1: `ModuleNotFoundError: No module named 'fastapi'`

**Problem**: Python dependencies not installed in the virtual environment.

**Solution**:
```batch
cd backend
venv\Scripts\activate
pip install -r requirements.txt
```

### Issue 2: `[vite] http proxy error: /api/system-info ECONNREFUSED`

**Problem**: Backend server is not running.

**Solution**: Start the backend server in a separate terminal:
```batch
cd backend
venv\Scripts\activate
python app.py
```

Keep this terminal window open! The backend must continue running.

---

## Quick Diagnostic Checklist

Use this checklist to diagnose issues:

### ✅ Step 1: Verify Python Installation

```bash
python --version
# Should show: Python 3.8 or higher
```

**If fails**: Install Python from https://www.python.org/downloads/

---

### ✅ Step 2: Verify Node.js Installation

```bash
node --version
# Should show: v16.x.x or higher
```

**If fails**: Install Node.js from https://nodejs.org/

---

### ✅ Step 3: Verify Virtual Environment Exists

**Windows:**
```batch
dir backend\venv
# Should list files
```

**Linux/Mac:**
```bash
ls backend/venv
# Should list files
```

**If fails**: Create virtual environment:
```batch
cd backend
python -m venv venv
```

---

### ✅ Step 4: Verify Dependencies Installed

**Activate virtual environment first:**

**Windows:**
```batch
cd backend
venv\Scripts\activate
```

**Linux/Mac:**
```bash
cd backend
source venv/bin/activate
```

**Then test imports:**
```bash
python -c "import fastapi; print('FastAPI OK')"
python -c "import torch; print('PyTorch OK')"
python -c "import transformers; print('Transformers OK')"
```

**If any fail**: Reinstall dependencies:
```bash
pip install -r requirements.txt
```

---

### ✅ Step 5: Verify Models Downloaded

```bash
dir backend\models\manifest.json     # Windows
ls backend/models/manifest.json       # Linux/Mac
```

**If fails**: Download models:
```batch
# Windows
setup-offline.bat

# Linux/Mac
./setup-offline.sh
```

---

### ✅ Step 6: Verify Backend Starts

**Windows:**
```batch
cd backend
venv\Scripts\activate
python app.py
```

**Linux/Mac:**
```bash
cd backend
source venv/bin/activate
python app.py
```

**Expected output:**
```
╔════════════════════════════════════════╗
║  CRM Business Predictor API Server    ║
╚════════════════════════════════════════╝

🚀 Server starting...
📍 URL: http://0.0.0.0:8000
🔧 GPU: Available (or Not Available)
```

**Then test**: Open http://localhost:8000 in browser

**Expected**: JSON response with "status": "running"

---

### ✅ Step 7: Verify Frontend Starts

**In a NEW terminal (keep backend running!):**
```bash
npm run dev
```

**Expected output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

**Then test**: Open http://localhost:5173 in browser

---

## Common Error Messages

### Error: "python: command not found"

**Cause**: Python not installed or not in PATH

**Solution**:
- Windows: Use `py` instead of `python`
- Or reinstall Python and check "Add to PATH" during installation

---

### Error: "npm: command not found"

**Cause**: Node.js not installed or not in PATH

**Solution**: Install Node.js from https://nodejs.org/

---

### Error: "Cannot find module 'vite'"

**Cause**: Frontend dependencies not installed

**Solution**:
```bash
npm install
```

---

### Error: "CUDA not available"

**Cause**: No GPU detected or CUDA not installed

**Impact**: Application will use CPU (slower but functional)

**Solution (optional)**:
1. Install NVIDIA GPU drivers
2. Reinstall PyTorch with CUDA:
   ```bash
   pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
   ```

---

### Error: "Model 'sentiment' not found"

**Cause**: Models not downloaded yet

**Solution**:
```batch
# Windows
setup-offline.bat

# Linux/Mac
./setup-offline.sh
```

---

### Error: "Address already in use" (port 8000 or 5173)

**Cause**: Another instance is already running

**Solution**:
1. Find and close the other instance
2. Or change the port in `.env` (backend) or `vite.config.js` (frontend)

**Windows - Kill process on port:**
```batch
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Linux/Mac - Kill process on port:**
```bash
lsof -i :8000
kill -9 <PID>
```

---

## Installation Issues

### PyTorch Installation Fails

**Try different CUDA version:**
```bash
# CUDA 11.8
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# CPU only (no GPU)
pip install torch torchvision torchaudio
```

---

### Transformers Installation Fails

**Solution**: Install with specific version:
```bash
pip install transformers==4.47.1
```

---

### Out of Disk Space

**Check space needed:**
- Dependencies: ~2-3 GB
- Models: 3-5 GB (depending on profile)
- **Total**: ~10 GB recommended

**Solution**: Free up disk space or use minimal profile:
```bash
python setup_offline.py --profile minimal
```

---

## Runtime Issues

### Application Slow/Laggy

**Possible causes:**
1. Running on CPU instead of GPU
2. Insufficient RAM
3. Too many models loaded

**Solutions:**
1. Check GPU: `python -c "import torch; print(torch.cuda.is_available())"`
2. Close other applications
3. Use lighter model profile

---

### Predictions Not Working

**Check:**
1. Backend console for error messages
2. Browser console (F12) for frontend errors
3. Ensure models are downloaded

**Test backend directly:**
```bash
curl http://localhost:8000/api/health
```

---

## Getting Help

### Information to Collect

When asking for help, provide:

1. **Operating System**: Windows/Linux/Mac
2. **Python Version**: `python --version`
3. **Node Version**: `node --version`
4. **GPU Info**: Output of:
   ```bash
   python -c "import torch; print(f'CUDA: {torch.cuda.is_available()}')"
   ```
5. **Error Message**: Full error text
6. **What you tried**: Steps you've already attempted

---

## Still Having Issues?

1. **Clean reinstall**:
   ```bash
   # Remove and recreate virtual environment
   rm -rf backend/venv  # or rmdir /s backend\venv on Windows
   cd backend
   python -m venv venv
   # Then run install-dependencies script again
   ```

2. **Check logs**: Look in backend console output for specific errors

3. **Verify file structure**: Ensure all files are in correct locations

4. **Check permissions**: Ensure you have write permissions in the project folder

---

**Most issues are solved by following the checklist above!** 🎯
