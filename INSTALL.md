# Installation Guide - React CRM Business Predictor

## Prerequisites

### Required Software

1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - Verify: `node -v`

2. **Python** (version 3.9-3.12 recommended)
   - Download from: https://www.python.org/downloads/
   - Verify: `python --version` (Windows) or `python3 --version` (Linux/macOS)
   - **⚠️ Important:** Python 3.14+ is NOT recommended due to limited PyTorch wheel availability

3. **C++ Compiler** (required for building some packages)

   **Windows:**
   - Install [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
   - During installation, select:
     - "Desktop development with C++"
     - "MSVC v143 - VS 2022 C++ build tools"
     - "Windows SDK"

   **Linux:**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install build-essential

   # Fedora/RHEL
   sudo dnf groupinstall 'Development Tools'
   ```

   **macOS:**
   ```bash
   xcode-select --install
   ```

### Optional (for GPU acceleration)

4. **NVIDIA GPU with CUDA 12.1 support**
   - Download CUDA Toolkit from: https://developer.nvidia.com/cuda-downloads
   - Verify: `nvidia-smi`

## Installation

### Windows

1. Open Command Prompt or PowerShell as Administrator
2. Navigate to the project directory
3. Run the installer:
   ```cmd
   install.bat
   ```
4. Follow the on-screen instructions
5. Wait for installation to complete (may take 5-15 minutes)

### Linux/macOS

1. Open Terminal
2. Navigate to the project directory
3. Make the installer executable and run it:
   ```bash
   chmod +x install.sh
   ./install.sh
   ```
4. Follow the on-screen instructions
5. Wait for installation to complete (may take 5-15 minutes)

## Troubleshooting

### Issue 1: Python 3.14+ Compatibility Errors

**Symptoms:**
- `ERROR: Could not find a version that satisfies the requirement torch`
- PyTorch installation fails

**Solution:**
Install Python 3.9-3.12 instead:
1. Download Python 3.12 from https://www.python.org/downloads/
2. During installation, check "Add Python to PATH"
3. Verify: `python --version` should show 3.9.x - 3.12.x
4. Re-run the installer

### Issue 2: NumPy Build Failure on Windows

**Symptoms:**
```
ERROR: Unknown compiler(s): [['icl'], ['cl'], ['cc'], ['gcc']...]
Running `cl /?` gave "[WinError 2] The system cannot find the file specified"
```

**Solution:**
1. Install Microsoft C++ Build Tools:
   - Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/
   - Run the installer
   - Select "Desktop development with C++"
   - Select "MSVC v143 - VS 2022 C++ build tools"
   - Select "Windows SDK"
   - Click Install
2. Restart your computer
3. Re-run the installer

### Issue 3: PyTorch CUDA Installation Fails

**Symptoms:**
- CUDA GPU detected but PyTorch CUDA installation fails
- Falls back to CPU version

**Solution:**

**Option A: Use CPU version** (recommended for most users)
- The installer automatically falls back to CPU version
- No action needed, application will work but may be slower

**Option B: Install CUDA version manually**
1. Ensure CUDA Toolkit 12.1 is installed
2. Activate virtual environment:
   ```cmd
   # Windows
   cd backend
   venv\Scripts\activate.bat

   # Linux/macOS
   cd backend
   source venv/bin/activate
   ```
3. Install PyTorch with CUDA support:
   ```bash
   pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
   ```

### Issue 4: Installation Shows "Completed with ERRORS"

**Solution:**
1. Read the error messages carefully
2. Check the common solutions listed in the error output
3. Fix the reported issues
4. Try manual installation:
   ```cmd
   # Windows
   cd backend
   venv\Scripts\activate.bat
   pip install -r requirements.txt

   # Linux/macOS
   cd backend
   source venv/bin/activate
   pip install -r requirements.txt
   ```

### Issue 5: Package Import Verification Failed

**Symptoms:**
- Installation completes but verification fails
- Error: "Some critical packages failed to import"

**Solution:**
1. Activate virtual environment:
   ```cmd
   # Windows
   cd backend
   venv\Scripts\activate.bat

   # Linux/macOS
   cd backend
   source venv/bin/activate
   ```
2. Test imports manually:
   ```bash
   python -c "import torch; print('PyTorch:', torch.__version__)"
   python -c "import numpy; print('NumPy:', numpy.__version__)"
   python -c "import pandas; print('Pandas:', pandas.__version__)"
   python -c "import sklearn; print('Scikit-learn:', sklearn.__version__)"
   python -c "import fastapi; print('FastAPI:', fastapi.__version__)"
   ```
3. If any import fails, reinstall that package:
   ```bash
   pip install --force-reinstall <package-name>
   ```

### Issue 6: npm install fails

**Symptoms:**
- Frontend dependencies installation fails
- npm errors

**Solution:**
1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```
2. Delete node_modules and package-lock.json:
   ```bash
   rm -rf node_modules package-lock.json  # Linux/macOS
   rmdir /s node_modules && del package-lock.json  # Windows
   ```
3. Reinstall:
   ```bash
   npm install
   ```

## Running the Application

After successful installation:

### Windows
```cmd
run.bat
```

### Linux/macOS
```bash
./run.sh
```

### Manual Start

**Terminal 1 - Backend:**
```bash
# Windows
cd backend
venv\Scripts\activate.bat
python app.py

# Linux/macOS
cd backend
source venv/bin/activate
python app.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

## Verification

After installation, verify everything works:

1. Check Python packages:
   ```bash
   # Windows
   cd backend && venv\Scripts\activate.bat

   # Linux/macOS
   cd backend && source venv/bin/activate

   pip list
   ```

2. Check PyTorch CUDA availability (if GPU installed):
   ```bash
   python -c "import torch; print('CUDA Available:', torch.cuda.is_available())"
   ```

## System Requirements

### Minimum
- **OS:** Windows 10, Ubuntu 20.04, macOS 10.15+
- **RAM:** 8 GB
- **Storage:** 5 GB free space
- **Python:** 3.9-3.12
- **Node.js:** 18+

### Recommended (with GPU)
- **OS:** Windows 10/11, Ubuntu 22.04
- **RAM:** 16 GB
- **GPU:** NVIDIA GPU with 6GB+ VRAM
- **CUDA:** 12.1
- **Storage:** 10 GB free space

## Getting Help

If you encounter issues not covered here:

1. Check the error message carefully
2. Search for similar errors online
3. Verify all prerequisites are installed correctly
4. Try running the installer again
5. Check Python and Node.js versions

## Clean Reinstall

If you need to start fresh:

1. **Delete virtual environment:**
   ```bash
   # Windows
   rmdir /s backend\venv

   # Linux/macOS
   rm -rf backend/venv
   ```

2. **Delete node_modules:**
   ```bash
   # Windows
   rmdir /s node_modules

   # Linux/macOS
   rm -rf node_modules
   ```

3. **Re-run installer:**
   ```bash
   # Windows
   install.bat

   # Linux/macOS
   ./install.sh
   ```
