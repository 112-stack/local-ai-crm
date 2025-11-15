#!/bin/bash

echo "======================================"
echo "React CRM Business Predictor Installer"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "${YELLOW}Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}Node.js version must be 18 or higher. Current: $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v) found${NC}"

# Check Python
echo -e "${YELLOW}Checking Python...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Python 3 is not installed. Please install Python 3.9+ first.${NC}"
    exit 1
fi
PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
echo -e "${GREEN}✓ Python $(python3 --version) found${NC}"

# Check NVIDIA GPU
echo -e "${YELLOW}Checking for NVIDIA GPU...${NC}"
if command -v nvidia-smi &> /dev/null; then
    echo -e "${GREEN}✓ NVIDIA GPU detected${NC}"
    nvidia-smi --query-gpu=name --format=csv,noheader
    GPU_AVAILABLE=true
else
    echo -e "${YELLOW}⚠ No NVIDIA GPU detected. Will use CPU mode.${NC}"
    GPU_AVAILABLE=false
fi

# Install frontend dependencies
echo ""
echo -e "${YELLOW}Installing frontend dependencies...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install frontend dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

# Create backend directories
mkdir -p backend/uploads
mkdir -p backend/models
mkdir -p backend/data
touch backend/uploads/.gitkeep

# Setup Python virtual environment
echo ""
echo -e "${YELLOW}Setting up Python virtual environment...${NC}"
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate

# Install backend dependencies
echo -e "${YELLOW}Installing backend dependencies...${NC}"
pip install --upgrade pip setuptools wheel

# Install PyTorch with CUDA 12.1 support if GPU is available
if [ "$GPU_AVAILABLE" = true ]; then
    echo -e "${YELLOW}Installing PyTorch with CUDA 12.1 support...${NC}"
    pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

    # Setup CUDA 12 environment variables automatically
    echo -e "${YELLOW}Setting up CUDA 12 environment variables...${NC}"

    # Detect CUDA installation path
    if [ -d "/usr/local/cuda-12.1" ]; then
        CUDA_PATH="/usr/local/cuda-12.1"
    elif [ -d "/usr/local/cuda-12" ]; then
        CUDA_PATH="/usr/local/cuda-12"
    elif [ -d "/usr/local/cuda" ]; then
        CUDA_PATH="/usr/local/cuda"
    fi

    if [ ! -z "$CUDA_PATH" ]; then
        # Add to current session
        export CUDA_HOME="$CUDA_PATH"
        export PATH="$CUDA_PATH/bin:$PATH"
        export LD_LIBRARY_PATH="$CUDA_PATH/lib64:$LD_LIBRARY_PATH"

        # Make permanent by adding to .bashrc if not already there
        if ! grep -q "CUDA_HOME" ~/.bashrc; then
            echo "" >> ~/.bashrc
            echo "# CUDA 12 Environment Variables" >> ~/.bashrc
            echo "export CUDA_HOME=\"$CUDA_PATH\"" >> ~/.bashrc
            echo "export PATH=\"\$CUDA_HOME/bin:\$PATH\"" >> ~/.bashrc
            echo "export LD_LIBRARY_PATH=\"\$CUDA_HOME/lib64:\$LD_LIBRARY_PATH\"" >> ~/.bashrc
            echo -e "${GREEN}✓ CUDA 12 environment variables added to ~/.bashrc${NC}"
        fi
        echo -e "${GREEN}✓ CUDA 12 environment configured at $CUDA_PATH${NC}"
    else
        echo -e "${YELLOW}⚠ CUDA installation not found in standard paths${NC}"
    fi
else
    echo -e "${YELLOW}Installing PyTorch (CPU version)...${NC}"
    pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
fi

# Install other dependencies with pre-built wheels (avoid compilation)
echo -e "${YELLOW}Installing remaining dependencies...${NC}"
pip install --only-binary=:all: numpy pandas scikit-learn 2>/dev/null || pip install numpy pandas scikit-learn

# Install rest of requirements
pip install -r requirements.txt

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install backend dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env configuration file...${NC}"
    cat > .env << EOF
# Server Configuration
HOST=0.0.0.0
PORT=8000

# AI Configuration
USE_LOCAL_GPU=$GPU_AVAILABLE
CUDA_VISIBLE_DEVICES=0

# OpenAI (Optional)
OPENAI_API_KEY=
USE_OPENAI=false

# Model Configuration
MODEL_TYPE=local
EOF
    echo -e "${GREEN}✓ Configuration file created at backend/.env${NC}"
fi

cd ..

# Create run script
cat > run.sh << 'EOF'
#!/bin/bash
echo "Starting React CRM Business Predictor..."
echo ""
echo "Backend will run on http://localhost:8000"
echo "Frontend will run on http://localhost:5173"
echo ""

# Start backend in background
cd backend
source venv/bin/activate
python app.py &
BACKEND_PID=$!
cd ..

# Start frontend
npm run dev &
FRONTEND_PID=$!

# Trap Ctrl+C and cleanup
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT

# Wait for both processes
wait
EOF

chmod +x run.sh

echo ""
echo -e "${GREEN}======================================"
echo "Installation Complete!"
echo "======================================${NC}"
echo ""
echo "To start the application:"
echo "  ./run.sh"
echo ""
echo "Or manually:"
echo "  Terminal 1: cd backend && source venv/bin/activate && python app.py"
echo "  Terminal 2: npm run dev"
echo ""
if [ "$GPU_AVAILABLE" = false ]; then
    echo -e "${YELLOW}Note: Running in CPU mode. For GPU support, install CUDA Toolkit.${NC}"
fi
