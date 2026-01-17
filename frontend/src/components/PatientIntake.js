import React, { useState, useRef, useCallback, useEffect } from 'react';
import { getTriageLevel, isGeminiConfigured, setGeminiApiKey } from '../services/gemini';
import { submitPatientIntake } from '../services/api';
import { useAccessibility } from '../App';
import VoiceInput from './VoiceInput';
import TextToSpeech, { useTTS } from './TextToSpeech';
import VoiceInputUniversal from './VoiceInputUniversal';
import HealthCardScanner from './HealthCardScanner';
import { languageDisplayNames, LANGUAGES } from '../translations';

const PatientIntake = () => {
  const { theme, uiSetting, language, toggleHighContrast, toggleDarkMode, toggleLargeText, toggleLanguage, t } = useAccessibility();
  const { speak, stop, isSpeaking } = useTTS();
  
  // Form state with new fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    health_card: '',
    birth_day: '',
    chief_complaint: '',
    accessibility_needs: [], // Changed to array for multiple selections
    preferred_mode: 'Standard',
    language: 'English',
  });
  
  // Language dropdown state for sidebar
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const langDropdownRef = useRef(null);

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setShowLangDropdown(false);
      }
    };
    if (showLangDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLangDropdown]);

  /**
   * Parse natural language date input into ISO date format (YYYY-MM-DD)
   * Supports various formats:
   * - "January 15, 1990" / "Jan 15 1990" / "15 January 1990"
   * - "1/15/1990" / "01-15-1990" / "1990-01-15"
   * - "15th of January 1990" / "January fifteenth 1990"
   * - Relative: "25 years ago"
   */
  const parseNaturalLanguageDate = (input) => {
    if (!input || typeof input !== 'string') return '';
    
    const text = input.toLowerCase().trim();
    
    // If already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      return text;
    }

    // Month name mappings
    const monthNames = {
      january: 0, jan: 0,
      february: 1, feb: 1,
      march: 2, mar: 2,
      april: 3, apr: 3,
      may: 4,
      june: 5, jun: 5,
      july: 6, jul: 6,
      august: 7, aug: 7,
      september: 8, sept: 8, sep: 8,
      october: 9, oct: 9,
      november: 10, nov: 10,
      december: 11, dec: 11
    };

    // Ordinal number mappings
    const ordinals = {
      first: 1, second: 2, third: 3, fourth: 4, fifth: 5,
      sixth: 6, seventh: 7, eighth: 8, ninth: 9, tenth: 10,
      eleventh: 11, twelfth: 12, thirteenth: 13, fourteenth: 14, fifteenth: 15,
      sixteenth: 16, seventeenth: 17, eighteenth: 18, nineteenth: 19, twentieth: 20,
      'twenty-first': 21, 'twenty-second': 22, 'twenty-third': 23, 'twenty-fourth': 24,
      'twenty-fifth': 25, 'twenty-sixth': 26, 'twenty-seventh': 27, 'twenty-eighth': 28,
      'twenty-ninth': 29, thirtieth: 30, 'thirty-first': 31
    };

    try {
      // Handle relative dates: "25 years ago", "30 years ago"
      const yearsAgoMatch = text.match(/(\d+)\s*years?\s+ago/);
      if (yearsAgoMatch) {
        const yearsAgo = parseInt(yearsAgoMatch[1]);
        const date = new Date();
        date.setFullYear(date.getFullYear() - yearsAgo);
        return date.toISOString().split('T')[0];
      }

      // Replace ordinal words with numbers
      let processedText = text;
      for (const [word, num] of Object.entries(ordinals)) {
        processedText = processedText.replace(new RegExp('\\b' + word + '\\b', 'g'), num.toString());
      }
      
      // Remove ordinal suffixes (1st, 2nd, 3rd, 21st, etc.)
      processedText = processedText.replace(/(\d+)(st|nd|rd|th)/g, '$1');
      
      // Remove "of" and "the"
      processedText = processedText.replace(/\b(of|the)\b/g, '');

      // Pattern: "Month Day Year" or "Day Month Year" (e.g., "January 15 1990" or "15 January 1990")
      for (const [monthName, monthNum] of Object.entries(monthNames)) {
        // "January 15 1990" or "January 15, 1990"
        const pattern1 = new RegExp(`\\b${monthName}\\s+(\\d{1,2})[,\\s]+(\\d{4})\\b`);
        const match1 = processedText.match(pattern1);
        if (match1) {
          const day = parseInt(match1[1]);
          const year = parseInt(match1[2]);
          return formatDateISO(year, monthNum, day);
        }
        
        // "15 January 1990"
        const pattern2 = new RegExp(`\\b(\\d{1,2})\\s+${monthName}[,\\s]+(\\d{4})\\b`);
        const match2 = processedText.match(pattern2);
        if (match2) {
          const day = parseInt(match2[1]);
          const year = parseInt(match2[2]);
          return formatDateISO(year, monthNum, day);
        }
      }

      // Pattern: MM/DD/YYYY, M/D/YYYY, MM-DD-YYYY, etc.
      const slashPattern = /\b(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})\b/;
      const slashMatch = processedText.match(slashPattern);
      if (slashMatch) {
        const month = parseInt(slashMatch[1]) - 1; // 0-indexed
        const day = parseInt(slashMatch[2]);
        const year = parseInt(slashMatch[3]);
        return formatDateISO(year, month, day);
      }

      // Pattern: YYYY/MM/DD or YYYY-MM-DD
      const isoPattern = /\b(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})\b/;
      const isoMatch = processedText.match(isoPattern);
      if (isoMatch) {
        const year = parseInt(isoMatch[1]);
        const month = parseInt(isoMatch[2]) - 1; // 0-indexed
        const day = parseInt(isoMatch[3]);
        return formatDateISO(year, month, day);
      }

      // If no pattern matched but we can parse as date
      const parsed = new Date(input);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
      }

      return ''; // Could not parse
    } catch (error) {
      console.error('Date parsing error:', error);
      return '';
    }
  };

  /**
   * Helper to format date as ISO string
   */
  const formatDateISO = (year, month, day) => {
    const date = new Date(year, month, day);
    if (isNaN(date.getTime())) return '';
    
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  /**
   * Sanitize email for safe shell usage
   * Removes/escapes characters that could be used for injection attacks
   * Only allows: alphanumeric, @, ., -, _, +
   */
  const sanitizeEmail = (email) => {
    if (!email) return '';
    // Only allow safe email characters - periods are explicitly allowed
    // Remove any character that's not alphanumeric, @, ., -, _, +
    const sanitized = email
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9@.\-_+]/g, '')
      // Prevent multiple @ symbols
      .replace(/@+/g, '@')
      // Prevent consecutive dots (but single dots are fine)
      .replace(/\.{2,}/g, '.')
      // Only remove leading dots/dashes, NOT trailing (to allow typing "john." before "doe")
      .replace(/^[.\-]+/g, '');
    return sanitized;
  };

  /**
   * Validate email format
   */
  const isValidEmail = (email) => {
    if (!email) return true; // Email is optional
    // Basic email regex - not too strict
    const pattern = /^[a-z0-9._+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/i;
    return pattern.test(email);
  };
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalculatingTriage, setIsCalculatingTriage] = useState(false);
  const [triageLevel, setTriageLevel] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [error, setError] = useState(null);
  const [geminiConfigured, setGeminiConfigured] = useState(isGeminiConfigured());
  const [currentStep, setCurrentStep] = useState(1); // Multi-step form for iPad
  const [showScanner, setShowScanner] = useState(false); // Health card scanner modal
  
  const complaintRef = useRef(null);

  // Calculate age from birthday
  const calculateAge = (birthday) => {
    if (!birthday) return null;
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Auto-detect and set accessibility based on current UI settings
  useEffect(() => {
    let detectedProfile = 'None';
    let detectedMode = 'Standard';

    // Detect based on current accessibility settings
    if (theme === 'high-contrast') {
      detectedProfile = 'Visual Impairment';
      detectedMode = 'Touch';
    }
    if (uiSetting === 'large-text') {
      detectedProfile = detectedProfile === 'None' ? 'Low Vision' : detectedProfile;
      detectedMode = 'Touch';
    }

    setFormData(prev => ({
      ...prev,
      accessibility_profile: detectedProfile,
      preferred_mode: detectedMode,
    }));
  }, [theme, uiSetting]);

  // Sync form language with global language when changed from header
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      language: language,
    }));
  }, [language]);

  // Format health card input (####-###-###-XX)
  const formatHealthCard = (value) => {
    // Remove all non-alphanumeric characters
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    
    // Apply format: ####-###-###-XX (4-3-3-2 = 12 chars + 3 dashes = 15 total)
    let formatted = '';
    for (let i = 0; i < cleaned.length && i < 12; i++) {
      if (i === 4 || i === 7 || i === 10) {
        formatted += '-';
      }
      formatted += cleaned[i];
    }
    return formatted;
  };

  // Validate health card format
  const isValidHealthCard = (card) => {
    // Format: ####-###-###-XX (4 digits, 3 digits, 3 digits, 2 letters PW or MK)
    const pattern = /^\d{4}-\d{3}-\d{3}-(PW|MK)$/;
    return pattern.test(card);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    
    // Format health card as user types
    if (name === 'health_card') {
      processedValue = formatHealthCard(value);
    }
    
    // Sanitize email as user types (periods are allowed)
    if (name === 'email') {
      processedValue = sanitizeEmail(value);
    }
    
    // Parse natural language date for birth_day
    if (name === 'birth_day') {
      // If it's not already in date format, try to parse natural language
      if (value && !value.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const parsed = parseNaturalLanguageDate(value);
        if (parsed) {
          processedValue = parsed;
        }
      }
    }

    // Update global language when form language changes
    if (name === 'language') {
      toggleLanguage(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue,
    }));
    
    // Reset triage level if complaint changes
    if (name === 'chief_complaint') {
      setTriageLevel(null);
    }
  };

  // Handle voice input for chief complaint
  const handleVoiceInput = useCallback((transcript) => {
    setFormData(prev => ({
      ...prev,
      chief_complaint: transcript,
    }));
    setTriageLevel(null);
  }, []);

  // Handle voice input for name
  const handleNameVoice = useCallback((transcript) => {
    setFormData(prev => ({
      ...prev,
      name: transcript,
    }));
  }, []);

  // Handle voice input for email
  const handleEmailVoice = useCallback((transcript) => {
    // Convert spoken email to text format
    // Common voice patterns: "at" -> "@", "dot" -> "."
    const emailText = transcript
      .toLowerCase()
      .replace(/\s+at\s+/gi, '@')
      .replace(/\s+dot\s+/gi, '.')
      .replace(/\s+dash\s+/gi, '-')
      .replace(/\s+underscore\s+/gi, '_')
      .replace(/\s+/g, '') // Remove remaining spaces
      .trim();
    
    setFormData(prev => ({
      ...prev,
      email: sanitizeEmail(emailText),
    }));
  }, []);

  // Handle voice input for health card
  const handleHealthCardVoice = useCallback((healthCard) => {
    setFormData(prev => ({
      ...prev,
      health_card: healthCard,
    }));
  }, []);

  // Handle voice input for date of birth
  const handleDOBVoice = useCallback((transcript) => {
    // Parse natural language date from voice input
    const parsedDate = parseNaturalLanguageDate(transcript);
    if (parsedDate) {
      setFormData(prev => ({
        ...prev,
        birth_day: parsedDate,
      }));
      // Provide audio feedback - parse manually to avoid timezone issues
      const [year, month, day] = parsedDate.split('-').map(Number);
      const date = new Date(year, month - 1, day); // month is 0-indexed in Date constructor
      const formatted = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      speak(`Date of birth set to ${formatted}`);
    } else {
      speak('Sorry, I could not understand that date. Please try again or type it manually.');
    }
  }, [speak]);

  // Handle health card scan result (includes DOB extraction)
  const handleHealthCardScan = useCallback((scannedData) => {
    setFormData(prev => ({
      ...prev,
      health_card: scannedData.healthCard || prev.health_card,
      birth_day: scannedData.birthDay || prev.birth_day,
    }));
    setShowScanner(false);
    // Announce success
    const parts = [];
    if (scannedData.healthCard) parts.push(`Health card: ${scannedData.healthCard.split('').join(' ')}`);
    if (scannedData.birthDay) parts.push(`Date of birth detected`);
    speak(`Scan complete. ${parts.join('. ')}`);
  }, [speak]);

  // TTS helper to read field labels and values
  const speakField = (label, value) => {
    const text = value ? `${label}: ${value}` : label;
    speak(text);
  };

  // Calculate triage level using Gemini
  const calculateTriage = async () => {
    if (!formData.chief_complaint.trim()) {
      setError('Please enter a chief complaint first');
      return;
    }
    
    setIsCalculatingTriage(true);
    setError(null);
    
    try {
      const level = await getTriageLevel(formData.chief_complaint);
      setTriageLevel(level);
      
      // Announce to screen readers
      const announcement = `Triage level calculated: Level ${level}`;
      announceToScreenReader(announcement);
    } catch (err) {
      setError('Failed to calculate triage level. Please try again.');
      console.error(err);
    } finally {
      setIsCalculatingTriage(false);
    }
  };

  const handleSetGeminiKey = () => {
    const key = window.prompt('Enter Gemini API key');
    if (!key || !key.trim()) return;
    setGeminiApiKey(key.trim());
    setGeminiConfigured(isGeminiConfigured());
  };

  // Submit patient to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const age = calculateAge(formData.birth_day);
    
    // Validate form
    if (!formData.name.trim()) {
      setError('Please enter your full name');
      setCurrentStep(1);
      return;
    }
    if (formData.email && !isValidEmail(formData.email)) {
      setError('Please enter a valid email address');
      setCurrentStep(1);
      return;
    }
    if (!formData.health_card || !isValidHealthCard(formData.health_card)) {
      setError('Please enter a valid health card number (####-##-###-XX)');
      setCurrentStep(1);
      return;
    }
    if (!formData.birth_day) {
      setError('Please enter your date of birth');
      setCurrentStep(1);
      return;
    }
    if (!formData.chief_complaint.trim()) {
      setError('Please describe your symptoms');
      setCurrentStep(2);
      return;
    }
    if (!triageLevel) {
      setError('Please wait for triage assessment');
      setCurrentStep(2);
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Build patient object according to updated data contract
      const patient = {
        id: Date.now(),
        name: formData.name.trim(),
        email: sanitizeEmail(formData.email), // Double-sanitize for safety
        age: age,
        health_card: formData.health_card,
        birth_day: formData.birth_day,
        chief_complaint: formData.chief_complaint.trim(),
        triage_level: triageLevel,
        accessibility_needs: formData.accessibility_needs, // Now an array
        accessibility_profile: (formData.accessibility_needs && formData.accessibility_needs.length > 0)
          ? formData.accessibility_needs.join(', ')
          : 'None',
        preferred_mode: formData.preferred_mode,
        ui_setting: uiSetting === 'large-text' ? 'Large_Text' : 
                    theme === 'high-contrast' ? 'High_Contrast' : 
                    theme === 'dark-mode' ? 'Dark_Mode' : 'Standard',
        language: formData.language,
        timestamp: Math.floor(Date.now() / 1000),
      };
      
      const result = await submitPatientIntake(patient);
      setSubmitResult(result);
      announceToScreenReader(`${t('youreRegistered')} ${t('queuePosition')}: ${result.queue_position}`);
      
      // Reset form after delay
      setTimeout(() => {
        resetForm();
      }, 8000);
      
    } catch (err) {
      // Show more specific error message
      const errorMessage = err.message && err.message.includes('Backend')
        ? 'Backend server not available. Please ensure the server is running on port 8080.'
        : t('failedToRegister');
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      health_card: '',
      birth_day: '',
      chief_complaint: '',
      accessibility_needs: [],
      preferred_mode: 'Standard',
      language: 'English',
    });
    setTriageLevel(null);
    setSubmitResult(null);
    setError(null);
    setCurrentStep(1);
  };

  // Handle accessibility checkbox changes (select all that apply)
  const handleAccessibilityChange = (value) => {
    setFormData(prev => {
      const currentNeeds = prev.accessibility_needs || [];
      if (currentNeeds.includes(value)) {
        // Remove if already selected
        return {
          ...prev,
          accessibility_needs: currentNeeds.filter(v => v !== value),
        };
      } else {
        // Add if not selected
        return {
          ...prev,
          accessibility_needs: [...currentNeeds, value],
        };
      }
    });
  };

  // Helper to announce messages to screen readers
  const announceToScreenReader = (message) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
  };

  // Get triage level description (uses translations)
  const getTriageLevelInfo = (level) => {
    const info = {
      1: { label: t('critical'), description: t('criticalDesc'), color: 'triage-1', icon: '🚨' },
      2: { label: t('emergency'), description: t('emergencyDesc'), color: 'triage-2', icon: '⚠️' },
      3: { label: t('urgent'), description: t('urgentDesc'), color: 'triage-3', icon: '🟡' },
      4: { label: t('lessUrgent'), description: t('lessUrgentDesc'), color: 'triage-4', icon: '🟢' },
      5: { label: t('nonUrgent'), description: t('nonUrgentDesc'), color: 'triage-5', icon: '🔵' },
    };
    return info[level] || { label: 'Unknown', description: '', color: '', icon: '' };
  };

  // Navigation between steps
  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        setError(t('enterName'));
        return;
      }
      if (!formData.health_card || !isValidHealthCard(formData.health_card)) {
        setError(t('enterValidHealthCard'));
        return;
      }
      if (!formData.birth_day) {
        setError(t('enterDOB'));
        return;
      }
    }
    setError(null);
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setError(null);
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Handle language button click in sidebar
  const handleSidebarLanguageClick = () => {
    toggleLanguage(); // Cycle to next language
    setShowLangDropdown(prev => !prev); // Toggle dropdown
  };

  return (
    <div className="patient-intake tablet-optimized">
      {/* Accessibility Quick Actions - Always visible on iPad */}
      <div className="accessibility-quick-sidebar">
        <span className="quick-sidebar-label">{t('accessibilitySettings')}</span>
        <button
          type="button"
          className={`quick-access-btn ${theme === 'dark-mode' ? 'active' : ''}`}
          onClick={toggleDarkMode}
          aria-pressed={theme === 'dark-mode'}
          title={t('darkMode')}
        >
          {t('darkMode')}
        </button>
        <button
          type="button"
          className={`quick-access-btn ${theme === 'high-contrast' ? 'active' : ''}`}
          onClick={toggleHighContrast}
          aria-pressed={theme === 'high-contrast'}
          title={t('highContrast')}
        >
          {t('highContrast')}
        </button>
        <button
          type="button"
          className={`quick-access-btn ${uiSetting === 'large-text' ? 'active' : ''}`}
          onClick={toggleLargeText}
          aria-pressed={uiSetting === 'large-text'}
          title={t('largerButtons')}
        >
          {t('largerButtons')}
        </button>
        
        {/* Language Selector in Sidebar */}
        <div className="sidebar-language-selector" ref={langDropdownRef}>
          <button
            type="button"
            className="quick-access-btn language-toggle-btn"
            onClick={handleSidebarLanguageClick}
            aria-expanded={showLangDropdown}
            aria-haspopup="listbox"
            title={`${t('languages')}: ${languageDisplayNames[language] || language}`}
          >
            🌍 {languageDisplayNames[language] || language}
          </button>
          
          {showLangDropdown && (
            <ul 
              className="sidebar-language-dropdown"
              role="listbox"
              aria-label="Select language"
            >
              {LANGUAGES.map((lang) => (
                <li key={lang}>
                  <button
                    type="button"
                    onClick={() => {
                      toggleLanguage(lang);
                      setShowLangDropdown(false);
                    }}
                    role="option"
                    aria-selected={language === lang}
                    className={language === lang ? 'selected' : ''}
                  >
                    {languageDisplayNames[lang] || lang}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card intake-card">
        {/* Header */}
        <div className="card-header">
          <h2 className="intake-title">{t('emergencyCheckIn')}</h2>
          <p className="intake-subtitle">{t('completeAllFields')}</p>
          
          {/* Progress indicator */}
          <div className="step-progress" role="progressbar" aria-valuenow={currentStep} aria-valuemin="1" aria-valuemax="3">
            <div className={`step-dot ${currentStep >= 1 ? 'active' : ''}`}>1</div>
            <div className="step-line"></div>
            <div className={`step-dot ${currentStep >= 2 ? 'active' : ''}`}>2</div>
            <div className="step-line"></div>
            <div className={`step-dot ${currentStep >= 3 ? 'active' : ''}`}>3</div>
          </div>
          <div className="step-labels">
            <span>{t('yourInfo')}</span>
            <span>{t('symptoms')}</span>
            <span>{t('confirm')}</span>
          </div>
        </div>

        {/* Success Message */}
        {submitResult && (
          <div className="alert alert-success success-large" role="alert">
            <div className="success-icon">✅</div>
            <h3>{t('youreRegistered')}</h3>
            <p className="queue-position">{t('queuePosition')}: <strong>#{submitResult.queue_position}</strong></p>
            <p>{t('haveSeat')}</p>
            {submitResult.mock && <small>{t('demoMode')}</small>}
            <button 
              type="button" 
              className="btn btn-primary btn-lg" 
              onClick={resetForm}
              style={{ marginTop: '20px' }}
            >
              {t('checkInAnother')}
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="alert alert-error" role="alert">
            <strong>{t('errorPrefix')} {error}</strong>
          </div>
        )}

        {/* Gemini API Status */}
        {!geminiConfigured && currentStep === 2 && (
          <div className="alert alert-warning" role="alert">
            {t('usingAutoAssessment')}
            <div style={{ marginTop: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleSetGeminiKey}
              >
                Set Gemini API key
              </button>
            </div>
          </div>
        )}

        {!submitResult && (
          <form onSubmit={handleSubmit} aria-label="Patient check-in form" className="intake-form">
            
            {/* STEP 1: Personal Information */}
            {currentStep === 1 && (
              <fieldset className="form-step">
                <legend className="step-legend">{t('step1Legend')}</legend>
                
                <div className="form-group">
                  <div className="label-with-tts">
                    <label htmlFor="name" className="large-label">
                      {t('fullName')} <span className="required">{t('required')}</span>
                    </label>
                    <TextToSpeech 
                      text={t('fullNameTTS')}
                      size="small"
                      label="Read field instructions"
                    />
                  </div>
                  <div className="input-with-voice">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="large-input"
                      placeholder={t('enterFullName')}
                      autoComplete="name"
                      autoFocus
                    />
                    <VoiceInputUniversal
                      onTranscript={handleNameVoice}
                      inputType="name"
                      size="medium"
                      label={t('speakYourName')}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="label-with-tts">
                    <label htmlFor="email" className="large-label">
                      {t('emailAddress')}
                    </label>
                    <TextToSpeech 
                      text={t('emailTTS')}
                      size="small"
                      label="Read field instructions"
                    />
                  </div>
                  <div className="input-with-voice">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="large-input"
                      placeholder={t('emailPlaceholder')}
                      autoComplete="email"
                    />
                    <VoiceInputUniversal
                      onTranscript={handleEmailVoice}
                      inputType="email"
                      size="medium"
                      label="Speak your email"
                    />
                  </div>
                  {formData.email && !isValidEmail(formData.email) && (
                    <small className="input-error">
                      {t('invalidEmail')}
                    </small>
                  )}
                  <small className="input-help">{t('emailOptional')} • Say "name at domain dot com"</small>
                </div>

                <div className="form-group">
                  <div className="label-with-tts">
                    <label htmlFor="health_card" className="large-label">
                      {t('healthCardNumber')} <span className="required">{t('required')}</span>
                    </label>
                    <TextToSpeech 
                      text={t('healthCardTTS')}
                      size="small"
                      label="Read field instructions"
                    />
                  </div>
                  <div className="input-with-actions">
                    <input
                      type="text"
                      id="health_card"
                      name="health_card"
                      value={formData.health_card}
                      onChange={handleChange}
                      required
                      className="large-input mono-input"
                      placeholder={t('healthCardPlaceholder')}
                      maxLength="15"
                      inputMode="text"
                    />
                    <div className="input-action-buttons">
                      <VoiceInputUniversal
                        onTranscript={handleHealthCardVoice}
                        inputType="healthcard"
                        size="medium"
                        label={t('speakHealthCard')}
                      />
                      <button
                        type="button"
                        className="scan-btn"
                        onClick={() => setShowScanner(true)}
                        aria-label={t('scanHealthCard')}
                        title={t('scanHealthCard')}
                      >
                        📷
                      </button>
                    </div>
                  </div>
                  <small className="input-help">{t('healthCardHelp')}</small>
                </div>

                <div className="form-group">
                  <div className="label-with-tts">
                    <label htmlFor="birth_day" className="large-label">
                      {t('dateOfBirth')} <span className="required">{t('required')}</span>
                    </label>
                    <TextToSpeech 
                      text={t('dobTTS')}
                      size="small"
                      label="Read field instructions"
                    />
                  </div>
                  <div className="input-with-voice">
                    <input
                      type="date"
                      id="birth_day"
                      name="birth_day"
                      value={formData.birth_day}
                      onChange={handleChange}
                      required
                      className="large-input"
                      max={new Date().toISOString().split('T')[0]}
                      placeholder="YYYY-MM-DD or say 'January 15, 1990'"
                    />
                    <VoiceInputUniversal
                      onTranscript={handleDOBVoice}
                      inputType="date"
                      size="medium"
                      label="Speak your date of birth"
                    />
                  </div>
                  {formData.birth_day && (
                    <small className="input-help">
                      {t('age')}: {calculateAge(formData.birth_day)} {t('ageYearsOld')}
                    </small>
                  )}
                  <small className="input-help">
                    💡 Say "January 15, 1990" or "15th of January 1990" or "25 years ago" or type manually
                  </small>
                </div>

                <div className="form-group">
                  <div className="label-with-tts">
                    <label htmlFor="language" className="large-label">{t('preferredLanguage')}</label>
                    <TextToSpeech 
                      text={t('languageTTS')}
                      size="small"
                      label="Read field instructions"
                    />
                  </div>
                  <select
                    id="language"
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="large-input"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>{languageDisplayNames[lang] || lang}</option>
                    ))}
                    <option value="Other">{t('otherLanguage')}</option>
                  </select>
                </div>

                <div className="step-navigation">
                  <button type="button" className="btn btn-primary btn-xl" onClick={nextStep}>
                    {t('nextStep')}
                  </button>
                </div>
              </fieldset>
            )}

            {/* STEP 2: Symptoms */}
            {currentStep === 2 && (
              <fieldset className="form-step">
                <legend className="step-legend">{t('step2Legend')}</legend>
                
                <div className="form-group">
                  <div className="label-with-tts">
                    <label htmlFor="chief_complaint" className="large-label">
                      {t('describeSymptoms')} <span className="required">{t('required')}</span>
                    </label>
                    <TextToSpeech 
                      text={t('symptomsTTS')}
                      size="small"
                      label="Read field instructions"
                    />
                  </div>
                  <div className="complaint-input-wrapper">
                    <textarea
                      ref={complaintRef}
                      id="chief_complaint"
                      name="chief_complaint"
                      value={formData.chief_complaint}
                      onChange={handleChange}
                      required
                      className="large-input complaint-textarea"
                      placeholder={t('symptomsPlaceholder')}
                      rows={4}
                    />
                    <VoiceInput 
                      onTranscript={handleVoiceInput}
                      aria-label={t('tapToSpeak')}
                    />
                  </div>
                  <small className="input-help">
                    {t('symptomsTip')}
                  </small>
                  {formData.chief_complaint && (
                    <div className="read-back-section">
                      <TextToSpeech 
                        text={`${t('yourSymptoms')} ${formData.chief_complaint}`}
                        size="small"
                        label={t('readBackLabel')}
                      />
                      <span className="read-back-label">{t('listenToEntry')}</span>
                    </div>
                  )}
                </div>

                {/* Calculate triage button */}
                <div className="form-group">
                  <button
                    type="button"
                    className="btn btn-secondary btn-lg"
                    onClick={calculateTriage}
                    disabled={isCalculatingTriage || !formData.chief_complaint.trim()}
                  >
                    {isCalculatingTriage ? (
                      <>
                        <span className="spinner small"></span>
                        {t('assessing')}
                      </>
                    ) : (
                      `🔍 ${t('assessSymptoms')}`
                    )}
                  </button>
                </div>

                {/* Triage Result */}
                {triageLevel && (
                  <div className={`triage-result triage-result-${triageLevel}`} role="status">
                    <div className="triage-icon">{getTriageLevelInfo(triageLevel).icon}</div>
                    <div className="triage-info">
                      <span className={`triage-badge ${getTriageLevelInfo(triageLevel).color}`}>
                        Level {triageLevel} - {getTriageLevelInfo(triageLevel).label}
                      </span>
                      <p>{getTriageLevelInfo(triageLevel).description}</p>
                    </div>
                    <TextToSpeech 
                      text={`${t('triageAssessment')}: ${triageLevel}, ${getTriageLevelInfo(triageLevel).label}. ${getTriageLevelInfo(triageLevel).description}`}
                      size="medium"
                      label="Read triage result"
                    />
                  </div>
                )}

                <div className="step-navigation">
                  <button type="button" className="btn btn-outline btn-lg" onClick={prevStep}>
                    {t('previousStep')}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary btn-xl" 
                    onClick={nextStep}
                    disabled={!triageLevel}
                  >
                    {t('step3Legend')} →
                  </button>
                </div>
              </fieldset>
            )}

            {/* STEP 3: Review & Accessibility */}
            {currentStep === 3 && (
              <fieldset className="form-step">
                <legend className="step-legend">{t('step3Legend')}</legend>
                
                {/* Summary */}
                <div className="review-summary">
                  <h3>{t('reviewInfo')}</h3>
                  <div className="summary-grid">
                    <div className="summary-item">
                      <span className="summary-label">{t('name')}:</span>
                      <span className="summary-value">{formData.name}</span>
                    </div>
                    {formData.email && (
                      <div className="summary-item">
                        <span className="summary-label">{t('email')}:</span>
                        <span className="summary-value">{formData.email}</span>
                      </div>
                    )}
                    <div className="summary-item">
                      <span className="summary-label">{t('healthCard')}:</span>
                      <span className="summary-value mono">{formData.health_card}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">{t('dob')}:</span>
                      <span className="summary-value">{formData.birth_day} ({t('age')}: {calculateAge(formData.birth_day)})</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">{t('preferredLanguage')}:</span>
                      <span className="summary-value">{languageDisplayNames[formData.language] || formData.language}</span>
                    </div>
                    <div className="summary-item full-width">
                      <span className="summary-label">{t('chiefComplaint')}:</span>
                      <span className="summary-value">{formData.chief_complaint}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">{t('priority')}:</span>
                      <span className={`triage-badge ${getTriageLevelInfo(triageLevel).color}`}>
                        Level {triageLevel} - {getTriageLevelInfo(triageLevel).label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Accessibility Detection Notice */}
                {(theme === 'high-contrast' || uiSetting === 'large-text') && (
                  <div className="accessibility-notice">
                    <p>📋 We've noted your accessibility preferences:</p>
                    <ul>
                      {theme === 'high-contrast' && <li>High contrast display</li>}
                      {uiSetting === 'large-text' && <li>Large text</li>}
                    </ul>
                    <p>Our staff will ensure you receive appropriate assistance.</p>
                  </div>
                )}
                {(theme === 'dark-mode' || uiSetting === 'large-text') && (
                  <div className="accessibility-notice">
                    <p>📋 We've noted your accessibility preferences:</p>
                    <ul>
                      {theme === 'dark-mode' && <li>Dark Mode display</li>}
                      {uiSetting === 'large-text' && <li>Large text</li>}
                    </ul>
                    <p>Our staff will ensure you receive appropriate assistance.</p>
                  </div>
                )}

                {/* Additional Accessibility Options - Select All That Apply */}
                <div className="form-group">
                  <label className="large-label">Do you need any special assistance? (Select all that apply)</label>
                  <div className="accessibility-options checkbox-grid">
                    <label className={`option-card ${formData.accessibility_needs?.includes('Visual Impairment') ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        name="accessibility_needs"
                        value="Visual Impairment"
                        checked={formData.accessibility_needs?.includes('Visual Impairment')}
                        onChange={() => handleAccessibilityChange('Visual Impairment')}
                      />
                      <span className="option-content">
                        <span className="option-icon">👁️</span>
                        <span className="option-text">Visual assistance</span>
                      </span>
                    </label>
                    <label className={`option-card ${formData.accessibility_needs?.includes('Hearing Impairment') ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        name="accessibility_needs"
                        value="Hearing Impairment"
                        checked={formData.accessibility_needs?.includes('Hearing Impairment')}
                        onChange={() => handleAccessibilityChange('Hearing Impairment')}
                      />
                      <span className="option-content">
                        <span className="option-icon">👂</span>
                        <span className="option-text">Hearing assistance</span>
                      </span>
                    </label>
                    <label className={`option-card ${formData.accessibility_needs?.includes('Mobility') ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        name="accessibility_needs"
                        value="Mobility"
                        checked={formData.accessibility_needs?.includes('Mobility')}
                        onChange={() => handleAccessibilityChange('Mobility')}
                      />
                      <span className="option-content">
                        <span className="option-icon">🦽</span>
                        <span className="option-text">Mobility assistance</span>
                      </span>
                    </label>
                    <label className={`option-card ${formData.accessibility_needs?.includes('Cognitive') ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        name="accessibility_needs"
                        value="Cognitive"
                        checked={formData.accessibility_needs?.includes('Cognitive')}
                        onChange={() => handleAccessibilityChange('Cognitive')}
                      />
                      <span className="option-content">
                        <span className="option-icon">🧠</span>
                        <span className="option-text">Cognitive support</span>
                      </span>
                    </label>
                    <label className={`option-card ${formData.accessibility_needs?.includes('Language') ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        name="accessibility_needs"
                        value="Language"
                        checked={formData.accessibility_needs?.includes('Language')}
                        onChange={() => handleAccessibilityChange('Language')}
                      />
                      <span className="option-content">
                        <span className="option-icon">🗣️</span>
                        <span className="option-text">Language/interpreter</span>
                      </span>
                    </label>
                  </div>
                  {formData.accessibility_needs?.length === 0 && (
                    <small className="input-help">No special assistance needed - that's okay!</small>
                  )}
                  {formData.accessibility_needs?.length > 0 && (
                    <small className="input-help">
                      Selected: {formData.accessibility_needs.join(', ')}
                    </small>
                  )}
                </div>

                <div className="step-navigation">
                  <button type="button" className="btn btn-outline btn-lg" onClick={prevStep}>
                    {t('previousStep')}
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success btn-xl submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner small"></span>
                        {t('submitting')}
                      </>
                    ) : (
                      `✓ ${t('submitCheckIn')}`
                    )}
                  </button>
                </div>
              </fieldset>
            )}
          </form>
        )}

        {/* Help Button - Always visible */}
        <button 
          type="button" 
          className="help-button"
          onClick={() => alert('Please ask a staff member for assistance.')}
          aria-label="Get help from staff"
        >
          🙋 Need Help?
        </button>
      </div>

      {/* Health Card Scanner Modal */}
      {showScanner && (
        <HealthCardScanner
          onScan={handleHealthCardScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Tablet-optimized styles */}
      <style>{`
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        .tablet-optimized {
          max-width: 800px;
          margin: 0 auto;
          padding: var(--spacing-md);
        }

=======
        /* Label with TTS button */
        .label-with-tts {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-sm);
        }

        .label-with-tts .large-label {
          margin-bottom: 0;
        }

        /* Input with voice button */
        .input-with-voice {
          display: flex;
          gap: var(--spacing-sm);
          align-items: stretch;
        }

        .input-with-voice .large-input {
          flex: 1;
        }

        /* Input with multiple action buttons (voice + camera) */
        .input-with-actions {
          display: flex;
          gap: var(--spacing-sm);
          align-items: stretch;
        }

        .input-with-actions .large-input {
          flex: 1;
        }

        .input-action-buttons {
          display: flex;
          gap: var(--spacing-xs);
        }

        /* Scan button for health card */
        .scan-btn {
          width: 60px;
          background: var(--secondary-color);
          border: 2px solid var(--border-color);
          border-radius: 12px;
          font-size: 24px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .scan-btn:hover {
          background: var(--primary-color);
          border-color: var(--primary-color);
        }

        .scan-btn:active {
          transform: scale(0.95);
        }

        /* Read-back section for symptoms */
        .read-back-section {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-top: var(--spacing-sm);
          padding: var(--spacing-sm);
          background: var(--background-color);
          border-radius: 8px;
        }

        .read-back-label {
          font-size: 0.9em;
          color: var(--text-secondary);
        }
        
         /* Fixed sidebar accessibility quick actions */
        .accessibility-quick-sidebar {
          height: 50%; 
          width: 160px;
          position: fixed; 
          z-index: 1; 
          top: 1; 
          right: 0;
          background-color: #8b8b8b; 
          overflow-x: hidden;
          padding-top: 10px;
          padding-left: 7.5px;
          opacity: 0.8;
        } 

        .quick-access-btn {
          width: 140px;
          height: 44px;
          padding: 20px;
          display: flex;
          margin-top: 8px;
          margin-left: auto;
          margin-right: auto;
          margin-bottom: 8px;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          border: 2px solid var(--primary-color);
          background: opaque;
          color: #000000;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .quick-access-btn:hover,
        .quick-access-btn.active,
        .quick-access-btn[aria-pressed="true"] {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }

        /* Sidebar Language Selector */
        .sidebar-language-selector {
          position: relative;
          width: 100%;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #666;
        }

        .language-toggle-btn {
          width: 140px !important;
          font-size: 14px !important;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sidebar-language-dropdown {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          border: 1px solid #ccc;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          list-style: none;
          padding: 8px 0;
          margin: 8px 0 0 0;
          min-width: 140px;
          max-height: 300px;
          overflow-y: auto;
          z-index: 1000;
        }

        .sidebar-language-dropdown li button {
          display: block;
          width: 100%;
          padding: 10px 12px;
          border: none;
          background: transparent;
          text-align: left;
          cursor: pointer;
          font-size: 14px;
          color: #333;
        }

        .sidebar-language-dropdown li button:hover {
          background: #e3f2fd;
        }

        .sidebar-language-dropdown li button.selected {
          background: #e3f2fd;
          font-weight: bold;
        }

        /* Checkbox grid for accessibility options */
        .checkbox-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
        }

        .option-card input[type="checkbox"] {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .option-card.selected {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }

        .option-card.selected .option-text {
          color: white;
        }

        .intake-card {
          padding: var(--spacing-xl);
        }

        .intake-title {
          font-size: var(--font-size-2xl);
          text-align: center;
          margin-bottom: var(--spacing-sm);
        }

        .intake-subtitle {
          text-align: center;
          color: var(--text-secondary);
          margin-bottom: var(--spacing-lg);
        }

        /* Progress Steps */
        .step-progress {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          margin-bottom: var(--spacing-sm);
        }

        .step-dot {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--border-color);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          transition: all 0.3s;
        }

        .step-dot.active {
          background: var(--primary-color);
          color: white;
        }

        .step-line {
          width: 60px;
          height: 4px;
          background: var(--border-color);
        }

        .step-labels {
          display: flex;
          justify-content: space-between;
          padding: 0 20px;
          font-size: 0.85em;
          color: var(--text-secondary);
          margin-bottom: var(--spacing-lg);
        }

        /* Form Steps */
        .form-step {
          border: none;
          padding: 0;
          margin: 0;
        }

        .step-legend {
          font-size: var(--font-size-xl);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-lg);
          text-align: center;
        }

        /* Large inputs for touch */
        .large-label {
          font-size: var(--font-size-lg);
          font-weight: 600;
          margin-bottom: var(--spacing-sm);
          display: block;
        }

        .required {
          color: var(--danger-color);
        }

        .large-input {
          width: 100%;
          padding: var(--spacing-lg);
          font-size: var(--font-size-lg);
          border: 2px solid var(--border-color);
          border-radius: 12px;
          background: var(--input-background);
          color: var(--text-primary);
          transition: border-color 0.2s;
        }

        .large-input:focus {
          border-color: var(--primary-color);
          outline: none;
        }

        .mono-input {
          font-family: 'Courier New', monospace;
          letter-spacing: 2px;
        }

        .input-help {
          display: block;
          margin-top: var(--spacing-sm);
          color: var(--text-secondary);
          font-size: 0.9em;
        }

        /* Complaint input with voice */
        .complaint-input-wrapper {
          display: flex;
          gap: var(--spacing-md);
          align-items: flex-start;
        }

        .complaint-textarea {
          flex: 1;
          min-height: 120px;
          resize: vertical;
        }

        /* Buttons */
        .btn-xl {
          padding: var(--spacing-lg) var(--spacing-xl);
          font-size: var(--font-size-lg);
          min-width: 200px;
        }

        .btn-lg {
          padding: var(--spacing-md) var(--spacing-lg);
          font-size: var(--font-size-base);
        }

        .step-navigation {
          display: flex;
          justify-content: space-between;
          gap: var(--spacing-md);
          margin-top: var(--spacing-xl);
          flex-wrap: wrap;
        }

        .step-navigation .btn:only-child {
          margin-left: auto;
        }

        /* Triage Result */
        .triage-result {
          display: flex;
          align-items: center;
          gap: var(--spacing-lg);
          padding: var(--spacing-lg);
          border-radius: 12px;
          margin-top: var(--spacing-md);
          background: var(--background-color);
          border: 2px solid var(--border-color);
        }

        .triage-icon {
          font-size: 48px;
        }

        .triage-info p {
          margin-top: var(--spacing-sm);
          color: var(--text-secondary);
        }

        /* Review Summary */
        .review-summary {
          background: var(--background-color);
          padding: var(--spacing-lg);
          border-radius: 12px;
          margin-bottom: var(--spacing-lg);
        }

        .review-summary h3 {
          margin-bottom: var(--spacing-md);
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--spacing-md);
        }

        .summary-item {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .summary-item.full-width {
          grid-column: span 2;
        }

        .summary-label {
          font-size: 0.85em;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .summary-value {
          font-size: var(--font-size-base);
          color: var(--text-primary);
        }

        .summary-value.mono {
          font-family: 'Courier New', monospace;
        }

        /* Accessibility Options */
        .accessibility-notice {
          background: #dbeafe;
          border: 1px solid #93c5fd;
          color: #1e40af;
          padding: var(--spacing-md);
          border-radius: 8px;
          margin-bottom: var(--spacing-lg);
        }

        .accessibility-notice ul {
          margin: var(--spacing-sm) 0;
          padding-left: var(--spacing-lg);
        }

        .accessibility-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: var(--spacing-md);
          margin-top: var(--spacing-sm);
        }

        .option-card {
          cursor: pointer;
        }

        .option-card input {
          position: absolute;
          opacity: 0;
        }

        .option-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-lg);
          border: 2px solid var(--border-color);
          border-radius: 12px;
          transition: all 0.2s;
          background: var(--card-background);
        }

        .option-card input:checked + .option-content {
          border-color: var(--primary-color);
          background: rgba(37, 99, 235, 0.1);
        }

        .option-card:hover .option-content {
          border-color: var(--primary-color);
        }

        .option-icon {
          font-size: 32px;
        }

        .option-text {
          text-align: center;
          font-weight: 500;
        }

        /* Success State */
        .success-large {
          text-align: center;
          padding: var(--spacing-xl);
        }

        .success-icon {
          font-size: 64px;
          margin-bottom: var(--spacing-md);
        }

        .success-large h3 {
          font-size: var(--font-size-xl);
          margin-bottom: var(--spacing-md);
        }

        .queue-position {
          font-size: var(--font-size-2xl);
          margin-bottom: var(--spacing-md);
        }

        .queue-position strong {
          color: var(--primary-color);
        }

        /* Help Button */
        .help-button {
          position: fixed;
          bottom: 20px;
          right: 20px;
          padding: var(--spacing-md) var(--spacing-lg);
          background: var(--warning-color);
          color: #1e293b;
          border: none;
          border-radius: 30px;
          font-size: var(--font-size-lg);
          font-weight: 600;
          cursor: pointer;
          box-shadow: var(--shadow-lg);
          z-index: 100;
          transition: transform 0.2s;
        }

        .help-button:hover {
          transform: scale(1.05);
        }

        /* Spinner */
        .spinner.small {
          width: 20px;
          height: 20px;
          margin-right: var(--spacing-sm);
          display: inline-block;
        }

        /* Submit button */
        .submit-btn {
          background: var(--success-color);
        }

        .submit-btn:hover {
          background: #16a34a;
        }

        /* Responsive for smaller tablets */
        @media (max-width: 600px) {
          .summary-grid {
            grid-template-columns: 1fr;
          }
          
          .summary-item.full-width {
            grid-column: span 1;
          }
          
          .accessibility-options {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .step-navigation {
            flex-direction: column;
          }
          
          .step-navigation .btn {
            width: 100%;
          }

          /* On small screens collapse to bottom-left to avoid clashing with help button */
          .accessibility-quick-sidebar {
            right: auto;
            left: 20px;
            bottom: 20px;
            top: auto;
            transform: none;
            flex-direction: row;
            padding: calc(var(--spacing-sm) / 2);
          }
          .accessibility-quick-sidebar .quick-bar-vis {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default PatientIntake;
