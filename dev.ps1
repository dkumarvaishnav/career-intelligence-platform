Write-Host "Starting Career Intelligence Platform Development Environment..."
Write-Host "launching Backend (FastAPI)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $PSScriptRoot/backend; ../venv/Scripts/Activate.ps1; uvicorn main:app --reload --port 8000"

Write-Host "Launching Frontend (Next.js)..."
Set-Location frontend
npm run dev
