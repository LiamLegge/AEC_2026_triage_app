import axios from 'axios';

// NOTE: Comments in this file reflect AI-assisted coding directed by Jackson Chambers.
// Base URL for the C++ backend (Crow) — AI-assisted coding directed by Jackson Chambers.
const API_BASE_URL = 'http://localhost:8080';

// Create axios instance with default config — AI-assisted coding directed by Jackson Chambers.
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Track backend connection status for UI indicators — AI-assisted coding directed by Jackson Chambers.
let isBackendAvailable = null;

/**
 * Check if the backend server is running
 * @returns {Promise<boolean>}
 */
export const checkBackendConnection = async () => {
  try {
    // Use queue endpoint as a lightweight health check — AI-assisted coding directed by Jackson Chambers.
    await api.get('/api/queue');
    isBackendAvailable = true;
    return true;
  } catch (error) {
    isBackendAvailable = false;
    return false;
  }
};

/**
 * Get the current backend connection status
 * @returns {boolean|null} true if connected, false if not, null if unknown
 */
export const getBackendStatus = () => isBackendAvailable;

/**
 * Submit a new patient to the intake queue
 * @param {Object} patient - Patient object matching the data contract
 * @returns {Promise<{status: string, queue_position: number}>}
 */
export const submitPatientIntake = async (patient) => {
  try {
    // Send intake payload to backend — AI-assisted coding directed by Jackson Chambers.
    const response = await api.post('/api/intake', patient);
    isBackendAvailable = true;
    return response.data;
  } catch (error) {
    console.error('Error submitting patient intake:', error);
    isBackendAvailable = false;
    throw new Error('Backend server is not available. Please ensure the server is running on port 8080.');
  }
};

/**
 * Get the current patient queue for staff dashboard
 * @returns {Promise<Array>} Array of patient objects sorted by priority
 */
export const getPatientQueue = async () => {
  try {
    // Fetch current queue ordered by priority — AI-assisted coding directed by Jackson Chambers.
    const response = await api.get('/api/queue');
    isBackendAvailable = true;
    return response.data;
  } catch (error) {
    console.error('Error fetching patient queue:', error);
    isBackendAvailable = false;
    throw new Error('Backend server is not available. Please ensure the server is running on port 8080.');
  }
};

/**
 * Get the next patient to be seen (highest priority)
 * @returns {Promise<Object>} Next patient object or empty object if no patients
 */
export const getNextPatient = async () => {
  try {
    // Ask backend for next patient in priority order — AI-assisted coding directed by Jackson Chambers.
    const response = await api.get('/api/next_patient');
    isBackendAvailable = true;
    return response.data;
  } catch (error) {
    console.error('Error fetching next patient:', error);
    isBackendAvailable = false;
    throw new Error('Backend server is not available. Please ensure the server is running on port 8080.');
  }
};

export default api;
