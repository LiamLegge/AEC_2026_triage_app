# 🏥 Hospital Triage Application

> **Team CTRL ALT ELITES** — AEC 2026 Submission

A comprehensive, accessible hospital triage management system designed for both patients and medical staff. This full-stack application streamlines the emergency department check-in process while prioritizing accessibility and user experience.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Accessibility Features](#accessibility-features)
- [Team Credits](#team-credits)

---

## 🎯 Overview

This triage application addresses the need for an efficient, accessible emergency department intake system. It allows patients to check in digitally, automatically assesses triage priority using AI, and provides medical staff with a real-time dashboard to manage patient queues based on the Canadian Triage and Acuity Scale (CTAS).

### Key Capabilities

- **Patient Self-Check-In**: Digital intake forms with voice input and health card scanning
- **AI-Powered Triage Assessment**: Gemini AI integration for intelligent triage level recommendations
- **Real-Time Queue Management**: Staff dashboard with live patient queue updates
- **Multi-Language Support**: Internationalized interface for diverse patient populations
- **Comprehensive Accessibility**: Voice input/output, high contrast mode, large text, and screen reader support

---

## ✨ Features

### For Patients
- 📝 Digital check-in form with guided input
- 🎤 Voice-to-text input for chief complaint
- 📸 Health card OCR scanning (Tesseract.js)
- 🔊 Text-to-speech support for form guidance
- 🌐 Multi-language interface support
- ♿ Full accessibility compliance

### For Medical Staff
- 📊 Real-time patient queue dashboard
- 🚨 Priority-based patient sorting (CTAS 1-5)
- 👤 Detailed patient information view
- 📧 Automated patient email notifications
- ⏱️ Automatic severity re-evaluation over time

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | Component-based UI framework |
| **React Router v6** | Client-side routing and navigation |
| **Axios** | HTTP client for API communication |
| **Tesseract.js** | OCR engine for health card scanning |
| **Google Gemini AI** | AI-powered triage assessment |
| **Web Speech API** | Speech-to-text and text-to-speech |
| **CSS3** | Styling with accessibility themes |

### Backend
| Technology | Purpose |
|------------|---------|
| **C++17** | High-performance server application |
| **Crow Framework** | Lightweight HTTP server framework |
| **nlohmann/json** | JSON parsing and serialization |
| **ASIO** | Asynchronous I/O networking |
| **libcurl** | Email sending via SMTP |
| **Docker** | Containerized deployment |
| **Google Cloud Run** | Cloud hosting platform |

### Development & Deployment
| Technology | Purpose |
|------------|---------|
| **Firebase Hosting** | Frontend static hosting |
| **Docker** | Container orchestration |
| **CMake** | Build system for C++ backend |
| **npm** | Frontend package management |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   React     │  │   Gemini    │  │   Tesseract.js (OCR)    │  │
│  │   App       │  │   AI API    │  │   Web Speech API        │  │
│  └──────┬──────┘  └─────────────┘  └─────────────────────────┘  │
│         │                                                       │
│         │ Axios HTTP Requests                                   │
└─────────┼───────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Crow      │  │  Circular   │  │   Email Service         │  │
│  │   Server    │──│   Queue     │  │   (libcurl/SMTP)        │  │
│  │   (REST)    │  │   (5 CTAS)  │  │                         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Triage Levels (CTAS)

| Level | Name | Description | Response Time |
|-------|------|-------------|---------------|
| 1 | Resuscitation | Immediate life-threatening | Immediate |
| 2 | Emergent | Potentially life-threatening | ≤15 minutes |
| 3 | Urgent | Serious condition | ≤30 minutes |
| 4 | Less Urgent | Can wait | 1-2 hours |
| 5 | Non-Urgent | Minor issues | 2+ hours |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 16+ and npm
- **C++17** compatible compiler (g++ recommended)
- **Docker** (optional, for containerized deployment)
- **Google Gemini API Key** (for AI triage features)

### Quick Start

#### 1. Clone the Repository
```bash
git clone https://github.com/your-repo/AEC_2026_triage_app.git
cd AEC_2026_triage_app
```

#### 2. Start the Backend
```bash
cd Backend
# Build and run (Windows)
deploy.bat

# Or manually with CMake
mkdir build && cd build
cmake ..
make
./triage_server
```

#### 3. Start the Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Add your REACT_APP_GEMINI_API_KEY to .env
npm start
```

#### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080

### One-Click Start (Windows)
```bash
start_system.bat
```

---

## 📡 API Documentation

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/intake` | Submit new patient registration |
| `GET` | `/api/queue` | Retrieve full patient queue |
| `GET` | `/api/next_patient` | Get highest priority patient |

For detailed API documentation, see [API_INTEGRATION.md](API_INTEGRATION.md).

---

## ♿ Accessibility Features

This application was designed with accessibility as a core principle:

- **🎤 Voice Input**: Dictate responses using the Web Speech API
- **🔊 Text-to-Speech**: Audio feedback and form guidance
- **🌗 High Contrast Mode**: Enhanced visibility for visual impairments
- **📏 Large Text Mode**: Scalable text for improved readability
- **⌨️ Keyboard Navigation**: Full keyboard accessibility
- **🏷️ ARIA Labels**: Screen reader compatibility
- **⏭️ Skip Links**: Quick navigation to main content
- **🌐 Multi-Language**: Support for multiple languages

---

## 👥 Team Credits

### **Team CTRL ALT ELITES**

#### Backend Team

| Name | Role | Contributions |
|------|------|---------------|
| **Megan Neville** | API Development | REST API design, endpoint implementation, Crow server configuration, CORS handling |
| **Ryan Leblanc** | Business Logic | Patient data structures, circular queue implementation, triage algorithms, email notifications |

#### Frontend Team

| Name | Role | Contributions |
|------|------|---------------|
| **Jackson Chambers** | Integration & Accessibility | Frontend-backend integration, OCR implementation (Tesseract.js), Text-to-Speech, Speech-to-Text, UX design, Gemini AI integration |
| **Liam Legge** | UI Design & Documentation | User interface design, dark mode/theme system, documentation, presentation materials |

---

## 📄 License

This project was created for the AEC 2026 competition.

---

## 🔗 Additional Documentation

- [API Integration Guide](API_INTEGRATION.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Frontend Documentation](frontend/README.md)
- [Docker Setup](Backend/DOCKER_README.md)
- [Gmail Setup for Notifications](Backend/GMAIL_SETUP.md)

---

<p align="center">
  <strong>Built with ❤️ by Team CTRL ALT ELITES for AEC 2026</strong>
</p>
