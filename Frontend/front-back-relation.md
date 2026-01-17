System Interface Agreement: Accessible Triage App
Project: CTRL + ALT + ELITE - Accessibility Triage System Date: 2027-1-17 Competition Day Goal: Parallel development of React Frontend (Input/AI) and C++ Backend (Queue Logic).

1. The Data Contract (Shared JSON)
Crucial: Both teams must strictly adhere to this JSON structure. This structure is derived directly from the provided sample_data.txt to ensure we can use the competition datasets easily.

The "Patient" Object
Frontend: Sends this JSON to /api/intake. Backend: Stores this struct and sends a list of them via /api/queue.

JSON

{
  "id": 1001,
  "name": "Aisha Al-Fayed",
  "age": 34,
  "health_card": "1234-321-123-PW"
  "birth_day": "2005-06-06"
  "chief_complaint": "Severe Chest Pain",
  "triage_level": 2,
  "accessibility_profile": "None",
  "preferred_mode": "Standard",
  "ui_setting": "Default",
  "language": "English",
  "timestamp": 1705492800
}
triage_level (int): 1 (Resuscitation) to 5 (Non-Urgent).

Note: Lower number = Higher Priority.
Note: Check in time will be done on backend, is in format: Fri Jan 17 10:52:30 2026

accessibility_profile (string): e.g., "Visual Impairment", "Hearing Impairment", "Mobility".

ui_setting (string): e.g., "High_Contrast", "Large_Text".

2. API Endpoints (The Handshake)
Base URL: http://localhost:8080 (or whichever port C++ opens).

Endpoint A: Patient Intake (Frontend → Backend)
Route: POST /api/intake

Responsibility: Frontend sends data after the user submits the form and Gemini calculates the score.

Payload: The Single Patient JSON object above.

Response: 200 OK { "status": "success", "queue_position": 4 }

Endpoint B: Staff Dashboard (Backend → Frontend)
Route: GET /api/queue

Responsibility: Backend returns the current sorted waitlist to the Staff Dashboard view.

Payload: An array of Patient objects, sorted by priority (Level 1 first, then Level 2, etc.).

JSON

[
  { "id": 1040, "name": "Zara Khan", "triage_level": 2, ... },
  { "id": 1002, "name": "Liam O'Connor", "triage_level": 4, ... }
]
3. Team Delegations
Frontend Team (React + Gemini)

Goal: Accessibility & Input (Worth 25 pts ).

User Interface: Build the Patient Check-in form.


Accessibility Implementation: Implement the chosen features (e.g., Voice Input, High Contrast).

Constraint: You must clearly demonstrate these working during the demo.

Gemini Logic:

Take the user's chief_complaint (e.g., "My chest hurts").

Send it to Gemini API with a system prompt to return a Triage Level (1-5).

Prompt Tip: "You are a triage nurse. Return ONLY the integer 1-5 based on CTAS guidelines."

Network: POST the final JSON to the C++ backend.

Staff View: Poll GET /api/queue every 3 seconds to render the live list for the "Staff Dashboard" screen.

Backend Team (C++)

Goal: Speed & Data Structure (Worth 20 pts for Core Functionality ).

Server Setup: Get a basic server running (recommend Crow or Drogon) immediately.

Data Structure:

Create a struct Patient { ... }.

Use nlohmann/json for parsing. Do not write your own parser.

The Priority Queue:

Implement a std::priority_queue or std::vector with a custom comparator:

C++

// Sorts so Level 1 comes before Level 5
bool comparePatients(const Patient& a, const Patient& b) {
    return a.triage_level < b.triage_level;
}
Edge Case Handling:

Ensure the server doesn't crash if accessibility_profile is empty/null.

Handle concurrent requests (threading is usually handled by the library, but verify).

4. Hackathon "Speed" Agreements
Hardcoded Port: We agree to use Port 8080 for the backend.

No Auth: We will not implement authentication/login tokens to save time.

Mock Data: If the backend isn't ready, Frontend will mock the API response. If Frontend isn't ready, Backend will use Postman/Curl to test.

Parsing: If a field is missing in the JSON, the Backend will default it to "N/A" rather than crashing.
