import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/**
 * Submit a new patient to the intake queue
 * @param {Object} patient - Patient object matching the data contract
 * @returns {Promise<{status: string, queue_position: number}>}
 */
export const submitPatientIntake = async (patient) => {
  try {
    const response = await api.post('/api/intake', patient);
    return response.data;
  } catch (error) {
    console.error('Error submitting patient intake:', error);
    // Return mock response if backend is not available
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      console.warn('Backend not available, using mock response');
      return {
        status: 'success',
        queue_position: Math.floor(Math.random() * 10) + 1,
        mock: true,
      };
    }
    throw error;
  }
};

/**
 * Get the current patient queue for staff dashboard
 * @returns {Promise<Array>} Array of patient objects sorted by priority
 */
export const getPatientQueue = async () => {
  try {
    const response = await api.get('/api/queue');
    return response.data;
  } catch (error) {
    console.error('Error fetching patient queue:', error);
    // Return mock data if backend is not available
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      console.warn('Backend not available, using mock data');
      return getMockQueueData();
    }
    throw error;
  }
};

/**
 * Mock queue data for development/demo when backend is unavailable
 * Uses sample data from sample_data.txt, sorted by triage level (1-5)
 */
const getMockQueueData = () => {
  const now = Date.now();

  // Sample patient data converted from CSV, with simulated timestamps
  const samplePatients = [
    {
      id: 1015,
      name: "Lars Jensen",
      age: 75,
      chief_complaint: "Stroke Symptoms",
      triage_level: 1,
      accessibility_profile: "Motor Impairment",
      preferred_mode: "Eye_Tracking",
      ui_setting: "Large_Touch_Target",
      language: "Danish",
      timestamp: now - 120000, // 2 minutes ago
    },
    {
      id: 1040,
      name: "Zara Khan",
      age: 29,
      chief_complaint: "Pregnant - Labor Pains",
      triage_level: 2,
      accessibility_profile: "None",
      preferred_mode: "Standard",
      ui_setting: "Default",
      language: "Urdu",
      timestamp: now - 180000, // 3 minutes ago
    },
    {
      id: 1001,
      name: "Aisha Al-Fayed",
      age: 34,
      chief_complaint: "Severe Chest Pain",
      triage_level: 2,
      accessibility_profile: "None",
      preferred_mode: "Standard",
      ui_setting: "Default",
      language: "English",
      timestamp: now - 240000, // 4 minutes ago
    },
    {
      id: 1003,
      name: "Santiago Rivera",
      age: 58,
      chief_complaint: "Shortness of Breath",
      triage_level: 2,
      accessibility_profile: "None",
      preferred_mode: "Standard",
      ui_setting: "Default",
      language: "Spanish",
      timestamp: now - 300000, // 5 minutes ago
    },
    {
      id: 1025,
      name: "Omar Farooq",
      age: 47,
      chief_complaint: "Kidney Stone Pain",
      triage_level: 2,
      accessibility_profile: "None",
      preferred_mode: "Standard",
      ui_setting: "Default",
      language: "Urdu",
      timestamp: now - 360000, // 6 minutes ago
    },
    {
      id: 1032,
      name: "Rajesh Kumar",
      age: 49,
      chief_complaint: "Heart Palpitations",
      triage_level: 2,
      accessibility_profile: "None",
      preferred_mode: "Standard",
      ui_setting: "Default",
      language: "Hindi",
      timestamp: now - 420000, // 7 minutes ago
    },
    {
      id: 1034,
      name: "Vladimir Ivanov",
      age: 52,
      chief_complaint: "Severe Burn",
      triage_level: 2,
      accessibility_profile: "None",
      preferred_mode: "Standard",
      ui_setting: "Default",
      language: "Russian",
      timestamp: now - 480000, // 8 minutes ago
    },
    {
      id: 1045,
      name: "Wei Zhang",
      age: 42,
      chief_complaint: "Gastrointestinal Bleed",
      triage_level: 2,
      accessibility_profile: "None",
      preferred_mode: "Standard",
      ui_setting: "Default",
      language: "Mandarin",
      timestamp: now - 540000, // 9 minutes ago
    },
    {
      id: 1049,
      name: "Elias Petros",
      age: 67,
      chief_complaint: "Chest Discomfort",
      triage_level: 2,
      accessibility_profile: "Hearing Impairment",
      preferred_mode: "Text_Visuals",
      ui_setting: "Captions_Enabled",
      language: "Greek",
      timestamp: now - 600000, // 10 minutes ago
    },
    {
      id: 1004,
      name: "Chen Wei",
      age: 71,
      chief_complaint: "Dizziness and Nausea",
      triage_level: 3,
      accessibility_profile: "Hearing Impairment",
      preferred_mode: "Text_Visuals",
      ui_setting: "Captions_Enabled",
      language: "Mandarin",
      timestamp: now - 660000, // 11 minutes ago
    },
    {
      id: 1005,
      name: "Priya Patel",
      age: 29,
      chief_complaint: "Migraine Headache",
      triage_level: 3,
      accessibility_profile: "Light Sensitivity",
      preferred_mode: "Dark_Mode",
      ui_setting: "Low_Brightness",
      language: "English",
      timestamp: now - 720000, // 12 minutes ago
    },
    {
      id: 1007,
      name: "Elena Sokolov",
      age: 62,
      chief_complaint: "Hip Pain after Fall",
      triage_level: 3,
      accessibility_profile: "Mobility/Dexterity",
      preferred_mode: "Voice_Command",
      ui_setting: "Large_Buttons",
      language: "Russian",
      timestamp: now - 780000, // 13 minutes ago
    },
    {
      id: 1011,
      name: "David Kim",
      age: 27,
      chief_complaint: "Deep Laceration on Hand",
      triage_level: 3,
      accessibility_profile: "None",
      preferred_mode: "Standard",
      ui_setting: "Default",
      language: "English",
      timestamp: now - 840000, // 14 minutes ago
    },
    {
      id: 1012,
      name: "Maria Gonzalez",
      age: 35,
      chief_complaint: "Abdominal Pain",
      triage_level: 3,
      accessibility_profile: "None",
      preferred_mode: "Standard",
      ui_setting: "Default",
      language: "Spanish",
      timestamp: now - 900000, // 15 minutes ago
    },
    {
      id: 1013,
      name: "Samuel Abioye",
      age: 41,
      chief_complaint: "Asthma Attack",
      triage_level: 2,
      accessibility_profile: "None",
      preferred_mode: "Standard",
      ui_setting: "Default",
      language: "Yoruba",
      timestamp: now - 960000, // 16 minutes ago
    },
    {
      id: 1014,
      name: "Emily Chen",
      age: 6,
      chief_complaint: "High Fever",
      triage_level: 3,
      accessibility_profile: "None (Pediatric)",
      preferred_mode: "Standard",
      ui_setting: "Default",
      language: "English",
      timestamp: now - 1020000, // 17 minutes ago
    },
    {
      id: 1018,
      name: "Sarah Miller",
      age: 24,
      chief_complaint: "Anxiety Attack",
      triage_level: 3,
      accessibility_profile: "Neurodivergent",
      preferred_mode: "Text_Only",
      ui_setting: "Calm_Colors",
      language: "English",
      timestamp: now - 1080000, // 18 minutes ago
    },
    {
      id: 1019,
      name: "Miguel Torres",
      age: 40,
      chief_complaint: "Broken Leg",
      triage_level: 3,
      accessibility_profile: "Mobility",
      preferred_mode: "Voice_Input",
      ui_setting: "Hands_Free",
      language: "Spanish",
      timestamp: now - 1140000, // 19 minutes ago
    },
    {
      id: 1020,
      name: "Amara Singh",
      age: 66,
      chief_complaint: "Chest Tightness",
      triage_level: 2,
      accessibility_profile: "Visual Impairment",
      preferred_mode: "Voice_Conversation",
      ui_setting: "Screen_Reader",
      language: "Punjabi",
      timestamp: now - 1200000, // 20 minutes ago
    },
    {
      id: 1022,
      name: "Hana Lee",
      age: 28,
      chief_complaint: "Allergic Reaction",
      triage_level: 2,
      accessibility_profile: "Hearing Impairment",
      preferred_mode: "Text_Chat",
      ui_setting: "Flash_Alerts",
      language: "Korean",
      timestamp: now - 1260000, // 21 minutes ago
    },
    {
      id: 1027,
      name: "Thanh Nguyen",
      age: 60,
      chief_complaint: "Cough and Fever",
      triage_level: 3,
      accessibility_profile: "None",
      preferred_mode: "Standard",
      ui_setting: "Default",
      language: "Vietnamese",
      timestamp: now - 1320000, // 22 minutes ago
    },
    {
      id: 1031,
      name: "Sophie Dubois",
      age: 38,
      chief_complaint: "Panic Attack",
      triage_level: 3,
      accessibility_profile: "Sensory Processing",
      preferred_mode: "Text_Based",
      ui_setting: "Minimalist_UI",
      language: "French",
      timestamp: now - 1380000, // 23 minutes ago
    },
    {
      id: 1036,
      name: "Mateo Garcia",
      age: 7,
      chief_complaint: "Cut on Forehead",
      triage_level: 3,
      accessibility_profile: "None (Pediatric)",
      preferred_mode: "Standard",
      ui_setting: "Default",
      language: "Spanish",
      timestamp: now - 1440000, // 24 minutes ago
    },
    {
      id: 1037,
      name: "Femi Adebayo",
      age: 36,
      chief_complaint: "Food Poisoning",
      triage_level: 3,
      accessibility_profile: "None",
      preferred_mode: "Standard",
      ui_setting: "Default",
      language: "English",
      timestamp: now - 1500000, // 25 minutes ago
    },
    {
      id: 1039,
      name: "Benjamin Cohen",
      age: 74,
      chief_complaint: "Pneumonia Symptoms",
      triage_level: 2,
      accessibility_profile: "None",
      preferred_mode: "Standard",
      ui_setting: "Default",
      language: "English",
      timestamp: now - 1560000, // 26 minutes ago
    },
    {
      id: 1043,
      name: "Arthur Pendelton",
      age: 80,
      chief_complaint: "Fall - Head Trauma",
      triage_level: 2,
      accessibility_profile: "Cognitive/Dementia",
      preferred_mode: "Simple_Voice",
      ui_setting: "Simplified_UI",
      language: "English",
      timestamp: now - 1620000, // 27 minutes ago
    },
    {
      id: 1048,
      name: "Julia Santos",
      age: 32,
      chief_complaint: "Dehydration",
      triage_level: 3,
      accessibility_profile: "None",
      preferred_mode: "Standard",
      ui_setting: "Default",
      language: "Portuguese",
      timestamp: now - 1680000, // 28 minutes ago
    },
    {
      id: 1002,
      name: "Liam O'Connor",
      age: 22,
      chief_complaint: "Sprained Wrist",
      triage_level: 4,
      accessibility_profile: "Visual Impairment",
      preferred_mode: "Voice_Input",
      ui_setting: "Screen_Reader",
      language: "English",
      timestamp: now - 1740000, // 29 minutes ago
    },
    {
      id: 1023,
      name: "Robert Fox",
      age: 88,
      chief_complaint: "General Weakness",
      triage_level: 4,
      accessibility_profile: "Low Vision",
      preferred_mode: "Voice_Output",
      ui_setting: "Extra_Large_Text",
      language: "English",
      timestamp: now - 1800000, // 30 minutes ago
    },
    {
      id: 1026,
      name: "Natalia Kowalski",
      age: 55,
      chief_complaint: "Joint Swelling",
      triage_level: 4,
      accessibility_profile: "Dexterity Issues",
      preferred_mode: "Voice_Command",
      ui_setting: "Button_Spacing",
      language: "Polish",
      timestamp: now - 1860000, // 31 minutes ago
    },
    {
      id: 1033,
      name: "Anita Baker",
      age: 64,
      chief_complaint: "Arthritis Flare-up",
      triage_level: 4,
      accessibility_profile: "Mobility/Dexterity",
      preferred_mode: "Voice_Input",
      ui_setting: "Hands_Free",
      language: "English",
      timestamp: now - 1920000, // 32 minutes ago
    },
    {
      id: 1035,
      name: "Chloe Wilson",
      age: 23,
      chief_complaint: "Urinary Tract Infection",
      triage_level: 4,
      accessibility_profile: "None",
      preferred_mode: "Standard",
      ui_setting: "Default",
      language: "English",
      timestamp: now - 1980000, // 33 minutes ago
    },
    {
      id: 1041,
      name: "Carlos Mendez",
      age: 44,
      chief_complaint: "Tooth Abscess",
      triage_level: 4,
      accessibility_profile: "None",
      preferred_mode: "Standard",
      ui_setting: "Default",
      language: "Spanish",
      timestamp: now - 2040000, // 34 minutes ago
    },
    {
      id: 1042,
      name: "Lila Gupta",
      age: 59,
      chief_complaint: "Vision Blurring",
      triage_level: 3,
      accessibility_profile: "Visual Impairment",
      preferred_mode: "Voice_Only",
      ui_setting: "High_Contrast",
      language: "Hindi",
      timestamp: now - 2100000, // 35 minutes ago
    },
    {
      id: 1047,
      name: "Hassan El-Amir",
      age: 51,
      chief_complaint: "Chronic Back Pain",
      triage_level: 4,
      accessibility_profile: "None",
      preferred_mode: "Standard",
      ui_setting: "Default",
      language: "Arabic",
      timestamp: now - 2160000, // 36 minutes ago
    },
    {
      id: 1006,
      name: "Marcus Johnson",
      age: 45,
      chief_complaint: "Prescription Refill",
      triage_level: 5,
      accessibility_profile: "None",
      preferred_mode: "Standard",
      ui_setting: "Default",
      language: "English",
      timestamp: now - 2220000, // 37 minutes ago
    },
    {
      id: 1008,
      name: "Fatima Hassan",
      age: 19,
      chief_complaint: "Sore Throat",
      triage_level: 5,
      accessibility_profile: "None",
      preferred_mode: "Standard",
      ui_setting: "Default",
      language: "Arabic",
      timestamp: now - 2280000, // 38 minutes ago
    },
    {
      id: 1016,
      name: "Isabella Rossi",
      age: 31,
      chief_complaint: "Mild Rash",
      triage_level: 5,
      accessibility_profile: "None",
      preferred_mode: "Standard",
      ui_setting: "Default",
      language: "Italian",
      timestamp: now - 2340000, // 39 minutes ago
    },
    {
      id: 1021,
      name: "Lucas Silva",
      age: 21,
      chief_complaint: "Annual Physical Inquiry",
      triage_level: 5,
      accessibility_profile: "None",
      preferred_mode: "Standard",
      ui_setting: "Default",
      language: "Portuguese",
      timestamp: now - 2400000, // 40 minutes ago
    },
    {
      id: 1024,
      name: "Jasmine Brooks",
      age: 33,
      chief_complaint: "Insomnia",
      triage_level: 5,
      accessibility_profile: "None",
      preferred_mode: "Standard",
      ui_setting: "Default",
      language: "English",
      timestamp: now - 2460000, // 41 minutes ago
    },
    {
      id: 1044,
      name: "Nia Thomas",
      age: 30,
      chief_complaint: "Insect Bite",
      triage_level: 5,
      accessibility_profile: "None",
      preferred_mode: "Standard",
      ui_setting: "Default",
      language: "English",
      timestamp: now - 2520000, // 42 minutes ago
    },
    {
      id: 1046,
      name: "Olivia Brown",
      age: 20,
      chief_complaint: "Medication Side Effects",
      triage_level: 4,
      accessibility_profile: "None",
      preferred_mode: "Standard",
      ui_setting: "Default",
      language: "English",
      timestamp: now - 2580000, // 43 minutes ago
    },
    {
      id: 1050,
      name: "Karen White",
      age: 48,
      chief_complaint: "Routine Check-up Info",
      triage_level: 5,
      accessibility_profile: "None",
      preferred_mode: "Standard",
      ui_setting: "Default",
      language: "English",
      timestamp: now - 2640000, // 44 minutes ago
    },
  ];

  // Sort by triage_level (1 first, then 2, etc.) as per spec
  return samplePatients.sort((a, b) => a.triage_level - b.triage_level);
};

export default api;
