#!/bin/bash

echo "======================================"
echo "React CRM Business Predictor Installer"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

INSTALL_FAILED=false
ERROR_MESSAGES=""

# Check Node.js
echo -e "${BLUE}[1/5] Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERROR] Node.js is not installed. Please install Node.js 18+ first.${NC}"
    echo "Download from: https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}[ERROR] Node.js version must be 18 or higher. Current: $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v) found${NC}"
echo ""

# Check Python
echo -e "${BLUE}[2/5] Checking Python...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}[ERROR] Python 3 is not installed. Please install Python 3.9-3.12 first.${NC}"
    echo "Download from: https://www.python.org/downloads/"
    exit 1
fi

# Extract Python version
PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d'.' -f1)
PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d'.' -f2)

echo -e "${GREEN}✓ Python $PYTHON_VERSION found${NC}"

# Check Python version compatibility
if [ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -gt 13 ]; then
    echo -e "${YELLOW}[WARNING] Python $PYTHON_VERSION detected. This version is very new.${NC}"
    echo -e "${YELLOW}PyTorch may not have pre-built wheels for Python 3.14+.${NC}"
    echo ""
    echo "RECOMMENDED: Install Python 3.9-3.12 for best compatibility."
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
elif [ "$PYTHON_MAJOR" -lt 3 ] || ([ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -lt 9 ]); then
    echo -e "${YELLOW}[WARNING] Python $PYTHON_VERSION detected. Python 3.9+ is recommended.${NC}"
fi
echo ""

# Check for C++ compiler (gcc/g++)
echo -e "${BLUE}[3/5] Checking for C++ compiler...${NC}"
if command -v gcc &> /dev/null && command -v g++ &> /dev/null; then
    echo -e "${GREEN}✓ GCC/G++ compiler found${NC}"
    gcc --version | head -n1
else
    echo -e "${YELLOW}[WARNING] GCC/G++ compiler not found.${NC}"
    echo "Some packages may fail to build. To install:"
    echo "  Ubuntu/Debian: sudo apt-get install build-essential"
    echo "  Fedora/RHEL: sudo dnf groupinstall 'Development Tools'"
    echo "  macOS: xcode-select --install"
    echo ""
fi
echo ""

# Check NVIDIA GPU
echo -e "${BLUE}[4/5] Checking for NVIDIA GPU...${NC}"
if command -v nvidia-smi &> /dev/null; then
    echo -e "${GREEN}✓ NVIDIA GPU detected${NC}"
    nvidia-smi --query-gpu=name --format=csv,noheader
    GPU_AVAILABLE=true
else
    echo -e "${YELLOW}[INFO] No NVIDIA GPU detected. Will use CPU mode.${NC}"
    GPU_AVAILABLE=false
fi
echo ""

# Install frontend dependencies
echo -e "${BLUE}[5/5] Installing frontend dependencies...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR] Failed to install frontend dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
echo ""

# Create backend directories
mkdir -p backend/uploads
mkdir -p backend/models
mkdir -p backend/data
touch backend/uploads/.gitkeep

# Setup Python virtual environment
echo ""
echo "======================================"
echo "Setting up Python Backend"
echo "======================================"
echo ""
echo "Creating Python virtual environment..."
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo -e "${RED}[ERROR] Failed to create virtual environment${NC}"
        exit 1
    fi
fi
source venv/bin/activate

# Upgrade pip, setuptools, wheel
echo ""
echo "Upgrading pip, setuptools, and wheel..."
pip install --upgrade pip setuptools wheel > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}[WARNING] Failed to upgrade pip/setuptools/wheel${NC}"
fi

# Install PyTorch based on GPU availability and Python version
echo ""
echo "======================================"
echo "Installing PyTorch"
echo "======================================"
echo ""

# Determine PyTorch installation strategy
if [ "$PYTHON_MINOR" -gt 12 ]; then
    echo -e "${BLUE}[INFO] Python 3.$PYTHON_MINOR detected - using default PyTorch index${NC}"
    if [ "$GPU_AVAILABLE" = true ]; then
        echo "Installing PyTorch with CUDA support..."
        echo "This may take several minutes..."
        pip install torch torchvision torchaudio
        if [ $? -ne 0 ]; then
            echo -e "${YELLOW}[WARNING] PyTorch CUDA installation failed, trying CPU version...${NC}"
            pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
            if [ $? -ne 0 ]; then
                echo -e "${RED}[ERROR] PyTorch installation failed${NC}"
                INSTALL_FAILED=true
                ERROR_MESSAGES="${ERROR_MESSAGES}- PyTorch installation failed\n"
            else
                echo -e "${GREEN}✓ PyTorch (CPU) installed successfully${NC}"
                GPU_AVAILABLE=false
            fi
        else
            echo -e "${GREEN}✓ PyTorch with CUDA support installed${NC}"
        fi
    else
        echo "Installing PyTorch (CPU version)..."
        pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
        if [ $? -ne 0 ]; then
            echo -e "${RED}[ERROR] PyTorch installation failed${NC}"
            INSTALL_FAILED=true
            ERROR_MESSAGES="${ERROR_MESSAGES}- PyTorch installation failed\n"
        else
            echo -e "${GREEN}✓ PyTorch (CPU) installed successfully${NC}"
        fi
    fi
