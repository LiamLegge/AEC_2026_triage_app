@echo off
REM ==============================================
REM Cloud Run Deployment Script for Triage Backend
REM ==============================================
REM 
REM Prerequisites:
REM   1. Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install
REM   2. Authenticate: gcloud auth login
REM   3. Set your project: gcloud config set project YOUR_PROJECT_ID
REM   4. Create Gmail App Password (see GMAIL_SETUP.md)
REM
REM Usage:
REM   deploy.bat YOUR_PROJECT_ID [REGION]
REM
REM Example:
REM   deploy.bat triage-system-prod us-central1
REM ==============================================

setlocal enabledelayedexpansion

REM Configuration
set PROJECT_ID=%1
set REGION=%2
set SERVICE_NAME=triage-backend-service
set REPO_NAME=backend-repo

if "%PROJECT_ID%"=="" (
    echo ERROR: Please provide your Google Cloud Project ID
    echo Usage: deploy.bat YOUR_PROJECT_ID [REGION]
    exit /b 1
)

if "%REGION%"=="" set REGION=us-central1

set IMAGE_NAME=%REGION%-docker.pkg.dev/%PROJECT_ID%/%REPO_NAME%/triage-backend

echo ==========================================
echo Deploying Triage Backend to Cloud Run
echo ==========================================
echo Project:  %PROJECT_ID%
echo Region:   %REGION%
echo Service:  %SERVICE_NAME%
echo Image:    %IMAGE_NAME%
echo ==========================================

REM Step 1: Enable required APIs
echo.
echo [1/5] Enabling required Google Cloud services...
call gcloud services enable ^
    run.googleapis.com ^
    artifactregistry.googleapis.com ^
    cloudbuild.googleapis.com ^
    --project=%PROJECT_ID%
if errorlevel 1 goto :error

REM Step 2: Create Artifact Registry repository (if not exists)
echo.
echo [2/5] Creating Artifact Registry repository...
call gcloud artifacts repositories create %REPO_NAME% ^
    --repository-format=docker ^
    --location=%REGION% ^
    --description="Docker repository for C++ Backend" ^
    --project=%PROJECT_ID% 2>nul
REM Ignore error if repo already exists

REM Step 3: Build the container image in the cloud
echo.
echo [3/5] Building container image in Cloud Build...
call gcloud builds submit --tag %IMAGE_NAME% --project=%PROJECT_ID%
if errorlevel 1 goto :error

REM Step 4: Deploy to Cloud Run
echo.
echo [4/5] Deploying to Cloud Run...
call gcloud run deploy %SERVICE_NAME% ^
    --image %IMAGE_NAME% ^
    --platform managed ^
    --region %REGION% ^
    --allow-unauthenticated ^
    --port 8080 ^
    --project=%PROJECT_ID%
if errorlevel 1 goto :error

REM Step 5: Get the service URL
echo.
echo [5/5] Getting service URL...
for /f "tokens=*" %%i in ('gcloud run services describe %SERVICE_NAME% --region=%REGION% --project=%PROJECT_ID% --format="value(status.url)"') do set SERVICE_URL=%%i

echo.
echo ==========================================
echo Deployment Complete!
echo ==========================================
echo.
echo Service URL: %SERVICE_URL%
echo.
echo IMPORTANT: Set email environment variables:
echo   gcloud run services update %SERVICE_NAME% ^
echo     --set-env-vars GMAIL_USER=jackchambers5uni@gmail.com ^
echo     --set-env-vars GMAIL_APP_PASSWORD=your-app-password ^
echo     --region %REGION% --project %PROJECT_ID%
echo.
echo Next steps:
echo   1. Set up Gmail App Password (see GMAIL_SETUP.md)
echo   2. Update frontend/.firebaserc with project ID
echo   3. Deploy frontend: cd frontend ^&^& npm run build ^&^& firebase deploy
echo.
goto :eof

:error
echo.
echo ERROR: Deployment failed!
exit /b 1
