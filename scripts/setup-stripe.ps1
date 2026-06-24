# Stripe test keys setup for FoodOrder App
# Run: powershell -ExecutionPolicy Bypass -File .\scripts\setup-stripe.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$BackendEnv = Join-Path $Root "backend\.env"
$FrontendEnv = Join-Path $Root "frontend\.env"

Write-Host ""
Write-Host "=== Stripe Test Keys Setup ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Open https://dashboard.stripe.com/test/apikeys"
Write-Host "2. Copy your TEST keys (they start with sk_test_ and pk_test_)"
Write-Host ""

$secretKey = Read-Host "Paste Secret key (sk_test_...)"
$publishableKey = Read-Host "Paste Publishable key (pk_test_...)"

if (-not $secretKey.StartsWith("sk_test_")) {
  Write-Host "ERROR: Secret key must start with sk_test_" -ForegroundColor Red
  exit 1
}

if (-not $publishableKey.StartsWith("pk_test_")) {
  Write-Host "ERROR: Publishable key must start with pk_test_" -ForegroundColor Red
  exit 1
}

function Set-EnvValue($filePath, $key, $value) {
  $lines = @()
  if (Test-Path $filePath) {
    $lines = Get-Content $filePath
  }

  $found = $false
  $updated = foreach ($line in $lines) {
    if ($line -match "^$key=") {
      $found = $true
      "$key=$value"
    } else {
      $line
    }
  }

  if (-not $found) {
    $updated += "$key=$value"
  }

  $updated | Set-Content $filePath -Encoding UTF8
}

Set-EnvValue $BackendEnv "STRIPE_SECRET_KEY" $secretKey
Set-EnvValue $BackendEnv "STRIPE_PUBLISHABLE_KEY" $publishableKey
Set-EnvValue $FrontendEnv "VITE_STRIPE_PUBLISHABLE_KEY" $publishableKey

Write-Host ""
Write-Host "Done! Keys saved to:" -ForegroundColor Green
Write-Host "  backend\.env  -> STRIPE_SECRET_KEY"
Write-Host "  frontend\.env -> VITE_STRIPE_PUBLISHABLE_KEY"
Write-Host ""
Write-Host "Restart BOTH servers:" -ForegroundColor Yellow
Write-Host "  cd backend  && npm run dev"
Write-Host "  cd frontend && npm run dev"
Write-Host ""
Write-Host "Test card: 4242 4242 4242 4242 | Any future expiry | Any CVC | Any ZIP"
Write-Host ""
