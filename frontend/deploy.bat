@echo off
REM ==============================================
REM Firebase Hosting Deployment Script for Frontend
REM ==============================================
REM 
REM Prerequisites:
REM   1. Install Node.js and npm
REM   2. Install Firebase CLI: npm install -g firebase-tools
REM   3. Login to Firebase: firebase login
REM   4. Backend must be deployed first!
REM
REM Usage:
REM   deploy.bat YOUR_PROJECT_ID
REM
REM Example:
REM   deploy.bat triage-system-prod
REM ==============================================

setlocal enabledelayedexpansion

set PROJECT_ID=%1

if "%PROJECT_ID%"=="" (
    echo ERROR: Please provide your Google Cloud/Firebase Project ID
    echo Usage: deploy.bat YOUR_PROJECT_ID
    exit /b 1
)

echo ==========================================
echo Deploying Frontend to Firebase Hosting
echo ==========================================
echo Project: %PROJECT_ID%
echo ==========================================

REM Step 1: Update .firebaserc with project ID
echo.
echo [1/4] Configuring Firebase project...
echo { > .firebaserc
echo   "projects": { >> .firebaserc
echo     "default": "%PROJECT_ID%" >> .firebaserc
echo   } >> .firebaserc
echo } >> .firebaserc

REM Step 2: Install dependencies
echo.
echo [2/4] Installing dependencies...
call npm install
if errorlevel 1 goto :error

REM Step 3: Build production bundle
echo.
echo [3/4] Building production bundle...
call npm run build
if errorlevel 1 goto :error

REM Step 4: Deploy to Firebase
echo.
echo [4/4] Deploying to Firebase Hosting...
call firebase deploy --only hosting --project %PROJECT_ID%
if errorlevel 1 goto :error

echo.
echo ==========================================
echo Deployment Complete!
echo ==========================================
echo.
echo Your app is live at:
echo   https://%PROJECT_ID%.web.app
echo   https://%PROJECT_ID%.firebaseapp.com
echo.
echo To add a custom domain:
echo   1. Go to Firebase Console ^> Hosting
echo   2. Click "Add Custom Domain"
echo   3. Follow the DNS configuration steps
echo.
goto :eof

:error
echo.
echo ERROR: Deployment failed!
exit /b 1
