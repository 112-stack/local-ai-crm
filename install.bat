@echo off
setlocal enabledelayedexpansion

echo ======================================
echo React CRM Business Predictor Installer
echo ======================================
echo.

set "INSTALL_FAILED=false"
set "ERROR_MESSAGES="

REM Check Node.js
echo [1/5] Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js found:
node -v
echo.

REM Check Python and version
echo [2/5] Checking Python...
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed. Please install Python 3.9-3.12 first.
    echo Download from: https://www.python.org/downloads/
    pause
    exit /b 1
)
echo Python found:
python --version
echo.

REM Extract Python version and validate
for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
for /f "tokens=1,2 delims=." %%a in ("%PYTHON_VERSION%") do (
    set PYTHON_MAJOR=%%a
    set PYTHON_MINOR=%%b
)

REM Check if Python version is compatible (3.9-3.12 recommended)
if !PYTHON_MAJOR! LSS 3 (
    echo [WARNING] Python !PYTHON_VERSION! detected. Python 3.9-3.12 is recommended.
    echo Python 3.14+ may have limited PyTorch support.
    echo.
) else if !PYTHON_MAJOR! EQU 3 (
    if !PYTHON_MINOR! GTR 13 (
        echo [WARNING] Python !PYTHON_VERSION! detected. This version is very new.
        echo PyTorch may not have pre-built wheels for Python 3.14+.
        echo.
        echo RECOMMENDED: Install Python 3.9-3.12 for best compatibility.
        echo Download from: https://www.python.org/downloads/
        echo.
        choice /C YN /M "Continue anyway (may require Visual Studio Build Tools)"
        if errorlevel 2 exit /b 1
        echo.
    )
)

REM Check for C++ compiler (required for some packages on newer Python versions)
echo [3/5] Checking for C++ compiler (required for building some packages)...
where cl.exe >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Visual Studio C++ compiler not found.
    echo.
    echo If installation fails, you may need to install:
    echo   "Microsoft C++ Build Tools"
    echo   Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/
    echo.
    echo   During installation, select:
    echo   - "Desktop development with C++"
    echo   - "MSVC v143 - VS 2022 C++ build tools"
    echo   - "Windows SDK"
    echo.
    timeout /t 5 /nobreak >nul
) else (
    echo [OK] Visual Studio C++ compiler found.
)
echo.

REM Check NVIDIA GPU
echo [4/5] Checking for NVIDIA GPU...
where nvidia-smi >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] NVIDIA GPU detected
    nvidia-smi --query-gpu=name --format=csv,noheader
    set GPU_AVAILABLE=true
) else (
    echo [INFO] No NVIDIA GPU detected. Will use CPU mode.
    set GPU_AVAILABLE=false
)
echo.

REM Install frontend dependencies
echo [5/5] Installing frontend dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
)
echo [OK] Frontend dependencies installed
echo.

REM Create backend directories
if not exist "backend\uploads" mkdir backend\uploads
if not exist "backend\models" mkdir backend\models
if not exist "backend\data" mkdir backend\data
type nul > backend\uploads\.gitkeep

REM Setup Python virtual environment
echo.
echo ======================================
echo Setting up Python Backend
echo ======================================
echo.
echo Creating Python virtual environment...
cd backend
if not exist "venv" (
    python -m venv venv
    if !ERRORLEVEL! NEQ 0 (
        echo [ERROR] Failed to create virtual environment
        cd ..
        pause
        exit /b 1
    )
)
call venv\Scripts\activate.bat

REM Upgrade pip, setuptools, wheel
echo.
echo Upgrading pip, setuptools, and wheel...
python -m pip install --upgrade pip setuptools wheel >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Failed to upgrade pip/setuptools/wheel
)

REM Install PyTorch based on GPU availability and Python version
echo.
echo ======================================
echo Installing PyTorch
echo ======================================
echo.

