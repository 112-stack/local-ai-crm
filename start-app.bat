@echo off
REM Startup script for CRM Business Predictor (Windows)
REM Runs both frontend and backend servers

echo ========================================
echo  CRM Business Predictor
echo  Starting Application (Offline Mode)
echo ========================================
echo.

REM Check if models are downloaded
if not exist "backend\models\manifest.json" (
    echo WARNING: AI models not found!
    echo Please run setup-offline.bat first to download models.
    echo.
    pause
    exit /b 1
)

REM Start backend in new window
echo Starting backend server...
start "CRM Backend Server" cmd /k "cd backend && venv\Scripts\activate && python app.py"

REM Wait for backend to start
echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

REM Start frontend
echo Starting frontend development server...
echo.
echo ========================================
echo  Application Starting
echo ========================================
echo.
echo  Frontend: http://localhost:5173
echo  Backend:  http://localhost:8000
echo.
echo  Press Ctrl+C to stop the frontend
echo  Close the backend window to stop the backend
echo ========================================
echo.

npm run dev
