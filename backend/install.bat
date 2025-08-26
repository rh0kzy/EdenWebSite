@echo off
echo.
echo ========================================
echo   EDEN PARFUM BACKEND SETUP
echo ========================================
echo.

echo [1/4] Installing Node.js dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [2/4] Checking environment configuration...
if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env > nul 2>&1
    echo Please edit .env file with your configurations
) else (
    echo .env file already exists
)

echo.
echo [3/4] Creating logs directory...
if not exist logs mkdir logs

echo.
echo [4/4] Running health check...
echo Starting server for health check...
start /B node server.js
timeout /t 3 > nul
curl -s http://localhost:3000/api/health > nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Backend server is working correctly
) else (
    echo ⚠ Health check failed - please check configuration
)

echo.
echo ========================================
echo   SETUP COMPLETE!
echo ========================================
echo.
echo Backend is ready to use. Available commands:
echo   npm start     - Start production server
echo   npm run dev   - Start development server
echo.
echo API will be available at: http://localhost:3000/api
echo Frontend will be served at: http://localhost:3000
echo.
echo Press any key to exit...
pause > nul
