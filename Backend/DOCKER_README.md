# Backend Docker Deployment Guide

This guide explains how to build and deploy the C++ triage backend to Google Cloud Run.

## Architecture

The backend uses:
- **Crow** - C++ web framework (included in `/crow/`)
- **ASIO** - Standalone networking library (included in `/asio/`)
- **nlohmann/json** - JSON parsing (included in `/crow/json.hpp`)

## Local Development

### Build Locally (without Docker)
```bash
cd Backend
mkdir build && cd build
cmake ..
make
./server
```

### Build with Docker
```bash
cd Backend
docker build -t triage-backend .
docker run -p 8080:8080 triage-backend
```

Test the API:
```bash
curl http://localhost:8080/api/queue
```

## Cloud Run Deployment

### Prerequisites

1. **Install Google Cloud SDK**: https://cloud.google.com/sdk/docs/install
2. **Authenticate**:
   ```bash
   gcloud auth login
   ```
3. **Set your project**:
   ```bash
   gcloud config set project YOUR_PROJECT_ID
   ```

### Deploy Using the Script

**Windows:**
```cmd
cd Backend
deploy.bat YOUR_PROJECT_ID us-central1
```

**Linux/Mac:**
```bash
cd Backend
chmod +x deploy.sh
./deploy.sh YOUR_PROJECT_ID us-central1
```

### Deploy Manually

1. **Enable required services** (one-time):
   ```bash
   gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com
   ```

2. **Build the container**:
   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/triage-backend
   ```

3. **Deploy to Cloud Run**:
   ```bash
   gcloud run deploy triage-backend \
     --image gcr.io/YOUR_PROJECT_ID/triage-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/intake` | Register a new patient |
| GET | `/api/queue` | Get all patients in queue |
| GET | `/api/next_patient` | Get next patient to be seen |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port (set by Cloud Run) | `8080` |

## Multi-Stage Docker Build

The Dockerfile uses a multi-stage build to minimize the final image size:

1. **Stage 1 (Builder)**: Uses Ubuntu 22.04 with build tools to compile the C++ code
2. **Stage 2 (Runtime)**: Uses minimal Ubuntu 22.04 with only runtime libraries

This keeps the final container small (~50MB) instead of including all build tools (~1GB+).

## Troubleshooting

### Container fails health check
- Ensure the app reads `PORT` from environment variable
- Ensure the app binds to `0.0.0.0`, not `localhost`

### Build fails with missing headers
- All dependencies (Crow, ASIO) are included in the repo
- No external packages are needed

### sample_data.txt not found
- The Dockerfile copies `sample_data.txt` to the container
- Run the server from the directory containing `sample_data.txt`
