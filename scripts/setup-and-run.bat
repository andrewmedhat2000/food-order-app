@echo off
setlocal
cd /d "%~dp0.."
echo Running FoodOrder setup...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup.ps1"
if errorlevel 1 (
  echo Setup failed. Check setup.log
  pause
  exit /b 1
)
echo.
echo Setup done! Press any key to start backend and frontend...
pause >nul
start "FoodOrder Backend" cmd /k "cd /d %~dp0..\backend && npm run dev"
timeout /t 3 /nobreak >nul
start "FoodOrder Frontend" cmd /k "cd /d %~dp0..\frontend && npm run dev"
echo Servers starting in new windows. Open http://localhost:5173
pause
