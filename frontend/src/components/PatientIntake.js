import React, { useState, useRef, useCallback, useEffect } from 'react';
import { getTriageLevel, isGeminiConfigured } from '../services/gemini';
import { submitPatientIntake } from '../services/api';
import { useAccessibility } from '../App';
import VoiceInput from './VoiceInput';
import TextToSpeech, { useTTS } from './TextToSpeech';
import VoiceInputUniversal from './VoiceInputUniversal';
import HealthCardScanner from './HealthCardScanner';

const PatientIntake = () => {
  const { theme, uiSetting, toggleHighContrast, toggleDarkMode, toggleLargeText } = useAccessibility();
  const { speak, stop, isSpeaking } = useTTS();
  
  // Form state with new fields
  const [formData, setFormData] = useState({
    name: '',
    health_card: '',
    birth_day: '',
    chief_complaint: '',
    accessibility_profile: 'None',
    preferred_mode: 'Standard',
    language: 'English',
  });
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalculatingTriage, setIsCalculatingTriage] = useState(false);
  const [triageLevel, setTriageLevel] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [error, setError] = useState(null);
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

  // Handle voice input for health card
  const handleHealthCardVoice = useCallback((healthCard) => {
    setFormData(prev => ({
      ...prev,
      health_card: healthCard,
    }));
  }, []);

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
        age: age,
        health_card: formData.health_card,
        birth_day: formData.birth_day,
        chief_complaint: formData.chief_complaint.trim(),
        triage_level: triageLevel,
        accessibility_profile: formData.accessibility_profile,
        preferred_mode: formData.preferred_mode,
        ui_setting: uiSetting === 'large-text' ? 'Large_Text' : 
                    theme === 'high-contrast' ? 'High_Contrast' : 
                    theme === 'dark-mode' ? 'Dark_Mode' : 'Standard',
        language: formData.language,
        timestamp: Math.floor(Date.now() / 1000),
      };
      
      const result = await submitPatientIntake(patient);
      setSubmitResult(result);
      announceToScreenReader(`You have been registered. Your queue position is ${result.queue_position}`);
      
      // Reset form after delay
      setTimeout(() => {
        resetForm();
      }, 8000);
      
    } catch (err) {
      setError('Failed to register. Please try again or ask for help.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      name: '',
      health_card: '',
      birth_day: '',
      chief_complaint: '',
      accessibility_profile: 'None',
      preferred_mode: 'Standard',
      language: 'English',
    });
    setTriageLevel(null);
    setSubmitResult(null);
    setError(null);
    setCurrentStep(1);
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

  // Get triage level description
  const getTriageLevelInfo = (level) => {
    const info = {
      1: { label: 'Critical', description: 'You will be seen immediately', color: 'triage-1', icon: '🚨' },
      2: { label: 'Emergency', description: 'You will be seen very soon', color: 'triage-2', icon: '⚠️' },
      3: { label: 'Urgent', description: 'Wait time: approximately 30 minutes', color: 'triage-3', icon: '🟡' },
      4: { label: 'Less Urgent', description: 'Wait time: approximately 1-2 hours', color: 'triage-4', icon: '🟢' },
      5: { label: 'Non-Urgent', description: 'Wait time: may be several hours', color: 'triage-5', icon: '🔵' },
    };
    return info[level] || { label: 'Unknown', description: '', color: '', icon: '' };
  };

  // Navigation between steps
  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        setError('Please enter your full name');
        return;
      }
      if (!formData.health_card || !isValidHealthCard(formData.health_card)) {
        setError('Please enter a valid health card number');
        return;
      }
      if (!formData.birth_day) {
        setError('Please enter your date of birth');
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

  return (
    <div className="patient-intake tablet-optimized">
      {/* Accessibility Quick Actions - Always visible on iPad */}
      <div className="accessibility-quick-sidebar">
        <span className="quick-sidebar-label">Accessibility Settings</span>
        <button
          type="button"
          className={`quick-access-btn ${theme === 'dark-mode' ? 'active' : ''}`}
          onClick={toggleDarkMode}
          aria-pressed={theme === 'dark-mode'}
          title="Toggle dark mode"
        >
          🌙 Dark Mode
        </button>
        <button
          type="button"
          className={`quick-access-btn ${theme === 'high-contrast' ? 'active' : ''}`}
          onClick={toggleHighContrast}
          aria-pressed={theme === 'high-contrast'}
          title="Toggle high contrast"
        >
          🔲 High Contrast
        </button>
        <button
          type="button"
          className={`quick-access-btn ${uiSetting === 'large-text' ? 'active' : ''}`}
          onClick={toggleLargeText}
          aria-pressed={uiSetting === 'large-text'}
          title="Toggle large text"
        >
          🔤 Larger Buttons
        </button>
         <button
          type="button"
          className={`quick-access-btn ${uiSetting === 'large-text' ? 'active' : ''}`}
          onClick={toggleLargeText}
          aria-pressed={uiSetting === 'large-text'}
          title="Languages"
        >
          🌍 Languages
        </button>
      </div>

      <div className="card intake-card">
        {/* Header */}
        <div className="card-header">
          <h2 className="intake-title">🏥 Emergency Check-In</h2>
          <p className="intake-subtitle">Please complete all fields below</p>
          
          {/* Progress indicator */}
          <div className="step-progress" role="progressbar" aria-valuenow={currentStep} aria-valuemin="1" aria-valuemax="3">
            <div className={`step-dot ${currentStep >= 1 ? 'active' : ''}`}>1</div>
            <div className="step-line"></div>
            <div className={`step-dot ${currentStep >= 2 ? 'active' : ''}`}>2</div>
            <div className="step-line"></div>
            <div className={`step-dot ${currentStep >= 3 ? 'active' : ''}`}>3</div>
          </div>
          <div className="step-labels">
            <span>Your Info</span>
            <span>Symptoms</span>
            <span>Confirm</span>
          </div>
        </div>

        {/* Success Message */}
        {submitResult && (
          <div className="alert alert-success success-large" role="alert">
            <div className="success-icon">✅</div>
            <h3>You're Registered!</h3>
            <p className="queue-position">Queue Position: <strong>#{submitResult.queue_position}</strong></p>
            <p>Please have a seat. We will call your name when it's your turn.</p>
            {submitResult.mock && <small>(Demo Mode)</small>}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="alert alert-error" role="alert">
            <strong>⚠️ {error}</strong>
          </div>
        )}

        {/* Gemini API Status */}
        {!isGeminiConfigured() && currentStep === 2 && (
          <div className="alert alert-warning" role="alert">
            Using automatic symptom assessment
          </div>
        )}

        {!submitResult && (
          <form onSubmit={handleSubmit} aria-label="Patient check-in form" className="intake-form">
            
            {/* STEP 1: Personal Information */}
            {currentStep === 1 && (
              <fieldset className="form-step">
                <legend className="step-legend">Step 1: Your Information</legend>
                
                <div className="form-group">
                  <div className="label-with-tts">
                    <label htmlFor="name" className="large-label">
                      Full Name <span className="required">*</span>
                    </label>
                    <TextToSpeech 
                      text="Full Name. Please enter your first and last name."
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
                      placeholder="Enter your full name"
                      autoComplete="name"
                      autoFocus
                    />
                    <VoiceInputUniversal
                      onTranscript={handleNameVoice}
                      inputType="name"
                      size="medium"
                      label="Speak your name"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="label-with-tts">
                    <label htmlFor="health_card" className="large-label">
                      Health Card Number <span className="required">*</span>
                    </label>
                    <TextToSpeech 
                      text="Health Card Number. Format is 4 digits, dash, 2 digits, dash, 3 digits, dash, 2 letters. Example: 1234-56-789-AB. You can speak the numbers or use the camera to scan your card."
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
                      placeholder="####-##-###-XX"
                      maxLength="14"
                      inputMode="text"
                    />
                    <div className="input-action-buttons">
                      <VoiceInputUniversal
                        onTranscript={handleHealthCardVoice}
                        inputType="healthcard"
                        size="medium"
                        label="Speak health card number"
                      />
                      <button
                        type="button"
                        className="scan-btn"
                        onClick={() => setShowScanner(true)}
                        aria-label="Scan health card with camera"
                        title="Use camera to scan your health card"
                      >
                        📷
                      </button>
                    </div>
                  </div>
                  <small className="input-help">Format: 1234-56-789-AB • Say numbers or scan your card</small>
                </div>

                <div className="form-group">
                  <div className="label-with-tts">
                    <label htmlFor="birth_day" className="large-label">
                      Date of Birth <span className="required">*</span>
                    </label>
                    <TextToSpeech 
                      text="Date of Birth. This will be automatically filled when you scan your health card, or you can select a date manually."
                      size="small"
                      label="Read field instructions"
                    />
                  </div>
                  <input
                    type="date"
                    id="birth_day"
                    name="birth_day"
                    value={formData.birth_day}
                    onChange={handleChange}
                    required
                    className="large-input"
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {formData.birth_day && (
                    <small className="input-help">
                      Age: {calculateAge(formData.birth_day)} years old
                    </small>
                  )}
                  <small className="input-help">
                    💡 Tip: Scan your health card above to auto-fill this field
                  </small>
                </div>

                <div className="form-group">
                  <div className="label-with-tts">
                    <label htmlFor="language" className="large-label">Preferred Language</label>
                    <TextToSpeech 
                      text="Preferred Language. Select the language you are most comfortable with."
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
                    <option value="English">English</option>
                    <option value="Spanish">Español</option>
                    <option value="French">Français</option>
                    <option value="Mandarin">中文</option>
                    <option value="Arabic">العربية</option>
                    <option value="Hindi">हिन्दी</option>
                    <option value="Portuguese">Português</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="step-navigation">
                  <button type="button" className="btn btn-primary btn-xl" onClick={nextStep}>
                    Next Step →
                  </button>
                </div>
              </fieldset>
            )}

            {/* STEP 2: Symptoms */}
            {currentStep === 2 && (
              <fieldset className="form-step">
                <legend className="step-legend">Step 2: What brings you in today?</legend>
                
                <div className="form-group">
                  <div className="label-with-tts">
                    <label htmlFor="chief_complaint" className="large-label">
                      Describe your symptoms <span className="required">*</span>
                    </label>
                    <TextToSpeech 
                      text="Describe your symptoms. Tell us what's wrong. You can type or tap the microphone to speak. Be as detailed as possible about your pain, how long you've had it, and any other symptoms."
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
                      placeholder="Tell us what's wrong... (e.g., 'I have a bad headache and feel dizzy')"
                      rows={4}
                    />
                    <VoiceInput 
                      onTranscript={handleVoiceInput}
                      aria-label="Tap to speak your symptoms"
                    />
                  </div>
                  <small className="input-help">
                    💡 Tip: Tap the microphone to speak instead of typing
                  </small>
                  {formData.chief_complaint && (
                    <div className="read-back-section">
                      <TextToSpeech 
                        text={`Your symptoms: ${formData.chief_complaint}`}
                        size="small"
                        label="Read back what I entered"
                      />
                      <span className="read-back-label">Listen to your entry</span>
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
                        Assessing...
                      </>
                    ) : (
                      '🔍 Assess My Symptoms'
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
                      text={`Your triage level is ${triageLevel}, ${getTriageLevelInfo(triageLevel).label}. ${getTriageLevelInfo(triageLevel).description}`}
                      size="medium"
                      label="Read triage result"
                    />
                  </div>
                )}

                <div className="step-navigation">
                  <button type="button" className="btn btn-outline btn-lg" onClick={prevStep}>
                    ← Back
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary btn-xl" 
                    onClick={nextStep}
                    disabled={!triageLevel}
                  >
                    Review & Submit →
                  </button>
                </div>
              </fieldset>
            )}

            {/* STEP 3: Review & Accessibility */}
            {currentStep === 3 && (
              <fieldset className="form-step">
                <legend className="step-legend">Step 3: Review & Submit</legend>
                
                {/* Summary */}
                <div className="review-summary">
                  <h3>Please confirm your information:</h3>
                  <div className="summary-grid">
                    <div className="summary-item">
                      <span className="summary-label">Name:</span>
                      <span className="summary-value">{formData.name}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Health Card:</span>
                      <span className="summary-value mono">{formData.health_card}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Date of Birth:</span>
                      <span className="summary-value">{formData.birth_day} (Age: {calculateAge(formData.birth_day)})</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Language:</span>
                      <span className="summary-value">{formData.language}</span>
                    </div>
                    <div className="summary-item full-width">
                      <span className="summary-label">Reason for Visit:</span>
                      <span className="summary-value">{formData.chief_complaint}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Priority Level:</span>
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

                {/* Additional Accessibility Options */}
                <div className="form-group">
                  <label className="large-label">Do you need any special assistance?</label>
                  <div className="accessibility-options">
                    <label className="option-card">
                      <input
                        type="radio"
                        name="accessibility_profile"
                        value="None"
                        checked={formData.accessibility_profile === 'None'}
                        onChange={handleChange}
                      />
                      <span className="option-content">
                        <span className="option-icon">👤</span>
                        <span className="option-text">No special assistance needed</span>
                      </span>
                    </label>
                    <label className="option-card">
                      <input
                        type="radio"
                        name="accessibility_profile"
                        value="Visual Impairment"
                        checked={formData.accessibility_profile === 'Visual Impairment'}
                        onChange={handleChange}
                      />
                      <span className="option-content">
                        <span className="option-icon">👁️</span>
                        <span className="option-text">Visual assistance</span>
                      </span>
                    </label>
                    <label className="option-card">
                      <input
                        type="radio"
                        name="accessibility_profile"
                        value="Hearing Impairment"
                        checked={formData.accessibility_profile === 'Hearing Impairment'}
                        onChange={handleChange}
                      />
                      <span className="option-content">
                        <span className="option-icon">👂</span>
                        <span className="option-text">Hearing assistance</span>
                      </span>
                    </label>
                    <label className="option-card">
                      <input
                        type="radio"
                        name="accessibility_profile"
                        value="Mobility"
                        checked={formData.accessibility_profile === 'Mobility'}
                        onChange={handleChange}
                      />
                      <span className="option-content">
                        <span className="option-icon">🦽</span>
                        <span className="option-text">Mobility assistance</span>
                      </span>
                    </label>
                    <label className="option-card">
                      <input
                        type="radio"
                        name="accessibility_profile"
                        value="Cognitive"
                        checked={formData.accessibility_profile === 'Cognitive'}
                        onChange={handleChange}
                      />
                      <span className="option-content">
                        <span className="option-icon">🧠</span>
                        <span className="option-text">Cognitive support</span>
                      </span>
                    </label>
                  </div>
                </div>

                <div className="step-navigation">
                  <button type="button" className="btn btn-outline btn-lg" onClick={prevStep}>
                    ← Back
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success btn-xl submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner small"></span>
                        Registering...
                      </>
                    ) : (
                      '✓ Complete Check-In'
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
          background-color: #424242; 
          overflow-x: hidden;
          padding-top: 10px;
        }

        .accessibility-quick-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          background: var(--card-background);
          border-radius: 12px;
          margin-bottom: var(--spacing-md);
          flex-wrap: wrap;
          border: 2px solid var(--border-color);
        }

        .accessibility-quick-sidebar .quick-bar-vis {
          padding: 6px 8px 6px 16px;
          text-decoration: none;
          font-size: 25px;
          color: #f1f1f1;
          display: block;
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
          color: #565656;
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
