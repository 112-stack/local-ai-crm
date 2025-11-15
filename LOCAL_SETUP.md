# 🚀 Local Setup Guide - Fully Offline Operation

This guide will help you set up the CRM Business Predictor to run completely locally without requiring internet access (except for initial dependency installation).

## ✨ Features

- **Fully Local Operation**: Runs on your machine without cloud dependencies
- **Auto-Download**: Automatically downloads and sets up all required modules
- **Offline AI**: Uses local PyTorch models instead of OpenAI API
- **Zero Configuration**: One command to set up everything
- **Auto-Recovery**: Automatically creates missing models and dependencies

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download](https://python.org/)
- **pip** (Python package manager) - Usually comes with Python

### Verify Installation

```bash
# Check Node.js
node --version

# Check Python
python --version  # or python3 --version

# Check pip
pip --version  # or pip3 --version
```

## 🎯 Quick Start (Recommended)

### Option 1: One-Command Setup and Start

```bash
# Install dependencies and start everything
npm run setup && npm start
```

That's it! The application will:
1. ✓ Install all Node.js dependencies
2. ✓ Install all Python dependencies
3. ✓ Create required directories
4. ✓ Download and initialize AI models
5. ✓ Start both frontend and backend servers

### Option 2: Step-by-Step Setup

If you prefer to run steps individually:

```bash
# Step 1: Run the setup wizard
npm run setup

# Step 2: Start the application
npm start
```

## 🌐 Accessing the Application

Once started, you can access:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🔧 Manual Setup (Advanced)

If you want more control over the setup process:

### 1. Install Node Dependencies

```bash
npm install
```

### 2. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
# or on some systems:
pip3 install -r requirements.txt
```

### 3. Initialize AI Models

```bash
cd backend
python services/model_downloader.py setup
# or:
python3 services/model_downloader.py setup
```

### 4. Start Servers Manually

**Terminal 1 - Backend:**
```bash
npm run backend
# or:
cd backend && python app.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## 📦 What Gets Downloaded?

During setup, the following will be automatically downloaded and installed:

### Node.js Packages (Frontend)
- React & React DOM
- React Router
- Axios (for API calls)
- Recharts (for visualizations)
- TailwindCSS (for styling)
- Vite (build tool)
- And other dependencies...

### Python Packages (Backend)
- FastAPI (web framework)
- Uvicorn (ASGI server)
- PyTorch (AI/ML framework)
- NumPy, Pandas (data processing)
- Scikit-learn (machine learning utilities)
- And other dependencies...

### AI Models
- **Business Predictor Model**: A PyTorch neural network for risk analysis
  - Created automatically if not present
  - Stored in `backend/models/business_predictor.pth`
  - No internet required after initial setup

## 🔄 Auto-Download Features

The application includes intelligent auto-downloading:

### On First Run
- Checks for missing dependencies
- Downloads and installs them automatically
- Creates default AI models if missing
- Sets up required directories

### On Subsequent Runs
- Verifies all dependencies are present
- Auto-creates missing models
- Recovers from missing files

### Offline Operation
Once set up, the application works completely offline:
- ✓ No API keys required
- ✓ No internet connection needed
- ✓ All processing happens locally
- ✓ Data stays on your machine

## 🛠️ Troubleshooting

### Issue: Python not found

**Solution:**
- Install Python from [python.org](https://python.org/)
- Make sure to check "Add Python to PATH" during installation
- Restart your terminal after installation

### Issue: pip not found

**Solution:**
```bash
# Download get-pip.py
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py

# Install pip
python get-pip.py
```

### Issue: npm not found

**Solution:**
- Install Node.js from [nodejs.org](https://nodejs.org/)
- npm comes bundled with Node.js
- Restart your terminal after installation

### Issue: Permission denied on scripts

**Solution:**
```bash
# Make scripts executable (Linux/Mac)
chmod +x setup-local.js start-local.js

# On Windows, run with node explicitly:
node setup-local.js
node start-local.js
```

### Issue: Port 5173 or 8000 already in use

**Solution:**
```bash
# Find and kill the process using the port
# On Linux/Mac:
lsof -ti:5173 | xargs kill
lsof -ti:8000 | xargs kill

# On Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Issue: PyTorch installation fails

**Solution:**
```bash
# Install PyTorch CPU version (smaller, no GPU required)
pip install torch --index-url https://download.pytorch.org/whl/cpu
```

### Issue: Models not loading

**Solution:**
```bash
# Manually create models
cd backend
python services/model_downloader.py setup

# Or delete and recreate
rm -rf backend/models/*
python services/model_downloader.py setup
```

## 🎮 Usage Tips

### Use Local AI (No Internet Required)
1. Go to Settings in the application
2. Select "Use Local Model" option
3. Predictions will use your local PyTorch model

### Use OpenAI (Requires Internet)
1. Go to Settings
2. Enter your OpenAI API key
3. Select "Use OpenAI" option
4. Predictions will use GPT models

### Hybrid Mode
- The application can fallback to local models if OpenAI fails
- Useful for testing or when internet is unreliable

## 📊 Model Management

### List Available Models
```bash
cd backend
python services/model_downloader.py list
```

### Create New Model
```bash
cd backend
python services/model_downloader.py create
```

### Cleanup Old Models
```bash
cd backend
python services/model_downloader.py cleanup
```

## 🔒 Security & Privacy

When running locally:
- ✓ All data stays on your machine
- ✓ No cloud services required
- ✓ No telemetry or tracking
- ✓ Complete data privacy
- ✓ Works in air-gapped environments

## 📁 Directory Structure

```
├── backend/
│   ├── models/          # AI models stored here
│   ├── uploads/         # Temporary file uploads
│   ├── data/           # Application data
│   └── services/       # Backend services
├── src/                # Frontend source code
├── node_modules/       # Node.js dependencies (auto-created)
├── setup-local.js      # Setup wizard
├── start-local.js      # Start script
└── package.json        # Project configuration
```

## 🔄 Updating

To update the application:

```bash
# Pull latest changes (if from git)
git pull

# Re-run setup to install new dependencies
npm run setup

# Restart the application
npm start
```

## 🛑 Stopping the Application

Press `Ctrl+C` in the terminal where the application is running.

Both frontend and backend servers will shut down gracefully.

## 💡 Pro Tips

1. **First time setup?** Use `npm run setup` - it checks everything for you
2. **Quick start?** Just run `npm start` - it auto-installs missing packages
3. **Development?** Run frontend and backend separately for better control
4. **Production?** Build the frontend with `npm run build` for better performance

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the console output for error messages
3. Ensure all prerequisites are installed
4. Try deleting `node_modules` and running setup again

## 🎉 Success!

If everything is working, you should see:
- ✓ Frontend running on http://localhost:5173
- ✓ Backend running on http://localhost:8000
- ✓ No error messages in the console
- ✓ Application accessible in your browser

Enjoy your fully local CRM Business Predictor! 🚀
