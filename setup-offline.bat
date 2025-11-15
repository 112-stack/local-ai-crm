@echo off
REM Setup script for offline mode - Downloads all required AI models
REM This is the ONLY step that requires internet connection

echo ========================================
echo  CRM Business Predictor
echo  Offline Model Setup
echo ========================================
echo.
echo This script will download all required AI models
echo for offline operation. This is the ONLY step that
echo requires an internet connection.
echo.
echo Model download size: ~3-5 GB
echo Time required: 10-30 minutes (depending on internet speed)
echo.
pause

cd backend

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo Starting model download...
echo.

REM Run the offline setup script
python setup_offline.py --profile gpu-optimized

if errorlevel 1 (
    echo.
    echo ========================================
    echo  Setup Failed
    echo ========================================
    echo.
    echo Please check the error messages above.
    echo Common issues:
    echo   - No internet connection
    echo   - Insufficient disk space
    echo   - Missing dependencies
    echo.
    pause
    exit /b 1
)

cd ..

echo.
echo ========================================
echo  Offline Setup Complete!
echo ========================================
echo.
echo All models have been downloaded.
echo You can now run the application OFFLINE!
echo.
echo To start: start-app.bat
echo.
pause
