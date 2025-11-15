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
- **🤗 Hugging Face Models**: Pre-trained models for NLP tasks (sentiment, NER, etc.)
- **Business Applicant Management**: Upload and manage applicant data
- **AI-Powered Risk Assessment**: Predict business opportunities and assess risk
- **Event Scheduling**: Manage meetings and events
- **Wedding Reservations**: Specialized wedding booking system
- **Local GPU Inference**: Utilize NVIDIA GPU for fast predictions (optional)
- **OpenAI Integration**: Optional cloud-based AI processing
- **Real-time Analytics**: Business forecasting and trend analysis

## Prerequisites

**Minimum Requirements:**
- Node.js 18+ and npm
- Python 3.9+

**Optional (For GPU Acceleration):**
- NVIDIA GPU with CUDA 12.x support
- CUDA Toolkit 12.1+ (automatically configured during installation)

**Note:** The installer now uses CUDA 12.1 for optimal performance and compatibility with the latest PyTorch versions. Environment variables are set up automatically!

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

The application automatically detects NVIDIA GPU availability and sets up CUDA 12.1:

**Automatic Setup:**
1. Install CUDA Toolkit 12.1 or higher from [NVIDIA's website](https://developer.nvidia.com/cuda-downloads)
2. Run the installation script (`install.bat` or `install.sh`)
3. The installer will:
   - Detect your GPU automatically
   - Install PyTorch with CUDA 12.1 support
   - Configure CUDA environment variables automatically
   - Set `USE_LOCAL_GPU=true` in `.env`

**Manual Configuration (if needed):**
```bash
# Windows
setx CUDA_PATH "C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v12.1"
setx CUDA_HOME "C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v12.1"

# Linux
export CUDA_HOME=/usr/local/cuda-12.1
export PATH=$CUDA_HOME/bin:$PATH
export LD_LIBRARY_PATH=$CUDA_HOME/lib64:$LD_LIBRARY_PATH
```

**Verify GPU Setup:**
```bash
nvidia-smi  # Check GPU is detected
python -c "import torch; print(f'CUDA Available: {torch.cuda.is_available()}')"
```

## Hugging Face Models

The application supports pre-trained models from Hugging Face for advanced NLP tasks:

### Quick Setup

Download recommended models for business applications:

```bash
cd backend
python -m services.model_downloader download-recommended
```

This downloads models for:
- Sentiment analysis
- Emotion detection
- Named Entity Recognition (NER)
- Financial sentiment analysis

### Available Models

The application includes 8 pre-trained models:
- **sentiment**: Positive/negative sentiment analysis
- **emotion**: Detect joy, sadness, anger, fear, etc.
- **ner**: Extract person, organization, location entities
- **qa**: Question answering
- **financial-sentiment**: Specialized for financial text
- **text-generation**: Text completion (GPT-2)
- **summarization**: Text summarization
- **zero-shot**: Zero-shot classification

**📖 For detailed documentation, see [HUGGINGFACE_MODELS.md](HUGGINGFACE_MODELS.md)**

### Usage Example

```python
from services.huggingface_service import HuggingFaceService

hf = HuggingFaceService()

# Analyze sentiment
result = hf.analyze_sentiment("This is a great opportunity!")
# {'sentiment': 'POSITIVE', 'confidence': 0.9998}

# Extract entities
entities = hf.extract_entities("Apple Inc. is in Cupertino, CA")
# [{'text': 'Apple Inc.', 'type': 'ORG'}, ...]
```

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
