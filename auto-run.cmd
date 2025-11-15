@echo off
REM ============================================
REM Quick Launch Script for CRM Application
REM ============================================

title CRM Business Predictor

cd /d "%~dp0"

REM Quick check for dependencies
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

if not exist "backend\venv" (
    echo Setting up backend...
    call install.bat
)

REM Start servers
echo Starting CRM Business Predictor...
start "Backend" cmd /k "cd /d "%~dp0backend" && venv\Scripts\activate.bat && python app.py"
timeout /t 3 /nobreak > nul
start "Frontend" cmd /k "cd /d "%~dp0" && npm run dev"

echo.
echo Application started!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
timeout /t 3
exit
