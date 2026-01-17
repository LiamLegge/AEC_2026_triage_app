import React, { useState, useCallback, useEffect } from 'react';

// NOTE: Comments in this file reflect AI-assisted coding directed by Jackson Chambers.
/**
 * Text-to-Speech Component
 * E-reader style TTS for accessibility
 * Reads labels, instructions, and field values aloud
 * AI-assisted coding directed by Jackson Chambers.
 */
const TextToSpeech = ({ text, label, autoRead = false, size = 'small' }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (!window.speechSynthesis) {
      setIsSupported(false);
    }
  }, []);

  // Auto-read on mount if enabled — AI-assisted coding directed by Jackson Chambers.
  useEffect(() => {
    if (autoRead && text && isSupported) {
      speak();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRead]);

  const speak = useCallback(() => {
    if (!window.speechSynthesis || !text) return;

    // Cancel any ongoing speech — AI-assisted coding directed by Jackson Chambers.
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [text]);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  const toggle = useCallback(() => {
    if (isSpeaking) {
      stop();
    } else {
      speak();
    }
  }, [isSpeaking, speak, stop]);

  if (!isSupported) {
    return null;
  }

  const sizeClass = {
    small: 'tts-btn-sm',
    medium: 'tts-btn-md',
    large: 'tts-btn-lg'
  }[size] || 'tts-btn-sm';

  return (
    <>
      <button
        type="button"
        className={`tts-button ${sizeClass} ${isSpeaking ? 'speaking' : ''}`}
        onClick={toggle}
        aria-label={isSpeaking ? 'Stop reading' : `Read ${label || 'text'} aloud`}
        title={isSpeaking ? 'Stop' : 'Read aloud'}
      >
        {isSpeaking ? <StopIcon /> : <SpeakerIcon />}
      </button>
      <style>{`
        .tts-button {
          background: var(--secondary-color, #f1f5f9);
          border: 2px solid var(--border-color, #e2e8f0);
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary-color, #2563eb);
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .tts-button:hover {
          background: var(--primary-color, #2563eb);
          color: white;
          border-color: var(--primary-color, #2563eb);
        }

        .tts-button.speaking {
          background: var(--primary-color, #2563eb);
          color: white;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .tts-btn-sm {
          width: 36px;
          height: 36px;
          padding: 6px;
        }

        .tts-btn-sm svg {
          width: 18px;
          height: 18px;
        }

        .tts-btn-md {
          width: 48px;
          height: 48px;
          padding: 10px;
        }

        .tts-btn-md svg {
          width: 24px;
          height: 24px;
        }

        .tts-btn-lg {
          width: 60px;
          height: 60px;
          padding: 14px;
        }

        .tts-btn-lg svg {
          width: 32px;
          height: 32px;
        }
      `}</style>
    </>
  );
};

// Speaker Icon — AI-assisted coding directed by Jackson Chambers.
const SpeakerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
  </svg>
);

// Stop Icon — AI-assisted coding directed by Jackson Chambers.
const StopIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="6" y="6" width="12" height="12" rx="2"/>
  </svg>
);

/**
 * Hook for programmatic TTS
 * AI-assisted coding directed by Jackson Chambers.
 */
export const useTTS = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback((text, options = {}) => {
    if (!window.speechSynthesis || !text) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 0.9;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  const isSupported = typeof window !== 'undefined' && !!window.speechSynthesis;

  return { speak, stop, isSpeaking, isSupported };
};

export default TextToSpeech;
