# Accessible Triage App - Frontend

React-based frontend for the emergency triage system with accessibility features.

## Features

- **Patient Check-In Form**: Accessible intake form with voice input support
- **AI Triage Assessment**: Gemini-powered triage level calculation
- **Staff Dashboard**: Real-time patient queue monitoring
- **Accessibility Options**: High contrast mode, large text, voice input

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- Gemini API key (for AI triage)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your REACT_APP_GEMINI_API_KEY

# Start development server
npm start
```

The app will run at `http://localhost:3000`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `REACT_APP_GEMINI_API_KEY` | Google Gemini API key for AI triage | Yes (for AI features) |

## Project Structure

```
frontend/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── components/
│   │   ├── PatientIntake.js   # Patient check-in form
│   │   ├── StaffDashboard.js  # Staff queue view
│   │   └── VoiceInput.js      # Voice input component
│   ├── services/
│   │   ├── api.js          # Backend API calls
│   │   └── gemini.js       # Gemini AI integration
│   ├── App.js              # Main app with routing
│   ├── index.js            # Entry point
│   └── index.css           # Global styles & themes
├── .env.example            # Environment template
└── package.json
```

## API Integration

The frontend communicates with the C++ backend:

- **POST /api/intake**: Submit new patient
- **GET /api/queue**: Get current patient queue (polled every 3 seconds)

If the backend is unavailable, mock data is used for demo purposes.

## Accessibility Features

1. **High Contrast Mode**: Toggle via header button
2. **Large Text Mode**: Toggle via header button  
3. **Voice Input**: Click microphone to dictate chief complaint
4. **Keyboard Navigation**: Full keyboard support
5. **Screen Reader Support**: ARIA labels and live regions
6. **Skip Links**: Skip to main content

## Triage Levels (CTAS)

| Level | Name | Description |
|-------|------|-------------|
| 1 | Resuscitation | Immediate life-threatening |
| 2 | Emergent | Potentially life-threatening |
| 3 | Urgent | Serious, needs treatment within 30 min |
| 4 | Less Urgent | Can wait 1-2 hours |
| 5 | Non-Urgent | Minor, can wait |

## Available Scripts

- `npm start` - Run development server
- `npm build` - Build for production
- `npm test` - Run tests

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

Voice input requires a Chromium-based browser for best compatibility.
