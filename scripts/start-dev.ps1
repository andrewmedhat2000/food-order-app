# Start backend + frontend dev servers
$Root = Split-Path -Parent $PSScriptRoot

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Root\backend'; npm run dev"
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Root\frontend'; npm run dev"
Write-Host "Backend:  http://localhost:5001"
Write-Host "Frontend: http://localhost:5173"
