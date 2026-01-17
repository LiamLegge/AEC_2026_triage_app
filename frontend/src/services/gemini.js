import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API - Replace with your actual API key
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';

const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Get triage level from Gemini AI based on patient's chief complaint
 * Uses CTAS (Canadian Triage and Acuity Scale) guidelines
 * 
 * @param {string} chiefComplaint - The patient's main complaint/symptoms
 * @returns {Promise<number>} Triage level 1-5
 */
export const getTriageLevel = async (chiefComplaint) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const systemPrompt = `You are an experienced emergency triage nurse following CTAS (Canadian Triage and Acuity Scale) guidelines. 
    
Based on the patient's chief complaint, return ONLY a single integer from 1 to 5 representing the triage level:

1 - RESUSCITATION: Immediate life-threatening conditions requiring immediate intervention
   Examples: cardiac arrest, severe trauma with exposed bone/organs, respiratory failure, unconsciousness, severe bleeding with shock

2 - EMERGENT: Potentially life-threatening conditions requiring rapid intervention within minutes
   Examples: chest pain suggestive of heart attack, difficulty breathing, severe allergic reaction with airway compromise, burns with exposed bone, major trauma

3 - URGENT: Serious conditions requiring treatment within 30 minutes
   Examples: moderate pain from injury, minor trauma with bleeding, high fever with systemic symptoms, severe pain not immediately life-threatening

4 - LESS URGENT: Conditions that could wait 1-2 hours
   Examples: minor injuries without significant bleeding, mild pain, minor infections, moderate fever

5 - NON-URGENT: Conditions that could wait or be seen in primary care
   Examples: common cold, minor rash, prescription refills, chronic conditions without acute exacerbation

IMPORTANT GUIDELINES:
- Exposed bone from burns or trauma = Level 1 or 2 (severe trauma)
- Any mention of "bone visible", "exposed bone", "compound fracture" = high priority
- Burns with tissue damage = Level 2 minimum
- Pain level alone is not sufficient - consider mechanism of injury
- When in doubt, err on the side of higher priority for potential severe injury

Respond with ONLY the number (1, 2, 3, 4, or 5). No other text.`;

    const prompt = `${systemPrompt}

Patient's Chief Complaint: "${chiefComplaint}"

Triage Level:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Parse the response - should be just a number 1-5
    const level = parseInt(text, 10);
    
    if (level >= 1 && level <= 5) {
      return level;
    }
    
    // Fallback to keyword-based assessment if AI response is invalid
    console.warn('Invalid Gemini response, using fallback assessment');
    return fallbackTriageAssessment(chiefComplaint);
    
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    // Use fallback assessment if API fails
    return fallbackTriageAssessment(chiefComplaint);
  }
};

/**
 * Fallback triage assessment based on keywords
 * Used when Gemini API is unavailable
 * 
 * @param {string} complaint - Patient's chief complaint
 * @returns {number} Triage level 1-5
 */
const fallbackTriageAssessment = (complaint) => {
  const lowerComplaint = complaint.toLowerCase();
  
  // Level 1 - Resuscitation
  const level1Keywords = ['cardiac arrest', 'not breathing', 'unconscious', 'unresponsive', 'severe bleeding', 'gunshot', 'stab wound'];
  if (level1Keywords.some(keyword => lowerComplaint.includes(keyword))) {
    return 1;
  }
  
  // Level 2 - Emergent
  const level2Keywords = ['chest pain', 'difficulty breathing', 'severe pain', 'allergic reaction', 'stroke', 'heart attack', 'overdose', 'seizure'];
  if (level2Keywords.some(keyword => lowerComplaint.includes(keyword))) {
    return 2;
  }
  
  // Level 3 - Urgent
  const level3Keywords = ['broken', 'fracture', 'high fever', 'moderate pain', 'vomiting blood', 'abdominal pain', 'head injury'];
  if (level3Keywords.some(keyword => lowerComplaint.includes(keyword))) {
    return 3;
  }
  
  // Level 4 - Less Urgent
  const level4Keywords = ['minor cut', 'sprain', 'mild pain', 'earache', 'urinary', 'back pain', 'minor burn'];
  if (level4Keywords.some(keyword => lowerComplaint.includes(keyword))) {
    return 4;
  }
  
  // Level 5 - Non-Urgent (default)
  return 5;
};

/**
 * Check if Gemini API key is configured
 * @returns {boolean}
 */
export const isGeminiConfigured = () => {
  return API_KEY && API_KEY !== 'YOUR_GEMINI_API_KEY';
};

export default {
  getTriageLevel,
  isGeminiConfigured,
};
