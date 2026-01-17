import React, { useState, useCallback, useRef, useEffect } from 'react';

// NOTE: Comments in this file reflect AI-assisted coding directed by Jackson Chambers.
/**
 * Universal Voice Input Component
 * Can be used for any text field - names, health cards, complaints, etc.
 * Includes processing for different input types
 * AI-assisted coding directed by Jackson Chambers.
 */
const VoiceInputUniversal = ({ 
  onTranscript, 
  disabled = false, 
  placeholder,
  label,
  inputType = "text", // "text", "healthcard", "date", "name"
  size = "medium" // "small", "medium", "large"
}) => {
  // Use label prop if provided, otherwise use placeholder — AI-assisted coding directed by Jackson Chambers.
  const ariaLabel = label || placeholder || "Tap to speak";
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState(null);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPart;
        } else {
          interimTranscript += transcriptPart;
        }
      }

      const rawTranscript = finalTranscript || interimTranscript;
      setTranscript(rawTranscript);

      if (finalTranscript) {
        const processed = processTranscript(finalTranscript, inputType);
        onTranscript(processed);
        setIsRecording(false);
        setError(null);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      
      switch (event.error) {
        case 'not-allowed':
          setError('Microphone access denied');
          break;
        case 'no-speech':
          setError('No speech detected');
          break;
        case 'network':
          setError('Network error');
          break;
        default:
          setError('Please try again');
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
  }, [onTranscript, inputType]);

  // Process transcript based on input type — AI-assisted coding directed by Jackson Chambers.
  const processTranscript = (text, type) => {
    let processed = text.trim();

    switch (type) {
      case 'healthcard':
        // Convert spoken numbers and letters to health card format
        // "one two three four five six seven eight nine AB" -> "1234-56-789-AB"
        processed = processHealthCard(processed);
        break;
      case 'date':
        // Try to parse spoken date
        processed = processDate(processed);
        break;
      case 'name':
        // Capitalize properly
        processed = processed
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        break;
      default:
        // Keep as-is for general text
        break;
    }

    return processed;
  };

  // Process health card from speech — AI-assisted coding directed by Jackson Chambers.
  const processHealthCard = (text) => {
    // Word to number mapping — AI-assisted coding directed by Jackson Chambers.
    const wordToNum = {
      'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
      'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
      'oh': '0', 'o': '0'
    };

    // Convert words to characters — AI-assisted coding directed by Jackson Chambers.
    let result = text.toLowerCase();
    
    // Replace word numbers — AI-assisted coding directed by Jackson Chambers.
    Object.entries(wordToNum).forEach(([word, num]) => {
      result = result.replace(new RegExp(`\\b${word}\\b`, 'g'), num);
    });

    // Remove spaces and non-alphanumeric (except we want letters at end) — AI-assisted coding directed by Jackson Chambers.
    result = result.replace(/[^a-z0-9]/gi, '').toUpperCase();

    // Format as ####-##-###-XX — AI-assisted coding directed by Jackson Chambers.
    if (result.length >= 12) {
      const digits = result.slice(0, 9).replace(/[^0-9]/g, '');
      const letters = result.slice(-2).replace(/[^A-Z]/g, '');
      if (digits.length >= 9 && letters.length >= 2) {
        return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 9)}-${letters.slice(0, 2)}`;
      }
    }

    return result;
  };

  // Process date from speech — AI-assisted coding directed by Jackson Chambers.
  const processDate = (text) => {
    // Try to parse natural language date — AI-assisted coding directed by Jackson Chambers.
    const months = {
      'january': '01', 'february': '02', 'march': '03', 'april': '04',
      'may': '05', 'june': '06', 'july': '07', 'august': '08',
      'september': '09', 'october': '10', 'november': '11', 'december': '12'
    };

    const lower = text.toLowerCase();
    
    // Try "Month Day Year" format — AI-assisted coding directed by Jackson Chambers.
    const monthMatch = Object.entries(months).find(([name]) => lower.includes(name));
    if (monthMatch) {
      const [monthName, monthNum] = monthMatch;
      const afterMonth = lower.split(monthName)[1] || '';
      const numbers = afterMonth.match(/\d+/g);
      if (numbers && numbers.length >= 2) {
        const day = numbers[0].padStart(2, '0');
        let year = numbers[1];
        if (year.length === 2) {
          year = parseInt(year) > 30 ? `19${year}` : `20${year}`;
        }
        return `${year}-${monthNum}-${day}`;
      }
    }

    return text;
  };

  const toggleRecording = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setError(null);
      setTranscript('');
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start recording:', err);
        setError('Failed to start');
      }
    }
  }, [isRecording]);

  if (!isSupported) {
    return (
      <div className="voice-input-unsupported" title="Voice input not supported">
        🎤❌
      </div>
    );
  }

  const sizeClasses = {
    small: 'voice-btn-sm',
    medium: 'voice-btn-md',
    large: 'voice-btn-lg'
  };

  return (
    <div className="voice-input-universal">
      <button
        type="button"
        className={`voice-btn ${sizeClasses[size]} ${isRecording ? 'recording' : ''}`}
        onClick={toggleRecording}
        disabled={disabled}
        aria-label={isRecording ? 'Stop recording' : ariaLabel}
        title={isRecording ? 'Tap to stop' : ariaLabel}
      >
        {isRecording ? <MicActiveIcon /> : <MicIcon />}
      </button>
      
      {/* Live transcript preview — AI-assisted coding directed by Jackson Chambers. */}
      {isRecording && transcript && (
        <div className="voice-transcript-preview">
          "{transcript}"
        </div>
      )}

      {/* Error display — AI-assisted coding directed by Jackson Chambers. */}
      {error && (
        <div className="voice-error">
          {error}
        </div>
      )}

      <style>{`
        .voice-input-universal {
          position: relative;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
        }

        .voice-btn {
          background: var(--secondary-color, #f1f5f9);
          border: 2px solid var(--border-color, #e2e8f0);
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-primary, #1e293b);
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .voice-btn:hover {
          background: var(--primary-color, #2563eb);
          color: white;
          border-color: var(--primary-color, #2563eb);
        }

        .voice-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .voice-btn.recording {
          background: var(--danger-color, #ef4444);
          color: white;
          border-color: var(--danger-color, #ef4444);
          animation: pulse-recording 1s infinite;
        }

        @keyframes pulse-recording {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .voice-btn-sm {
          width: 40px;
          height: 40px;
          padding: 8px;
        }

        .voice-btn-sm svg {
          width: 20px;
          height: 20px;
        }

        .voice-btn-md {
          width: 52px;
          height: 52px;
          padding: 12px;
        }

        .voice-btn-md svg {
          width: 24px;
          height: 24px;
        }

        .voice-btn-lg {
          width: 64px;
          height: 64px;
          padding: 16px;
        }

        .voice-btn-lg svg {
          width: 32px;
          height: 32px;
        }

        .voice-transcript-preview {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-top: 8px;
          padding: 8px 12px;
          background: var(--card-background, white);
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          font-size: 0.85em;
          white-space: nowrap;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          z-index: 10;
        }

        .voice-error {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-top: 8px;
          padding: 4px 8px;
          background: var(--danger-color, #ef4444);
          color: white;
          border-radius: 4px;
          font-size: 0.75em;
          white-space: nowrap;
          z-index: 10;
        }

        .voice-input-unsupported {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--secondary-color, #f1f5f9);
          border-radius: 12px;
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
};

// Microphone Icon
const MicIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

// Active Microphone Icon
const MicActiveIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <rect x="9" y="1" width="6" height="14" rx="3" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" fill="none" stroke="currentColor" strokeWidth="2" />
    <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="2" />
    <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export default VoiceInputUniversal;
