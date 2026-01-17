@echo off
title AEC 2026 Triage System Launcher
echo ==========================================
echo   AEC 2026 Triage Application Launcher
echo ==========================================

echo.
echo [1/2] Starting C++ Backend Server...
if exist "Backend\server.exe" (
    start "Triage Backend Server" /D "Backend" "server.exe"
    echo    Backend started in a new window.
) else (
    echo    ERROR: Backend executable not found at Backend\server.exe
    echo    Please compile the backend first using:
    echo    cd Backend ^& g++ -std=c++17 -I. main.cpp -o server.exe -lws2_32 -lwsock32
    pause
    exit /b
)

echo.
echo [2/2] Starting React Frontend...
if exist "frontend\package.json" (
    cd frontend
    echo    Starting development server...
    npm start
) else (
    echo    ERROR: Frontend directory not found.
    pause
    exit /b
)
