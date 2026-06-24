# Push FoodOrder App to a new GitHub repository
# Run: powershell -ExecutionPolicy Bypass -File .\scripts\push-to-github.ps1

param(
    [string]$RepoName = "food-order-app",
    [ValidateSet("public", "private")]
    [string]$Visibility = "private"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

Set-Location $Root

Write-Host "=== FoodOrder App - Git Push ===" -ForegroundColor Cyan

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: git is not installed." -ForegroundColor Red
    exit 1
}

# Safety: never commit secret env files
$trackedEnv = git ls-files 2>$null | Where-Object { $_ -match '\.env$' -and $_ -notmatch '\.example$' }
if ($trackedEnv) {
    Write-Host "ERROR: Secret .env files are tracked. Remove them first:" -ForegroundColor Red
    $trackedEnv | ForEach-Object { Write-Host "  $_" }
    exit 1
}

if (-not (Test-Path ".git")) {
    git init
    Write-Host "Initialized git repository." -ForegroundColor Green
}

git add .
git status --short

$hasChanges = git status --porcelain
if ($hasChanges) {
    git commit -m @"
Initial commit: FoodOrder full-stack prototype

- React + Vite frontend with i18n (EN/AR)
- Node.js + Express + MongoDB backend
- JWT auth, Stripe payments, admin dashboard
- Unit and feature tests (Vitest)
"@
    Write-Host "Created commit." -ForegroundColor Green
} else {
    Write-Host "Nothing new to commit." -ForegroundColor Yellow
}

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host ""
    Write-Host "GitHub CLI (gh) not found. Create a repo manually:" -ForegroundColor Yellow
    Write-Host "  1. https://github.com/new -> name: $RepoName"
    Write-Host "  2. git remote add origin https://github.com/YOUR_USERNAME/$RepoName.git"
    Write-Host "  3. git branch -M main"
    Write-Host "  4. git push -u origin main"
    exit 0
}

gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Run: gh auth login" -ForegroundColor Yellow
    exit 1
}

$existingRemote = git remote get-url origin 2>$null
if (-not $existingRemote) {
    gh repo create $RepoName --$Visibility --source=. --remote=origin --push
    Write-Host ""
    Write-Host "Done! Repository created and pushed." -ForegroundColor Green
} else {
    git branch -M main 2>$null
    git push -u origin main
    Write-Host ""
    Write-Host "Pushed to: $existingRemote" -ForegroundColor Green
}

Write-Host ""
Write-Host "IMPORTANT: .env files with Stripe keys were NOT committed (in .gitignore)." -ForegroundColor Cyan
