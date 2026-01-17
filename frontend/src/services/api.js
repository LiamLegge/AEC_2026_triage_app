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
      health_card: "7589-31-456-DJ",
      birth_day: "1950-08-12",
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
      health_card: "4012-89-234-ZK",
      birth_day: "1996-03-22",
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
      health_card: "3291-47-812-AF",
      birth_day: "1991-06-15",
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
      health_card: "6734-22-589-SR",
      birth_day: "1967-09-28",
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
      health_card: "5821-63-471-OF",
      birth_day: "1978-04-03",
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
      health_card: "4912-38-256-RK",
      birth_day: "1976-11-20",
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
      health_card: "7156-84-923-VI",
      birth_day: "1973-02-14",
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
      health_card: "8247-15-634-WZ",
      birth_day: "1983-07-09",
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
      health_card: "2568-91-347-EP",
      birth_day: "1958-12-01",
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
      health_card: "1945-72-418-CW",
      birth_day: "1954-05-23",
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
      health_card: "9623-54-187-PP",
      birth_day: "1996-08-17",
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
      health_card: "3478-29-615-ES",
      birth_day: "1963-10-30",
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
      health_card: "6189-43-752-DK",
      birth_day: "1998-03-12",
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
      health_card: "5436-81-294-MG",
      birth_day: "1990-01-25",
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
      health_card: "2784-56-831-SA",
      birth_day: "1984-06-08",
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
      health_card: "8315-27-469-EC",
      birth_day: "2019-09-14",
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
      health_card: "4692-18-573-SM",
      birth_day: "2001-12-05",
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
      health_card: "7523-64-918-MT",
      birth_day: "1985-04-22",
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
      health_card: "1837-95-246-AS",
      birth_day: "1959-07-31",
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
      health_card: "9254-36-781-HL",
      birth_day: "1997-11-19",
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
      health_card: "6478-12-359-TN",
      birth_day: "1965-02-27",
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
      health_card: "3165-48-927-SD",
      birth_day: "1987-08-04",
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
      health_card: "5892-73-614-MG",
      birth_day: "2018-05-16",
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
      health_card: "2419-85-362-FA",
      birth_day: "1989-10-11",
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
      health_card: "8746-31-528-BC",
      birth_day: "1951-03-07",
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
      health_card: "1523-67-894-AP",
      birth_day: "1945-11-23",
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
      health_card: "4358-92-176-JS",
      birth_day: "1993-06-29",
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
      health_card: "7681-24-953-LO",
      birth_day: "2003-08-21",
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
      health_card: "2935-58-417-RF",
      birth_day: "1937-04-18",
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
      health_card: "8194-46-732-NK",
      birth_day: "1970-09-02",
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
      health_card: "5627-13-865-AB",
      birth_day: "1961-12-14",
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
      health_card: "3748-69-241-CW",
      birth_day: "2002-07-08",
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
      health_card: "6283-57-194-CM",
      birth_day: "1981-02-19",
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
      health_card: "9471-82-356-LG",
      birth_day: "1966-05-11",
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
      health_card: "1856-34-729-HE",
      birth_day: "1974-08-26",
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
      health_card: "4529-71-638-MJ",
      birth_day: "1980-10-03",
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
      health_card: "7312-49-582-FH",
      birth_day: "2006-04-15",
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
      health_card: "8965-23-417-IR",
      birth_day: "1994-11-28",
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
      health_card: "2647-86-951-LS",
      birth_day: "2004-06-12",
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
      health_card: "5183-42-769-JB",
      birth_day: "1992-09-07",
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
      health_card: "9428-15-634-NT",
      birth_day: "1995-03-24",
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
      health_card: "3671-58-842-OB",
      birth_day: "2005-12-30",
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
      health_card: "6294-37-518-KW",
      birth_day: "1977-07-14",
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
