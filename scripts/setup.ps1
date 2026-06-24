# FoodOrder App - Windows setup script
# Run in PowerShell:  .\scripts\setup.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Log = Join-Path $Root "setup.log"

function Log($msg) {
    $line = "[$(Get-Date -Format 'HH:mm:ss')] $msg"
    Write-Host $line
    Add-Content -Path $Log -Value $line
}

"" | Set-Content $Log
Log "=== FoodOrder Setup ==="

# 1. Check Node
try {
    $nodeVer = node -v
    $npmVer = npm -v
    Log "Node: $nodeVer | npm: $npmVer"
} catch {
    Log "ERROR: Node.js not found. Install from https://nodejs.org"
    exit 1
}

# 2. Start MongoDB service if installed
$mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
if ($mongoService) {
    Log "MongoDB service status: $($mongoService.Status)"
    if ($mongoService.Status -ne "Running") {
        Log "Starting MongoDB service..."
        Start-Service -Name "MongoDB"
        Log "MongoDB started."
    }
} else {
    Log "WARNING: MongoDB Windows service not found."
    Log "If you installed MongoDB manually, start mongod or check Services (services.msc)."
}

# 3. Backend env
$backendEnv = Join-Path $Root "backend\.env"
if (-not (Test-Path $backendEnv)) {
    Copy-Item (Join-Path $Root "backend\.env.example") $backendEnv
    Log "Created backend/.env from .env.example"
}

# 4. Frontend env
$frontendEnv = Join-Path $Root "frontend\.env"
if (-not (Test-Path $frontendEnv)) {
    Copy-Item (Join-Path $Root "frontend\.env.example") $frontendEnv
    Log "Created frontend/.env from .env.example"
}

# 5. Install backend
Log "Installing backend dependencies..."
Push-Location (Join-Path $Root "backend")
npm install 2>&1 | ForEach-Object { Log $_ }
if ($LASTEXITCODE -ne 0) { Pop-Location; exit 1 }

# 6. Seed database
Log "Seeding database..."
npm run seed 2>&1 | ForEach-Object { Log $_ }
if ($LASTEXITCODE -ne 0) {
    Log "ERROR: Seed failed. Is MongoDB running on mongodb://127.0.0.1:27017 ?"
    Pop-Location
    exit 1
}
Pop-Location

# 7. Install frontend
Log "Installing frontend dependencies..."
Push-Location (Join-Path $Root "frontend")
npm install 2>&1 | ForEach-Object { Log $_ }
if ($LASTEXITCODE -ne 0) { Pop-Location; exit 1 }
Pop-Location

Log "=== Setup complete! ==="
Log ""
Log "Next steps:"
Log "  Terminal 1: cd backend  && npm run dev"
Log "  Terminal 2: cd frontend && npm run dev"
Log "  Open: http://localhost:5173"
Log "  Admin: admin@foodorder.com / admin123"
