@echo off
setlocal enabledelayedexpansion
title React CRM Business Predictor - Auto Launcher

REM ============================================
REM React CRM Business Predictor - Auto Runner
REM ============================================

echo.
echo ============================================
echo React CRM Business Predictor - Auto Runner
echo ============================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed!
    echo.
    echo Please install Python from: https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo [INFO] Frontend dependencies not found. Running installation...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install frontend dependencies
        pause
        exit /b 1
    )
    echo [OK] Frontend dependencies installed
    echo.
)

REM Check if backend virtual environment exists
if not exist "backend\venv" (
    echo [INFO] Backend not configured. Running installation...
    echo.
    echo This may take several minutes...
    echo.
    call install.bat
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Installation failed
        pause
        exit /b 1
    )
)

REM Check if backend .env file exists
if not exist "backend\.env" (
    echo [INFO] Creating backend configuration file...
    cd backend
    (
        echo # Server Configuration
        echo HOST=0.0.0.0
        echo PORT=8000
        echo.
        echo # AI Configuration
        echo USE_LOCAL_GPU=false
        echo CUDA_VISIBLE_DEVICES=0
        echo.
        echo # OpenAI (Optional^)
        echo OPENAI_API_KEY=
        echo USE_OPENAI=false
        echo.
        echo # Model Configuration
        echo MODEL_TYPE=local
    ) > .env
    cd ..
    echo [OK] Configuration created
    echo.
)

REM Create necessary directories
if not exist "backend\uploads" mkdir backend\uploads
if not exist "backend\models" mkdir backend\models
if not exist "backend\data" mkdir backend\data

echo.
echo ============================================
echo Starting Application
echo ============================================
echo.
echo Backend will run on http://localhost:8000
echo Frontend will run on http://localhost:5173
echo.
echo Press Ctrl+C in each window to stop the servers
echo.

REM Start backend in new window
echo [1/2] Starting backend server...
start "CRM Backend Server" cmd /k "cd /d "%~dp0backend" && call venv\Scripts\activate.bat && python app.py"

REM Wait for backend to initialize
timeout /t 5 /nobreak > nul

REM Start frontend in new window
echo [2/2] Starting frontend server...
start "CRM Frontend Server" cmd /k "cd /d "%~dp0" && npm run dev"

echo.
echo ============================================
echo [OK] Application Started Successfully!
echo ============================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Two separate windows have been opened:
echo   - CRM Backend Server
echo   - CRM Frontend Server
echo.
echo Close those windows to stop the application.
echo.
echo This window can be closed safely.
echo.
timeout /t 5

exit
