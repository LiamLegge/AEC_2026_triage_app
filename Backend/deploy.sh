#!/bin/bash
# ==============================================
# Cloud Run Deployment Script for Triage Backend
# ==============================================
# 
# Prerequisites:
#   1. Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install
#   2. Authenticate: gcloud auth login
#   3. Set your project: gcloud config set project YOUR_PROJECT_ID
#
# Usage:
#   ./deploy.sh YOUR_PROJECT_ID [REGION]
#
# Example:
#   ./deploy.sh my-gcp-project us-central1
# ==============================================

set -e  # Exit on error

# Configuration
PROJECT_ID=${1:-"YOUR_PROJECT_ID"}
REGION=${2:-"us-central1"}
SERVICE_NAME="triage-backend"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Validate project ID
if [ "$PROJECT_ID" == "YOUR_PROJECT_ID" ]; then
    echo "ERROR: Please provide your Google Cloud Project ID"
    echo "Usage: ./deploy.sh YOUR_PROJECT_ID [REGION]"
    exit 1
fi

echo "=========================================="
echo "Deploying Triage Backend to Cloud Run"
echo "=========================================="
echo "Project:  $PROJECT_ID"
echo "Region:   $REGION"
echo "Service:  $SERVICE_NAME"
echo "Image:    $IMAGE_NAME"
echo "=========================================="

# Step 1: Enable required APIs (one-time setup)
echo ""
echo "[1/3] Enabling required Google Cloud services..."
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com --project=$PROJECT_ID

# Step 2: Build the container image
echo ""
echo "[2/3] Building container image..."
gcloud builds submit --tag $IMAGE_NAME --project=$PROJECT_ID

# Step 3: Deploy to Cloud Run
echo ""
echo "[3/3] Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --project=$PROJECT_ID

echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "Your service URL will be displayed above."
echo ""
echo "Next steps:"
echo "  1. Copy the service URL"
echo "  2. Update your firebase.json rewrites to point to this URL"
echo "  3. Test with: curl YOUR_SERVICE_URL/api/queue"
echo ""
