@echo off
echo ======================================
echo React CRM Business Predictor Installer
echo ======================================
echo.

REM Check Node.js
echo Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)
echo Node.js found:
node -v

REM Check Python
echo Checking Python...
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Python is not installed. Please install Python 3.9+ first.
    exit /b 1
)
echo Python found:
python --version

REM Check NVIDIA GPU
echo Checking for NVIDIA GPU...
where nvidia-smi >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo NVIDIA GPU detected
    nvidia-smi --query-gpu=name --format=csv,noheader
    set GPU_AVAILABLE=true
) else (
    echo No NVIDIA GPU detected. Will use CPU mode.
    set GPU_AVAILABLE=false
)

REM Install frontend dependencies
echo.
echo Installing frontend dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install frontend dependencies
    exit /b 1
)

REM Create backend directories
if not exist "backend\uploads" mkdir backend\uploads
if not exist "backend\models" mkdir backend\models
if not exist "backend\data" mkdir backend\data
type nul > backend\uploads\.gitkeep

REM Setup Python virtual environment
echo.
echo Setting up Python virtual environment...
cd backend
if not exist "venv" (
    python -m venv venv
)
call venv\Scripts\activate.bat

REM Install backend dependencies
echo Installing backend dependencies...
python -m pip install --upgrade pip
if %ERRORLEVEL% NEQ 0 (
    echo Failed to upgrade pip
    exit /b 1
)

REM Install PyTorch first (before other dependencies)
if "%GPU_AVAILABLE%"=="true" (
    echo Installing PyTorch with CUDA support...
    pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
    if %ERRORLEVEL% NEQ 0 (
        echo Failed to install PyTorch with CUDA. Falling back to CPU version...
        pip install torch torchvision torchaudio
    )
) else (
    echo Installing PyTorch CPU version...
    pip install torch torchvision torchaudio
)

if %ERRORLEVEL% NEQ 0 (
    echo Failed to install PyTorch
    exit /b 1
)

REM Install numpy (using pre-built wheel)
echo Installing NumPy...
pip install numpy
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install NumPy
    exit /b 1
)

REM Install remaining dependencies
echo Installing remaining dependencies...
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install backend dependencies
    exit /b 1
)

REM Create .env file
if not exist ".env" (
    echo Creating .env configuration file...
    (
        echo # Server Configuration
        echo HOST=0.0.0.0
        echo PORT=8000
        echo.
        echo # AI Configuration
        echo USE_LOCAL_GPU=%GPU_AVAILABLE%
        echo CUDA_VISIBLE_DEVICES=0
        echo.
        echo # OpenAI (Optional^)
        echo OPENAI_API_KEY=
        echo USE_OPENAI=false
        echo.
        echo # Model Configuration
        echo MODEL_TYPE=local
    ) > .env
)

cd ..

REM Create run script
(
    echo @echo off
    echo echo Starting React CRM Business Predictor...
    echo echo.
    echo echo Backend will run on http://localhost:8000
    echo echo Frontend will run on http://localhost:5173
    echo echo.
    echo start "Backend" cmd /k "cd backend && venv\Scripts\activate.bat && python app.py"
    echo timeout /t 3 /nobreak ^> nul
    echo start "Frontend" cmd /k "npm run dev"
) > run.bat

echo.
echo ======================================
echo Installation Complete!
echo ======================================
echo.
echo To start the application, run:
echo   run.bat
echo.
if "%GPU_AVAILABLE%"=="false" (
    echo Note: Running in CPU mode. For GPU support, install CUDA Toolkit.
)
pause
