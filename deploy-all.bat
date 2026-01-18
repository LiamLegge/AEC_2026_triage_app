@echo off
REM ==============================================
REM Full Stack Deployment Script
REM ==============================================
REM 
REM This script deploys both the C++ backend to Cloud Run
REM and the React frontend to Firebase Hosting.
REM
REM Prerequisites:
REM   1. Google Cloud SDK installed and authenticated
REM   2. Firebase CLI installed and authenticated
REM   3. Node.js and npm installed
REM   4. Gmail App Password configured (see Backend/GMAIL_SETUP.md)
REM
REM Usage:
REM   deploy-all.bat YOUR_PROJECT_ID [REGION]
REM
REM Example:
REM   deploy-all.bat triage-system-prod us-central1
REM ==============================================

setlocal enabledelayedexpansion

set PROJECT_ID=%1
set REGION=%2

if "%PROJECT_ID%"=="" (
    echo ERROR: Please provide your Google Cloud Project ID
    echo Usage: deploy-all.bat YOUR_PROJECT_ID [REGION]
    exit /b 1
)

if "%REGION%"=="" set REGION=us-central1

echo.
echo ============================================================
echo           FULL STACK DEPLOYMENT
echo ============================================================
echo Project ID: %PROJECT_ID%
echo Region:     %REGION%
echo ============================================================
echo.
echo This will deploy:
echo   1. C++ Backend to Google Cloud Run
echo   2. React Frontend to Firebase Hosting
echo.
echo Press Ctrl+C to cancel, or
pause

REM ============================================================
REM PHASE 1: Deploy Backend
REM ============================================================
echo.
echo ============================================================
echo PHASE 1: Deploying Backend to Cloud Run
echo ============================================================

cd Backend
call deploy.bat %PROJECT_ID% %REGION%
if errorlevel 1 (
    echo Backend deployment failed!
    cd ..
    exit /b 1
)
cd ..

REM Get backend URL for verification
for /f "tokens=*" %%i in ('gcloud run services describe triage-backend-service --region=%REGION% --project=%PROJECT_ID% --format="value(status.url)"') do set BACKEND_URL=%%i

echo.
echo Backend deployed at: %BACKEND_URL%
echo Testing backend health...
curl -s "%BACKEND_URL%/api/queue" > nul
if errorlevel 1 (
    echo WARNING: Backend health check failed. Continuing anyway...
) else (
    echo Backend is healthy!
)

REM ============================================================
REM PHASE 2: Deploy Frontend
REM ============================================================
echo.
echo ============================================================
echo PHASE 2: Deploying Frontend to Firebase Hosting
echo ============================================================

cd frontend
call deploy.bat %PROJECT_ID%
if errorlevel 1 (
    echo Frontend deployment failed!
    cd ..
    exit /b 1
)
cd ..

echo.
echo ============================================================
echo           DEPLOYMENT COMPLETE!
echo ============================================================
echo.
echo Your application is now live:
echo.
echo   Frontend (Firebase):
echo     https://%PROJECT_ID%.web.app
echo     https://%PROJECT_ID%.firebaseapp.com
echo.
echo   Backend (Cloud Run):
echo     %BACKEND_URL%
echo.
echo IMPORTANT - Configure Email:
echo   gcloud run services update triage-backend-service ^
echo     --set-env-vars GMAIL_USER=jackchambers5uni@gmail.com ^
echo     --set-env-vars GMAIL_APP_PASSWORD=your-app-password ^
echo     --region %REGION% --project %PROJECT_ID%
echo.
echo Custom Domain Setup:
echo   1. Go to Firebase Console ^> Hosting ^> Add Custom Domain
echo   2. Follow DNS configuration instructions
echo.
echo ============================================================
