# Career Intelligence Platform - Development Startup Script
# Run this script from the project root to start both frontend and backend

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  Career Intelligence Platform - Dev Mode   " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Get the script directory (project root)
$projectRoot = $PSScriptRoot

# Check if we're in the right directory
if (-not (Test-Path "$projectRoot/backend/main.py")) {
    Write-Host "ERROR: Cannot find backend/main.py. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "$projectRoot/frontend/package.json")) {
    Write-Host "ERROR: Cannot find frontend/package.json. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

# Check for .env file
if (-not (Test-Path "$projectRoot/backend/.env")) {
    Write-Host "WARNING: backend/.env file not found!" -ForegroundColor Yellow
    Write-Host "Please create backend/.env with your GOOGLE_API_KEY" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "[1/2] Starting Backend (FastAPI on port 8000)..." -ForegroundColor Green

# Start backend in a new PowerShell window
$backendCommand = @"
Set-Location '$projectRoot'
Write-Host 'Backend Server Starting...' -ForegroundColor Green
Write-Host 'API Docs: http://localhost:8000/docs' -ForegroundColor Cyan
Write-Host ''
python -m uvicorn backend.main:app --reload --port 8000
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCommand

# Wait a moment for backend to start
Write-Host "   Waiting for backend to initialize..." -ForegroundColor Gray
Start-Sleep -Seconds 3

Write-Host "[2/2] Starting Frontend (Next.js on port 3000)..." -ForegroundColor Green

# Start frontend in a new PowerShell window
$frontendCommand = @"
Set-Location '$projectRoot/frontend'
Write-Host 'Frontend Server Starting...' -ForegroundColor Green
Write-Host 'App URL: http://localhost:3000' -ForegroundColor Cyan
Write-Host ''
npm run dev
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCommand

Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "  Both services are starting!               " -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "  API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "  TIP: Wait ~5 seconds for both services to fully start" -ForegroundColor Yellow
Write-Host ""
