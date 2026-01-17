import React, { useState, useRef, useCallback } from 'react';
import { getTriageLevel, isGeminiConfigured } from '../services/gemini';
import { submitPatientIntake } from '../services/api';
import { useAccessibility } from '../App';
import VoiceInput from './VoiceInput';

const PatientIntake = () => {
  const { theme, uiSetting } = useAccessibility();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    age: '',
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
  
  const complaintRef = useRef(null);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
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
    
    // Validate form
    if (!formData.name.trim() || !formData.age || !formData.chief_complaint.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Ensure triage level is calculated
    if (!triageLevel) {
      setError('Please calculate the triage level first');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Build patient object according to data contract
      const patient = {
        id: Date.now(), // Generate unique ID
        name: formData.name.trim(),
        age: parseInt(formData.age, 10),
        chief_complaint: formData.chief_complaint.trim(),
        triage_level: triageLevel,
        accessibility_profile: formData.accessibility_profile,
        preferred_mode: formData.preferred_mode,
        ui_setting: uiSetting === 'large-text' ? 'Large_Text' : 
                    theme === 'high-contrast' ? 'High_Contrast' : 'Default',
        language: formData.language,
        timestamp: Math.floor(Date.now() / 1000),
      };
      
      const result = await submitPatientIntake(patient);
      setSubmitResult(result);
      
      // Announce success
      announceToScreenReader(`Patient registered successfully. Queue position: ${result.queue_position}`);
      
      // Reset form after successful submission
      setTimeout(() => {
        resetForm();
      }, 5000);
      
    } catch (err) {
      setError('Failed to submit patient. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      name: '',
      age: '',
      chief_complaint: '',
      accessibility_profile: 'None',
      preferred_mode: 'Standard',
      language: 'English',
    });
    setTriageLevel(null);
    setSubmitResult(null);
    setError(null);
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
      1: { label: 'Resuscitation', description: 'Immediate life-threatening - requires immediate care', color: 'triage-1' },
      2: { label: 'Emergent', description: 'Potentially life-threatening - rapid intervention needed', color: 'triage-2' },
      3: { label: 'Urgent', description: 'Serious condition - treatment within 30 minutes', color: 'triage-3' },
      4: { label: 'Less Urgent', description: 'Condition can wait 1-2 hours', color: 'triage-4' },
      5: { label: 'Non-Urgent', description: 'Minor condition - can wait or see primary care', color: 'triage-5' },
    };
    return info[level] || { label: 'Unknown', description: '', color: '' };
  };

  return (
    <div className="patient-intake">
      <div className="card">
        <div className="card-header">
          <h2>Patient Check-In</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
            Complete the form below to register a new patient
          </p>
        </div>

        {/* Success Message */}
        {submitResult && (
          <div className="alert alert-success" role="alert">
            <strong>✅ Patient registered successfully!</strong>
            <br />
            Queue Position: <strong>{submitResult.queue_position}</strong>
            {submitResult.mock && <span> (Demo Mode - Backend not connected)</span>}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="alert alert-error" role="alert">
            ❌ {error}
          </div>
        )}

        {/* Gemini API Warning */}
        {!isGeminiConfigured() && (
          <div className="alert alert-warning" role="alert">
            ⚠️ Gemini API key not configured. Using fallback triage assessment.
            <br />
            <small>Set REACT_APP_GEMINI_API_KEY in your environment to enable AI triage.</small>
          </div>
        )}

        <form onSubmit={handleSubmit} aria-label="Patient intake form">
          {/* Patient Information */}
          <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
            <legend className="sr-only">Patient Information</legend>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">
                  Full Name <span aria-hidden="true" style={{ color: 'var(--danger-color)' }}>*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  placeholder="Enter patient's full name"
                  autoComplete="name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="age">
                  Age <span aria-hidden="true" style={{ color: 'var(--danger-color)' }}>*</span>
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  min="0"
                  max="150"
                  placeholder="Age in years"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="chief_complaint">
                Chief Complaint <span aria-hidden="true" style={{ color: 'var(--danger-color)' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <textarea
                  ref={complaintRef}
                  id="chief_complaint"
                  name="chief_complaint"
                  value={formData.chief_complaint}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  placeholder="Describe the main reason for visit (e.g., 'Severe chest pain for 2 hours')"
                  aria-describedby="complaint-help"
                  style={{ flex: 1 }}
                />
                <VoiceInput 
                  onTranscript={handleVoiceInput}
                  aria-label="Use voice input for chief complaint"
                />
              </div>
              <small id="complaint-help" style={{ color: 'var(--text-secondary)' }}>
                Be specific about symptoms, duration, and severity
              </small>
            </div>

            {/* Calculate Triage Button */}
            <div className="form-group">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={calculateTriage}
                disabled={isCalculatingTriage || !formData.chief_complaint.trim()}
                aria-busy={isCalculatingTriage}
              >
                {isCalculatingTriage ? (
                  <>
                    <span className="spinner" style={{ width: '20px', height: '20px', margin: 0 }}></span>
                    Calculating Triage Level...
                  </>
                ) : (
                  '🤖 Calculate Triage Level (AI)'
                )}
              </button>
            </div>

            {/* Triage Level Display */}
            {triageLevel && (
              <div 
                className="alert alert-info" 
                role="status" 
                aria-live="polite"
                style={{ marginBottom: '24px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span className={`triage-badge ${getTriageLevelInfo(triageLevel).color}`}>
                    Level {triageLevel}
                  </span>
                  <div>
                    <strong>{getTriageLevelInfo(triageLevel).label}</strong>
                    <br />
                    <small>{getTriageLevelInfo(triageLevel).description}</small>
                  </div>
                </div>
              </div>
            )}
          </fieldset>

          {/* Accessibility & Preferences */}
          <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
            <legend style={{ 
              fontSize: 'var(--font-size-lg)', 
              fontWeight: 600, 
              marginBottom: '16px',
              color: 'var(--text-primary)'
            }}>
              Accessibility & Preferences
            </legend>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="accessibility_profile">Accessibility Needs</label>
                <select
                  id="accessibility_profile"
                  name="accessibility_profile"
                  value={formData.accessibility_profile}
                  onChange={handleChange}
                >
                  <option value="None">None</option>
                  <option value="Visual Impairment">Visual Impairment</option>
                  <option value="Hearing Impairment">Hearing Impairment</option>
                  <option value="Mobility">Mobility Assistance</option>
                  <option value="Cognitive">Cognitive Support</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="preferred_mode">Preferred Interaction</label>
                <select
                  id="preferred_mode"
                  name="preferred_mode"
                  value={formData.preferred_mode}
                  onChange={handleChange}
                >
                  <option value="Standard">Standard</option>
                  <option value="Voice">Voice Input/Output</option>
                  <option value="Touch">Touch/Large Buttons</option>
                  <option value="Assisted">Staff Assisted</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="language">Preferred Language</label>
                <select
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="Mandarin">Mandarin</option>
                  <option value="Arabic">Arabic</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </fieldset>

          {/* Submit Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            marginTop: '24px',
            flexWrap: 'wrap'
          }}>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={isSubmitting || !triageLevel}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner" style={{ width: '20px', height: '20px', margin: 0 }}></span>
                  Submitting...
                </>
              ) : (
                '✓ Submit Patient'
              )}
            </button>
            
            <button
              type="button"
              className="btn btn-outline"
              onClick={resetForm}
              disabled={isSubmitting}
            >
              Clear Form
            </button>
          </div>
        </form>
      </div>

      {/* Screen reader only styles */}
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
      `}</style>
    </div>
  );
};

export default PatientIntake;
