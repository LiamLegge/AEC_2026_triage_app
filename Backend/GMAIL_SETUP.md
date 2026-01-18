# Gmail App Password Setup Guide

To send emails from the triage system using your Gmail account (`triage.2026.aec@gmail.com`), you need to create an **App Password**. Regular Gmail passwords won't work with SMTP due to Google's security policies.

## Step 1: Enable 2-Step Verification

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Sign in with `triage.2026.aec@gmail.com`
3. Under "How you sign in to Google", click **2-Step Verification**
4. Follow the prompts to enable it (you'll need your phone)

## Step 2: Create an App Password

1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Direct link: https://myaccount.google.com/apppasswords
2. Sign in if prompted
3. Under "Select app", choose **Other (Custom name)**
4. Enter: `Triage System`
5. Click **Generate**
6. **COPY THE 16-CHARACTER PASSWORD** (e.g., `abcd efgh ijkl mnop`)
   - Remove spaces when using it: `abcdefghijklmnop`
   - You won't be able to see this password again!

## Step 3: Configure Cloud Run

After deploying your backend, set the environment variables:

```bash
gcloud run services update triage-backend-service \
    --set-env-vars GMAIL_USER=triage.2026.aec@gmail.com \
    --set-env-vars GMAIL_APP_PASSWORD=your-16-char-app-password \
    --region us-central1 \
    --project gen-lang-client-0109905323
```

Replace `your-16-char-app-password` with your actual 16-character app password (no spaces).

## Step 4: Test Email Sending

The system automatically sends emails when a patient's triage level is updated due to wait time. To test:

1. Submit a patient with a valid email address
2. Wait for the triage update cycle (25 minutes by default)
3. Or manually trigger by calling the API

## Security Notes

- **NEVER** commit the App Password to version control
- App Passwords can be revoked at any time from Google Account settings
- If compromised, revoke immediately and generate a new one
- The password is stored securely as a Cloud Run environment variable

## Troubleshooting

### "Email not sent: GMAIL_APP_PASSWORD not configured"
- The environment variable isn't set in Cloud Run
- Run the `gcloud run services update` command above

### "Email send failed: Authentication failure"
- App Password is incorrect (check for extra spaces)
- 2-Step Verification might be disabled
- Regenerate the App Password

### "Email send failed: Connection refused"
- Check if libcurl is properly installed in the Docker container
- Verify Gmail SMTP is accessible (smtp.gmail.com:465)

## Local Development

For local testing, set environment variables before running the server:

**Windows (PowerShell):**
```powershell
$env:GMAIL_USER = "jackchambers5uni@gmail.com"
$env:GMAIL_APP_PASSWORD = "your-app-password"
./server.exe
```

**Linux/Mac:**
```bash
export GMAIL_USER="jackchambers5uni@gmail.com"
export GMAIL_APP_PASSWORD="your-app-password"
./server
```

**Docker:**
```bash
docker run -p 8080:8080 \
    -e PORT=8080 \
    -e GMAIL_USER=jackchambers5uni@gmail.com \
    -e GMAIL_APP_PASSWORD=your-app-password \
    test-backend
```
