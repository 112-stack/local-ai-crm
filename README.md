# React CRM Business Predictor

AI-powered CRM application with business forecasting, risk management, and event scheduling capabilities. Supports **fully local operation** with auto-downloading of dependencies, local NVIDIA GPU inference, and optional OpenAI integration.

## ✨ New: Fully Local Setup with Auto-Download

**🚀 Quick Start (Recommended):**
```bash
npm run setup && npm start
```

That's it! The application will automatically:
- ✓ Download and install all Node.js dependencies
- ✓ Download and install all Python packages
- ✓ Auto-download and initialize AI models
- ✓ Start both frontend and backend servers
- ✓ Run completely offline (no internet required after setup)

**📖 For detailed instructions, see [LOCAL_SETUP.md](LOCAL_SETUP.md)**

## Features

- **🌐 Fully Local Operation**: Runs completely offline with local AI models
- **📦 Auto-Download**: Automatically downloads all required modules
- **Business Applicant Management**: Upload and manage applicant data
- **AI-Powered Risk Assessment**: Predict business opportunities and assess risk
- **Event Scheduling**: Manage meetings and events
- **Wedding Reservations**: Specialized wedding booking system
- **Local GPU Inference**: Utilize NVIDIA GPU for fast predictions (optional)
- **OpenAI Integration**: Optional cloud-based AI processing
- **Real-time Analytics**: Business forecasting and trend analysis

## Prerequisites

**Minimum Requirements:**
- Node.js 16+ and npm
- Python 3.8+

**Optional:**
- NVIDIA GPU with CUDA support (for GPU acceleration)
- CUDA Toolkit 11.8+ (if using GPU)

## Quick Start Options

### Option 1: Fully Local with Auto-Setup (Recommended)

Perfect for running completely locally without internet dependency:

```bash
# One command setup and start
npm run setup && npm start
```

See [LOCAL_SETUP.md](LOCAL_SETUP.md) for detailed local setup instructions.

### Option 2: Traditional Installation

### Automated Installation

Run the auto-installer script:

```bash
# Linux/Mac
./install.sh

# Windows
install.bat
```

### Manual Installation

1. **Install Frontend Dependencies**
```bash
npm install
```

2. **Install Backend Dependencies**
```bash
cd backend
pip install -r requirements.txt
```

3. **Configure Environment**
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your settings
```

4. **Start the Application**

Terminal 1 - Backend:
```bash
npm run backend
```

Terminal 2 - Frontend:
```bash
npm run dev
```

Access the application at `http://localhost:5173`

## Configuration

Edit `backend/.env`:

```env
# Server Configuration
HOST=0.0.0.0
PORT=8000

# AI Configuration
USE_LOCAL_GPU=true
CUDA_VISIBLE_DEVICES=0

# OpenAI (Optional)
OPENAI_API_KEY=your_api_key_here
USE_OPENAI=false

# Model Configuration
MODEL_TYPE=local  # local or openai
```

## GPU Support

The application automatically detects NVIDIA GPU availability. To enable:

1. Install CUDA Toolkit
2. Set `USE_LOCAL_GPU=true` in `.env`
3. Ensure PyTorch is installed with CUDA support

## API Endpoints

- `POST /api/predict` - Business prediction
- `POST /api/risk-analysis` - Risk assessment
- `GET /api/events` - List events
- `POST /api/events` - Create event
- `GET /api/weddings` - List wedding reservations
- `POST /api/weddings` - Create wedding reservation

## Project Structure

```
.
├── src/                    # React frontend
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── services/         # API services
│   └── store/            # State management
├── backend/              # Python backend
│   ├── app.py           # FastAPI application
│   ├── models/          # ML models
│   ├── routes/          # API routes
│   └── services/        # Business logic
└── public/              # Static assets
```

## License

MIT
