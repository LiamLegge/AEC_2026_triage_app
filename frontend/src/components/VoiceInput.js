import React, { useState, useCallback, useRef, useEffect } from 'react';

// NOTE: Comments in this file reflect AI-assisted coding directed by Jackson Chambers.
/**
 * Voice Input Component
 * Uses Web Speech API for speech-to-text transcription
 * Accessibility-friendly with proper ARIA attributes
 * AI-assisted coding directed by Jackson Chambers.
 */
const VoiceInput = ({ onTranscript, disabled = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  // Check for Web Speech API support — AI-assisted coding directed by Jackson Chambers.
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    // Initialize speech recognition — AI-assisted coding directed by Jackson Chambers.
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
      setIsRecording(false);
      setError(null);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      
      switch (event.error) {
        case 'not-allowed':
          setError('Microphone access denied. Please enable microphone permissions.');
          break;
        case 'no-speech':
          setError('No speech detected. Please try again.');
          break;
        case 'network':
          setError('Network error. Please check your connection.');
          break;
        default:
          setError('Speech recognition error. Please try again.');
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onTranscript]);

  // Toggle recording — AI-assisted coding directed by Jackson Chambers.
  const toggleRecording = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setError(null);
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start recording:', err);
        setError('Failed to start voice input. Please try again.');
      }
    }
  }, [isRecording]);

  // Handle keyboard activation — AI-assisted coding directed by Jackson Chambers.
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleRecording();
    }
  };

  // Not supported message — AI-assisted coding directed by Jackson Chambers.
  if (!isSupported) {
    return (
      <div 
        style={{ 
          padding: '8px', 
          color: 'var(--text-secondary)',
          fontSize: '0.85em'
        }}
        role="status"
      >
        Voice input not supported in this browser
      </div>
    );
  }

  return (
    <div className="voice-input-container">
      <button
        type="button"
        className={`voice-input-btn ${isRecording ? 'recording' : ''}`}
        onClick={toggleRecording}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
        aria-pressed={isRecording}
        title={isRecording ? 'Click to stop recording' : 'Click to use voice input'}
      >
        {isRecording ? (
          <MicrophoneOffIcon />
        ) : (
          <MicrophoneIcon />
        )}
      </button>
      
      {/* Recording indicator — AI-assisted coding directed by Jackson Chambers. */}
      {isRecording && (
        <div 
          role="status" 
          aria-live="polite"
          style={{
            position: 'absolute',
            marginTop: '60px',
            background: 'var(--danger-color)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '0.85em',
            whiteSpace: 'nowrap'
          }}
        >
          🎤 Listening...
        </div>
      )}

      {/* Error message — AI-assisted coding directed by Jackson Chambers. */}
      {error && (
        <div 
          role="alert"
          style={{
            position: 'absolute',
            marginTop: '60px',
            background: 'var(--card-background)',
            border: '1px solid var(--danger-color)',
            color: 'var(--danger-color)',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '0.85em',
            maxWidth: '200px'
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
};

// Microphone Icon — AI-assisted coding directed by Jackson Chambers.
const MicrophoneIcon = () => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

// Microphone Off Icon (for recording state) — AI-assisted coding directed by Jackson Chambers.
const MicrophoneOffIcon = () => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    aria-hidden="true"
  >
    <rect x="9" y="1" width="6" height="14" rx="3" />
    <path 
      d="M19 10v2a7 7 0 0 1-14 0v-2" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
    />
    <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="2" />
    <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export default VoiceInput;