REM Determine PyTorch installation strategy based on Python version
if !PYTHON_MINOR! GTR 12 (
    echo [INFO] Python 3.!PYTHON_MINOR! detected - using default PyTorch index
    if "%GPU_AVAILABLE%"=="true" (
        echo Installing PyTorch with CUDA support...
        echo This may take several minutes...
        pip install torch torchvision torchaudio
        if !ERRORLEVEL! NEQ 0 (
            echo [WARNING] PyTorch CUDA installation failed, trying CPU version...
            pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
            if !ERRORLEVEL! NEQ 0 (
                echo [ERROR] PyTorch installation failed completely
                set INSTALL_FAILED=true
                set "ERROR_MESSAGES=!ERROR_MESSAGES!- PyTorch installation failed\n"
            ) else (
                echo [OK] PyTorch (CPU) installed successfully
                set GPU_AVAILABLE=false
            )
        ) else (
            echo [OK] PyTorch with CUDA support installed
        )
    ) else (
        echo Installing PyTorch (CPU version)...
        pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
        if !ERRORLEVEL! NEQ 0 (
            echo [ERROR] PyTorch CPU installation failed
            set INSTALL_FAILED=true
            set "ERROR_MESSAGES=!ERROR_MESSAGES!- PyTorch installation failed\n"
        ) else (
            echo [OK] PyTorch (CPU) installed successfully
        )
    )
) else (
    if "%GPU_AVAILABLE%"=="true" (
        echo Installing PyTorch with CUDA 12.1 support...
        echo This may take several minutes...
        pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

        if !ERRORLEVEL! NEQ 0 (
            echo [WARNING] CUDA 12.1 installation failed, trying CPU version...
            pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
            if !ERRORLEVEL! NEQ 0 (
                echo [ERROR] PyTorch installation failed
                set INSTALL_FAILED=true
                set "ERROR_MESSAGES=!ERROR_MESSAGES!- PyTorch installation failed\n"
            ) else (
                echo [OK] PyTorch (CPU) installed successfully
                set GPU_AVAILABLE=false
            )
        ) else (
            echo [OK] PyTorch with CUDA 12.1 installed successfully

            REM Set CUDA environment variables
            echo Setting up CUDA 12.1 environment variables...
            setx CUDA_PATH "C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v12.1" >nul 2>&1
            setx CUDA_HOME "C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v12.1" >nul 2>&1
            echo [OK] CUDA environment variables configured
        )
    ) else (
        echo Installing PyTorch (CPU version)...
        pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
        if !ERRORLEVEL! NEQ 0 (
            echo [ERROR] PyTorch installation failed
            set INSTALL_FAILED=true
            set "ERROR_MESSAGES=!ERROR_MESSAGES!- PyTorch installation failed\n"
        ) else (
            echo [OK] PyTorch (CPU) installed successfully
        )
    )
)

REM Install core dependencies with binary wheels
echo.
echo ======================================
echo Installing Core Dependencies
echo ======================================
echo.
echo Installing numpy, pandas, scikit-learn...
pip install --prefer-binary numpy pandas scikit-learn
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Some packages may have been installed from source
)

REM Install remaining requirements
echo.
echo Installing remaining dependencies...
echo This may take several minutes...
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install some requirements
    set INSTALL_FAILED=true
    set "ERROR_MESSAGES=!ERROR_MESSAGES!- Requirements installation had errors\n"
) else (
    echo [OK] All dependencies installed successfully
)

REM Verify critical packages
echo.
echo Verifying installation...
python -c "import torch; import numpy; import pandas; import sklearn; import fastapi; print('All critical packages imported successfully')" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Some critical packages failed to import
    echo Run 'python -c "import torch; import numpy; import pandas"' to debug
    set INSTALL_FAILED=true
    set "ERROR_MESSAGES=!ERROR_MESSAGES!- Package import verification failed\n"
) else (
    echo [OK] Package verification passed
)

REM Create .env file
if not exist ".env" (
    echo.
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
    echo [OK] Configuration file created
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
if "%INSTALL_FAILED%"=="true" (
    echo Installation Completed with ERRORS
    echo ======================================
    echo.
    echo [!] The following errors occurred:
    echo !ERROR_MESSAGES!
    echo.
    echo Please fix the errors above before running the application.
    echo.
    echo Common solutions:
    echo 1. Install Python 3.9-3.12 instead of 3.14+
    echo 2. Install Microsoft C++ Build Tools
    echo 3. Check your internet connection
    echo 4. Run: cd backend ^&^& venv\Scripts\activate.bat ^&^& pip install -r requirements.txt
    echo.
) else (
    echo Installation Complete!
    echo ======================================
    echo.
    echo [OK] All components installed successfully!
    echo.
    echo To start the application, run:
    echo   run.bat
    echo.
    if "%GPU_AVAILABLE%"=="false" (
        echo [INFO] Running in CPU mode. For GPU support:
        echo   1. Install CUDA Toolkit 12.1
        echo   2. Reinstall: cd backend ^&^& venv\Scripts\activate.bat ^&^& pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
        echo.
    )
)
pause
