# 🚀 Quick Start Guide

## For Windows Users

### First Time Setup (20-40 minutes, requires internet)

1. **Install everything:**
   ```batch
   install-dependencies.bat
   ```

2. **Download AI models (ONLY step needing internet):**
   ```batch
   setup-offline.bat
   ```

3. **Start the app:**
   ```batch
   start-app.bat
   ```

4. **Open browser:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

---

## For Linux/Mac Users

### First Time Setup (20-40 minutes, requires internet)

1. **Install everything:**
   ```bash
   chmod +x *.sh
   ./install-dependencies.sh
   ```

2. **Download AI models (ONLY step needing internet):**
   ```bash
   ./setup-offline.sh
   ```

3. **Start the app:**
   ```bash
   ./start-app.sh
   ```

4. **Open browser:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

---

## After First Setup

Just run:
- Windows: `start-app.bat`
- Linux/Mac: `./start-app.sh`

**No internet needed!** ✨

---

## Common Issues

### "ModuleNotFoundError: No module named 'fastapi'"

You're in the wrong directory. The error shows you're running from the desktop folder. You need to:

**Windows:**
```batch
cd path\to\project\folder
cd backend
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

**The project folder should contain:**
- `backend/` folder
- `src/` folder
- `package.json` file
- The `.bat` or `.sh` scripts

### Backend not starting (ECONNREFUSED error)

The backend Python server isn't running. Open a separate terminal:

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

Keep this terminal open! The backend must stay running.

---

## Full Documentation

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed instructions and troubleshooting.
