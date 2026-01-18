# Production Deployment Guide

This guide walks you through deploying the Triage System to Google Cloud.

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   User Browser  │────▶│  Firebase Host   │────▶│   Cloud Run     │
│                 │     │  (React App)     │     │  (C++ Backend)  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                              │                         │
                              │  /api/* rewrite         │
                              └─────────────────────────┘
```

## Prerequisites

### 1. Google Cloud Account
- Create account at [Google Cloud Console](https://console.cloud.google.com)
- Create a new project (e.g., `triage-system-prod`)
- **Note your Project ID** (e.g., `triage-system-prod-8392`)
- Enable billing (required even for free tier)

### 2. Install CLI Tools

**Google Cloud SDK:**
```bash
# Download from: https://cloud.google.com/sdk/docs/install
# After installation:
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

**Firebase CLI:**
```bash
npm install -g firebase-tools
firebase login
```

### 3. Gmail App Password (for email notifications)
Follow the instructions in [Backend/GMAIL_SETUP.md](Backend/GMAIL_SETUP.md)

---

## Quick Deploy (Recommended)

From the project root, run:

```cmd
deploy-all.bat YOUR_PROJECT_ID us-central1
```

This will:
1. Enable required Google Cloud APIs
2. Create Artifact Registry repository
3. Build and deploy C++ backend to Cloud Run
4. Build and deploy React frontend to Firebase Hosting

---

## Manual Deployment

### Phase 1: Deploy Backend to Cloud Run

```bash
cd Backend

# 1. Enable APIs
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com

# 2. Create Artifact Registry
gcloud artifacts repositories create backend-repo \
    --repository-format=docker \
    --location=us-central1 \
    --description="Docker repository for C++ Backend"

# 3. Build in Cloud Build (no local Docker needed)
gcloud builds submit --tag us-central1-docker.pkg.dev/YOUR_PROJECT_ID/backend-repo/triage-backend

# 4. Deploy to Cloud Run
gcloud run deploy triage-backend-service \
    --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/backend-repo/triage-backend \
    --region us-central1 \
    --allow-unauthenticated \
    --port 8080

# 5. Configure email (after getting Gmail App Password)
gcloud run services update triage-backend-service \
    --set-env-vars GMAIL_USER=jackchambers5uni@gmail.com \
    --set-env-vars GMAIL_APP_PASSWORD=your-16-char-app-password \
    --region us-central1
```

### Phase 2: Deploy Frontend to Firebase

```bash
cd frontend

# 1. Update .firebaserc with your project ID
# Edit .firebaserc and replace YOUR_PROJECT_ID

# 2. Build production bundle
npm run build

# 3. Deploy
firebase deploy --only hosting
```

---

## Post-Deployment

### Verify Deployment

**Backend:**
```bash
curl https://triage-backend-service-XXXX.a.run.app/api/queue
```

**Frontend:**
- Visit `https://YOUR_PROJECT_ID.web.app`
- Test patient intake form
- Check staff dashboard

### Custom Domain Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project → Hosting → Add Custom Domain
3. Enter your domain (e.g., `app.jacksonchambers.com`)
4. Add the DNS records to your domain registrar:
   - TXT record for verification
   - A records for the domain
5. Wait for SSL certificate (up to 24 hours)

---

## Environment Variables

### Cloud Run (Backend)
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port (auto-set by Cloud Run) | `8080` |
| `GMAIL_USER` | Gmail address for notifications | `jackchambers5uni@gmail.com` |
| `GMAIL_APP_PASSWORD` | Gmail App Password (16 chars) | `abcdefghijklmnop` |

### Firebase (Frontend)
| Variable | Description | Value |
|----------|-------------|-------|
| `REACT_APP_API_URL` | API base URL | Empty (uses Firebase rewrites) |

---

## Troubleshooting

### Backend not responding
```bash
# Check Cloud Run logs
gcloud run services logs read triage-backend-service --region us-central1
```

### Frontend can't reach backend
- Verify `firebase.json` has correct `serviceId`: `triage-backend-service`
- Verify Cloud Run service is in `us-central1` region
- Check if `--allow-unauthenticated` was used during deployment

### Email not sending
- Verify GMAIL_APP_PASSWORD is set (no spaces)
- Check Cloud Run logs for curl errors
- Ensure 2-Step Verification is enabled on Gmail

### Build failures
```bash
# View Cloud Build logs
gcloud builds list --limit=5
gcloud builds log BUILD_ID
```

---

## Costs

**Cloud Run:**
- Free tier: 2 million requests/month, 360,000 GB-seconds
- Typical small app: ~$0-5/month

**Firebase Hosting:**
- Free tier: 10GB storage, 360MB/day transfer
- Typical small app: Free

**Artifact Registry:**
- Free tier: 0.5GB storage
- Typical: ~$0.10/GB/month

---

## Security Checklist

- [x] Email credentials stored as environment variables (not in code)
- [x] CORS configured for specific origins
- [x] HTTPS enforced (automatic with Cloud Run + Firebase)
- [x] App Password used instead of Gmail password
- [ ] Consider adding authentication for staff dashboard
- [ ] Set up Cloud Run IAM for production
