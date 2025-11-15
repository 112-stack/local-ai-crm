# Quick Start Guide

Get up and running with React CRM Business Predictor in under 5 minutes!

## Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Python 3.9+** - [Download here](https://www.python.org/)
- **NVIDIA GPU** (optional) - For local AI predictions

## Installation

### Automated (Recommended)

**Linux/Mac:**
```bash
chmod +x install.sh
./install.sh
```

**Windows:**
```cmd
install.bat
```

### Manual

1. **Install Frontend Dependencies**
```bash
npm install
```

2. **Install Backend Dependencies**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **Configure Environment**
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your preferences
```

## Running the Application

### Option 1: Auto-Runner Script

```bash
chmod +x run.sh
./run.sh
```

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python app.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## First Steps

1. **Open your browser** to `http://localhost:5173`

2. **Configure Settings**
   - Navigate to Settings page
   - Choose your AI model (Local GPU or OpenAI)
   - If using OpenAI, enter your API key

3. **Add Your First Applicant**
   - Go to Applicants page
   - Click "Add Applicant" or "Upload CSV/Excel"
   - Fill in the details
   - Get instant AI-powered risk analysis!

4. **Explore Features**
   - **Dashboard** - Overview and analytics
   - **Events** - Schedule meetings and events
   - **Weddings** - Manage wedding reservations
   - **Predictions** - View all AI predictions

## Sample Data

A sample CSV file is included at `backend/data/sample_applicants.csv`. Try uploading it to see the system in action!

## GPU Support

### Check GPU Availability

The app automatically detects NVIDIA GPUs. Check the Settings page to see:
- GPU status
- CUDA version
- Device information

### Enable GPU Mode

1. Install [CUDA Toolkit](https://developer.nvidia.com/cuda-downloads)
2. In Settings, enable "Use Local GPU"
3. Model will automatically use GPU for faster predictions

## Using OpenAI (Optional)

1. Get an API key from [OpenAI](https://platform.openai.com/)
2. Go to Settings
3. Enable "Enable OpenAI"
4. Enter your API key
5. Choose model type: "OpenAI" or "Hybrid"

## Troubleshooting

### Backend won't start
- Check Python version: `python --version` (need 3.9+)
- Verify virtual environment is activated
- Check port 8000 is not in use

### Frontend won't start
- Check Node version: `node -v` (need 18+)
- Delete `node_modules` and run `npm install` again
- Check port 5173 is not in use

### GPU not detected
- Install NVIDIA drivers
- Install CUDA Toolkit
- Verify with: `nvidia-smi`

### Upload not working
- Check file format (CSV or XLSX)
- Verify column headers match expected format
- Check backend logs for errors

## Need Help?

- Check the [README.md](README.md) for detailed documentation
- Report issues on GitHub
- Review backend logs at `backend/app.py` output

## Next Steps

- Customize the ML model in `backend/services/predictor.py`
- Add more risk factors in `backend/services/risk_analyzer.py`
- Extend the frontend components in `src/components/`
- Set up a production database (currently uses in-memory storage)

Happy predicting! 🚀
