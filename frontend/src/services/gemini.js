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
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const systemPrompt = `You are an experienced emergency triage nurse following CTAS (Canadian Triage and Acuity Scale) guidelines. 
    
Based on the patient's chief complaint, return ONLY a single integer from 1 to 5 representing the triage level:

1 - Resuscitation: Immediate life-threatening conditions (cardiac arrest, severe trauma, respiratory failure)
2 - Emergent: Potentially life-threatening conditions requiring rapid intervention (chest pain, difficulty breathing, severe allergic reaction)
3 - Urgent: Serious conditions that require treatment within 30 minutes (moderate pain, minor trauma with bleeding, high fever)
4 - Less Urgent: Conditions that could wait 1-2 hours (minor injuries, mild pain, minor infections)
5 - Non-Urgent: Conditions that could wait or be seen in primary care (common cold, minor rash, prescription refills)

IMPORTANT: Respond with ONLY the number (1, 2, 3, 4, or 5). No other text.`;

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
