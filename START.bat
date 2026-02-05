@echo off
echo ============================================
echo   Career Intelligence Platform
echo   STABLE MODE (No Auto-Reload)
echo ============================================
echo.

cd /d "%~dp0"

echo [Step 1/4] Stopping existing services...

REM Kill processes on port 8000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000.*LISTENING" 2^>nul') do (
    echo   Stopping backend (PID: %%a)
    taskkill /PID %%a /F >nul 2>&1
)

REM Kill processes on port 3000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000.*LISTENING" 2^>nul') do (
    echo   Stopping frontend (PID: %%a)
    taskkill /PID %%a /F >nul 2>&1
)

timeout /t 2 >nul

echo [Step 2/4] Checking environment...

if not exist "backend\.env" (
    echo.
    echo ERROR: backend\.env file not found!
    echo.
    echo Please create backend\.env with:
    echo GOOGLE_API_KEY=your_api_key_here
    echo.
    pause
    exit /b 1
)

echo   Environment file found

echo [Step 3/4] Starting Backend (STABLE MODE - No Auto-Reload)...

REM Start backend WITHOUT --reload for stability
start "Backend Server" cmd /k "echo ============================================ && echo   BACKEND SERVER - STABLE MODE && echo ============================================ && echo. && echo Backend: http://localhost:8000 && echo Docs: http://localhost:8000/docs && echo. && echo NOTE: Running WITHOUT auto-reload for stability && echo To apply code changes, restart this window && echo. && python -m backend.main"

echo   Waiting for backend to start...
timeout /t 5 >nul

echo   Testing backend connection...
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% == 0 (
    echo   Backend is RUNNING!
) else (
    echo.
    echo WARNING: Backend didn't start properly!
    echo Check the Backend Server window for errors.
    echo.
    pause
    exit /b 1
)

echo [Step 4/4] Starting Frontend...

start "Frontend Server" cmd /k "cd frontend && echo ============================================ && echo   FRONTEND SERVER && echo ============================================ && echo. && echo Frontend: http://localhost:3000 && echo. && echo Compiling... && npm run dev"

echo.
echo ============================================
echo   ALL SERVICES STARTED!
echo ============================================
echo.
echo   Backend:  http://localhost:8000 (STABLE MODE)
echo   Frontend: http://localhost:3000
echo   API Docs: http://localhost:8000/docs
echo.
echo IMPORTANT:
echo   1. Wait 10 seconds for frontend to compile
echo   2. Open: http://localhost:3000
echo   3. Press Ctrl+Shift+R (hard refresh)
echo.
echo TESTING:
echo   - Upload a resume
echo   - Select target role
echo   - Click "Analyze My Readiness"
echo   - Wait 30-60 seconds for AI analysis
echo   - Try "Start New Analysis" multiple times
echo.
echo   Backend runs in STABLE MODE (no auto-reload)
echo   This prevents crashes between analyses!
echo.
pause
