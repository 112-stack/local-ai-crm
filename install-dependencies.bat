@echo off
REM Installation script for Windows
REM Installs all dependencies for CRM Business Predictor

echo ========================================
echo  CRM Business Predictor Setup
echo  Installing Dependencies
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found! Please install Python 3.8 or higher
    echo Download from: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo [1/4] Python version:
python --version
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found! Please install Node.js 16 or higher
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo [2/4] Node.js version:
node --version
echo.

REM Install frontend dependencies
echo [3/4] Installing frontend dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)
echo Frontend dependencies installed successfully!
echo.

REM Install backend dependencies
echo [4/4] Installing backend dependencies...
cd backend

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment and install dependencies
echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing Python packages...
python -m pip install --upgrade pip
pip install -r requirements.txt

REM Install PyTorch with CUDA support for RTX 4090
echo.
echo Installing PyTorch with CUDA 12.1 support (for RTX 4090)...
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

cd ..

echo.
echo ========================================
echo  Installation Complete!
echo ========================================
echo.
echo Next steps:
echo   1. Download AI models: setup-offline.bat
echo   2. Start the application: start-app.bat
echo.
pause