else
    if [ "$GPU_AVAILABLE" = true ]; then
        echo "Installing PyTorch with CUDA 12.1 support..."
        echo "This may take several minutes..."
        pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

        if [ $? -ne 0 ]; then
            echo -e "${YELLOW}[WARNING] CUDA 12.1 installation failed, trying CPU version...${NC}"
            pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
            if [ $? -ne 0 ]; then
                echo -e "${RED}[ERROR] PyTorch installation failed${NC}"
                INSTALL_FAILED=true
                ERROR_MESSAGES="${ERROR_MESSAGES}- PyTorch installation failed\n"
            else
                echo -e "${GREEN}✓ PyTorch (CPU) installed successfully${NC}"
                GPU_AVAILABLE=false
            fi
        else
            echo -e "${GREEN}✓ PyTorch with CUDA 12.1 installed successfully${NC}"

            # Setup CUDA 12 environment variables
            echo "Setting up CUDA 12 environment variables..."

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
                echo -e "${YELLOW}[WARNING] CUDA installation not found in standard paths${NC}"
            fi
        fi
    else
        echo "Installing PyTorch (CPU version)..."
        pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
        if [ $? -ne 0 ]; then
            echo -e "${RED}[ERROR] PyTorch installation failed${NC}"
            INSTALL_FAILED=true
            ERROR_MESSAGES="${ERROR_MESSAGES}- PyTorch installation failed\n"
        else
            echo -e "${GREEN}✓ PyTorch (CPU) installed successfully${NC}"
        fi
    fi
fi

# Install core dependencies with binary wheels
echo ""
echo "======================================"
echo "Installing Core Dependencies"
echo "======================================"
echo ""
echo "Installing numpy, pandas, scikit-learn..."
pip install --prefer-binary numpy pandas scikit-learn
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}[WARNING] Some packages may have been installed from source${NC}"
fi

# Install remaining requirements
echo ""
echo "Installing remaining dependencies..."
echo "This may take several minutes..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR] Failed to install some requirements${NC}"
    INSTALL_FAILED=true
    ERROR_MESSAGES="${ERROR_MESSAGES}- Requirements installation had errors\n"
else
    echo -e "${GREEN}✓ All dependencies installed successfully${NC}"
fi

# Verify critical packages
echo ""
echo "Verifying installation..."
python -c "import torch; import numpy; import pandas; import sklearn; import fastapi; print('All critical packages imported successfully')" 2>/dev/null
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}[WARNING] Some critical packages failed to import${NC}"
    echo "Run 'python -c \"import torch; import numpy; import pandas\"' to debug"
    INSTALL_FAILED=true
    ERROR_MESSAGES="${ERROR_MESSAGES}- Package import verification failed\n"
else
    echo -e "${GREEN}✓ Package verification passed${NC}"
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo ""
    echo "Creating .env configuration file..."
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
echo "======================================"
if [ "$INSTALL_FAILED" = true ]; then
    echo -e "${RED}Installation Completed with ERRORS${NC}"
    echo "======================================"
    echo ""
    echo -e "${RED}[!] The following errors occurred:${NC}"
    echo -e "$ERROR_MESSAGES"
    echo "Please fix the errors above before running the application."
    echo ""
    echo "Common solutions:"
    echo "1. Install Python 3.9-3.12 instead of 3.14+"
    echo "2. Install build tools: sudo apt-get install build-essential (Ubuntu/Debian)"
    echo "3. Check your internet connection"
    echo "4. Run: cd backend && source venv/bin/activate && pip install -r requirements.txt"
    echo ""
else
    echo -e "${GREEN}Installation Complete!${NC}"
    echo "======================================"
    echo ""
    echo -e "${GREEN}[OK] All components installed successfully!${NC}"
    echo ""
    echo "To start the application:"
    echo "  ./run.sh"
    echo ""
    echo "Or manually:"
    echo "  Terminal 1: cd backend && source venv/bin/activate && python app.py"
    echo "  Terminal 2: npm run dev"
    echo ""
    if [ "$GPU_AVAILABLE" = false ]; then
        echo -e "${YELLOW}[INFO] Running in CPU mode. For GPU support:${NC}"
        echo "  1. Install CUDA Toolkit 12.1"
        echo "  2. Reinstall: cd backend && source venv/bin/activate && pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121"
        echo ""
    fi
fi
