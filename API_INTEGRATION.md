# API & Frontend/Backend Integration

This document explains how the React frontend communicates with the C++ backend, the API endpoints, and the data contract shared between them.

## Overview

- **Backend**: C++ (Crow) HTTP server running on port 8080.
- **Frontend**: React app using Axios to call backend endpoints.
- **Base URL**: `http://localhost:8080`
- **CORS**: Enabled for all origins and `GET`, `POST`, `OPTIONS` methods.

## Development Disclaimer

Most of the frontend code (everything except the sidebar and dark mode) was AI-assisted coding directed by Jackson Chambers.

## API Endpoints

### 1) Submit Patient Intake

**Endpoint**: `POST /api/intake`

**Purpose**: Add a new patient to the triage queue.

**Request body (JSON)**

```json
{
  "name": "Jane Doe",
  "age": 42,
  "birth_day": "1983-05-02",
  "health_card": "1234-567-890-PW",
  "chief_complaint": "Shortness of breath",
  "triage_level": 2,
  "accessibility_profile": "Visual Impairment",
  "preferred_mode": "Touch",
  "ui_setting": "High Contrast",
  "language": "English"
}
```

**Response (JSON)**

```json
{
  "status": "success",
  "queue_position": 3
}
```

**Notes**
- The backend assigns a unique `id` internally (`Patient_ID`).
- If `triage_level` is missing or invalid, the backend defaults it to 5 (non-urgent).
- If JSON is invalid, the backend returns HTTP 400 with `"Invalid JSON"`.

---

### 2) Get Patient Queue

**Endpoint**: `GET /api/queue`

**Purpose**: Retrieve the full triage queue ordered by priority (Level 1 to 5).

**Response (JSON array)**

```json
[
  {
    "id": 1051,
    "name": "Jane Doe",
    "age": 42,
    "birth_day": "1983-05-02",
    "health_card": "1234-567-890-PW",
    "chief_complaint": "Shortness of breath",
    "triage_level": 2,
    "accessibility_profile": "Visual Impairment",
    "preferred_mode": "Touch",
    "ui_setting": "High Contrast",
    "language": "English",
    "timestamp": 1768690902
  }
]
```

**Notes**
- The queue is returned from highest priority to lowest.
- `timestamp` is Unix epoch seconds when the patient record was created.

---

### 3) Get Next Patient

**Endpoint**: `GET /api/next_patient`

**Purpose**: Retrieve the next patient to be seen (highest priority).

**Response (JSON)**

```json
{
  "id": 1051,
  "name": "Jane Doe",
  "triage_level": 2
}
```

If there are no patients, an empty object is returned:

```json
{}
```

## Frontend Integration

### API Client

- The frontend API client is in [frontend/src/services/api.js](frontend/src/services/api.js).
- Axios is configured with `baseURL = http://localhost:8080` and `Content-Type: application/json`.
- Each API call updates an internal `isBackendAvailable` flag.

### Patient Intake Flow

1. User completes the intake form in the patient UI.
2. Form data is submitted to `POST /api/intake` via `submitPatientIntake`.
3. Backend validates and enqueues the patient into the appropriate triage queue.
4. The frontend shows success/failure messaging based on the response.

### Staff Dashboard Flow

1. The staff dashboard calls `GET /api/queue` on load.
2. It polls every 3 seconds for updates using `getPatientQueue`.
3. It shows connection status based on backend availability.

### Error Handling

- If the backend is unreachable, the API client throws an error with a message instructing the user to start the server on port 8080.
- The staff dashboard displays an error banner if the backend is disconnected.

## Data Contract Summary

**Patient object (frontend → backend)**

| Field | Type | Required | Notes |
|------|------|----------|------|
| `name` | string | Yes | Patient name |
| `age` | number | Yes | Derived from birth date in UI |
| `birth_day` | string | Optional | ISO format `YYYY-MM-DD` |
| `health_card` | string | Optional | Format `####-###-###-XX` |
| `chief_complaint` | string | Yes | Free text |
| `triage_level` | number | Optional | 1–5; defaults to 5 |
| `accessibility_profile` | string | Optional | e.g., `None`, `Low Vision` |
| `preferred_mode` | string | Optional | e.g., `Standard`, `Touch` |
| `ui_setting` | string | Optional | e.g., `High Contrast` |
| `language` | string | Optional | e.g., `English` |

**Patient object (backend → frontend)**

| Field | Type | Notes |
|------|------|------|
| `id` | number | Backend-assigned patient ID |
| `name` | string | Patient name |
| `age` | number | Age in years |
| `birth_day` | string | ISO date string |
| `health_card` | string | Health card identifier |
| `chief_complaint` | string | Chief complaint |
| `triage_level` | number | 1–5 |
| `accessibility_profile` | string | Accessibility needs |
| `preferred_mode` | string | Preferred interaction mode |
| `ui_setting` | string | UI accessibility setting |
| `language` | string | Preferred language |
| `timestamp` | number | Unix epoch seconds |

## Runtime Requirements

- **Backend** must be running on port 8080 for the frontend to use live data.
- **Frontend** uses polling to simulate real-time updates.

## Related Files

- Backend server routes: [Backend/main.cpp](Backend/main.cpp)
- Patient model: [Backend/patientClass.h](Backend/patientClass.h)
- Frontend API client: [frontend/src/services/api.js](frontend/src/services/api.js)
- Staff polling UI: [frontend/src/components/StaffDashboard.js](frontend/src/components/StaffDashboard.js)
- Intake form: [frontend/src/components/PatientIntake.js](frontend/src/components/PatientIntake.js)
