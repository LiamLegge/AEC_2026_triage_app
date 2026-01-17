import Tesseract from 'tesseract.js';

/**
 * Ontario Health Card OCR Service
 * 
 * Implements a preprocessing pipeline optimized for Ontario Health Cards
 * with green guilloche background pattern removal.
 * 
 * Version Code Validation:
 * - PW = Male
 * - MK = Female
 * Only cards ending in PW or MK are considered valid.
 */

// Valid Ontario Health Card version codes
const VALID_VERSION_CODES = ['PW', 'MK'];

/**
 * Main entry point - scans an Ontario Health Card image
 * @param {string} imageDataUrl - Base64 encoded image data URL
 * @returns {Promise<{cardNumber: string|null, dob: string|null}>}
 */
export const scanCard = async (imageDataUrl, onProgress) => {
  try {
    // Step 1: Preprocess the image
    onProgress?.({ status: 'preprocessing', message: 'Processing image...' });
    const processedImage = await preprocessImage(imageDataUrl);
    
    // Step 2: Run OCR with optimized settings
    onProgress?.({ status: 'ocr', message: 'Reading card...', progress: 0 });
    const ocrText = await runOCR(processedImage, (progress) => {
      onProgress?.({ status: 'ocr', message: 'Reading card...', progress });
    });
    
    console.log('OCR Raw Text:', ocrText);
    
    // Step 3: Extract data using regex and heuristics
    onProgress?.({ status: 'extracting', message: 'Extracting data...' });
    const extractedData = extractData(ocrText);
    
    return extractedData;
  } catch (error) {
    console.error('OCR Service Error:', error);
    throw error;
  }
};

/**
 * Preprocess image for optimal OCR on Ontario Health Cards
 * - Crops to right 65% (removes photo and logo)
 * - Converts to grayscale
 * - Applies binary threshold at 110 to remove green background
 * 
 * @param {string} imageDataUrl - Base64 image data URL
 * @returns {Promise<string>} - Processed image data URL
 */
const preprocessImage = (imageDataUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate crop dimensions (right 65% of card)
        const cropX = Math.floor(img.width * 0.35);
        const cropWidth = img.width - cropX;
        const cropHeight = img.height;
        
        // Set canvas to cropped size
        canvas.width = cropWidth;
        canvas.height = cropHeight;
        
        // Draw cropped region
        ctx.drawImage(
          img,
          cropX, 0, cropWidth, cropHeight,  // Source rect
          0, 0, cropWidth, cropHeight        // Dest rect
        );
        
        // Get image data for processing
        const imageData = ctx.getImageData(0, 0, cropWidth, cropHeight);
        const data = imageData.data;
        
        // Process each pixel: grayscale + threshold
        const THRESHOLD = 110;
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Convert to grayscale using luminance formula
          const grayscale = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          
          // Apply binary threshold
          // Below threshold = black (text), above = white (background)
          const binaryValue = grayscale < THRESHOLD ? 0 : 255;
          
          data[i] = binaryValue;     // R
          data[i + 1] = binaryValue; // G
          data[i + 2] = binaryValue; // B
          // Alpha stays the same
        }
        
        // Put processed data back
        ctx.putImageData(imageData, 0, 0);
        
        // Return as data URL
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        reject(err);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageDataUrl;
  });
};

/**
 * Run Tesseract OCR with Ontario Health Card optimized settings
 * @param {string} imageDataUrl - Preprocessed image data URL
 * @param {function} onProgress - Progress callback (0-100)
 * @returns {Promise<string>} - Raw OCR text
 */
const runOCR = async (imageDataUrl, onProgress) => {
  const result = await Tesseract.recognize(imageDataUrl, 'eng', {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.round(m.progress * 100));
      }
    },
    // Tesseract parameters optimized for health cards
    tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ/-. ',
    tessedit_pageseg_mode: '6', // Assume single uniform block of text
  });
  
  return result.data.text;
};

/**
 * Extract health card number and DOB from OCR text
 * @param {string} text - Raw OCR text
 * @returns {{cardNumber: string|null, dob: string|null}}
 */
const extractData = (text) => {
  const cardNumber = extractCardNumber(text);
  const dob = extractDOB(text);
  
  return { cardNumber, dob };
};

/**
 * Extract Ontario Health Card number
 * Format: 10 digits, typically shown as ####-###-###
 * MUST have valid version code: PW (male) or MK (female)
 * 
 * @param {string} text - OCR text
 * @returns {string|null} - Formatted card number or null if invalid
 */
const extractCardNumber = (text) => {
  // Clean up text - keep only digits, letters, dashes, spaces
  const cleaned = text.replace(/[^0-9A-Z\-\s]/gi, ' ').toUpperCase();
  
  // Helper to validate and format if version code is valid
  const formatIfValid = (digits, versionCode) => {
    if (!versionCode) return null;
    const vc = versionCode.toUpperCase();
    if (!VALID_VERSION_CODES.includes(vc)) return null;
    if (digits.length < 9) return null;
    // Format as ####-###-###-XX (Ontario Health Card format: 4-3-3-2)
    return `${digits.slice(0,4)}-${digits.slice(4,7)}-${digits.slice(7,10).padEnd(3, '0')}-${vc}`;
  };
  
  // Pattern 1: Standard Ontario format ####-###-###-XX
  const pattern1 = /(\d{4})\s*[-]\s*(\d{3})\s*[-]\s*(\d{3})\s*[-]?\s*([A-Z]{2})/i;
  const match1 = cleaned.match(pattern1);
  if (match1) {
    const digits = match1[1] + match1[2] + match1[3];
    const result = formatIfValid(digits, match1[4]);
    if (result) return result;
  }
  
  // Pattern 2: 9-10 digits followed by PW or MK
  const pattern2 = /(\d{9,10})\s*[-]?\s*(PW|MK)/i;
  const match2 = cleaned.match(pattern2);
  if (match2) {
    const digits = match2[1].slice(0, 9);
    const result = formatIfValid(digits, match2[2]);
    if (result) return result;
  }
  
  // Pattern 3: Look for PW or MK and work backwards to find digits
  const vcMatch = cleaned.match(/(PW|MK)/i);
  if (vcMatch) {
    // Get all digits from the text
    const allDigits = cleaned.replace(/[^0-9]/g, '');
    if (allDigits.length >= 9) {
      const result = formatIfValid(allDigits.slice(0, 9), vcMatch[1]);
      if (result) return result;
    }
  }
  
  // No valid card found (must have PW or MK)
  return null;
};

/**
 * Extract Date of Birth from OCR text
 * Uses anchor search for BORN/NE label, falls back to chronological sort
 * 
 * @param {string} text - OCR text
 * @returns {string|null} - Date in YYYY-MM-DD format or null
 */
const extractDOB = (text) => {
  // Normalize text
  const normalized = text.toUpperCase().replace(/[^\w\s\-\/\.]/g, ' ');
  
  // Strategy 1: Anchor search - look for BORN or NE label
  // The date after BORN/NE(E) is the DOB
  const bornPatterns = [
    /(?:BORN|NE|NEE|NE\s*\(\s*E\s*\))[\/\s:]*(\d{4})\s*[-\/\.]\s*(\d{2})\s*[-\/\.]\s*(\d{2})/i,
    /(?:BORN|NE|NEE)[\/\s:]*(\d{2})\s*[-\/\.]\s*(\d{2})\s*[-\/\.]\s*(\d{4})/i,
  ];
  
  for (const pattern of bornPatterns) {
    const match = normalized.match(pattern);
    if (match) {
      if (match[1].length === 4) {
        // YYYY-MM-DD format
        return `${match[1]}-${match[2]}-${match[3]}`;
      } else {
        // DD-MM-YYYY or MM-DD-YYYY format
        return `${match[3]}-${match[1]}-${match[2]}`;
      }
    }
  }
  
  // Strategy 2: Extract all dates and use chronological sort
  // DOB is the earliest date, Expiry is the latest
  const datePattern = /(\d{4})\s*[-\/\.]\s*(\d{2})\s*[-\/\.]\s*(\d{2})/g;
  const dates = [];
  let match;
  
  while ((match = datePattern.exec(normalized)) !== null) {
    const year = parseInt(match[1]);
    const month = parseInt(match[2]);
    const day = parseInt(match[3]);
    
    // Validate date ranges
    if (year >= 1900 && year <= new Date().getFullYear() && 
        month >= 1 && month <= 12 && 
        day >= 1 && day <= 31) {
      dates.push({
        dateStr: `${match[1]}-${match[2]}-${match[3]}`,
        dateObj: new Date(year, month - 1, day)
      });
    }
  }
  
  // Also check for DD/MM/YYYY or MM/DD/YYYY patterns
  const altDatePattern = /(\d{2})\s*[-\/\.]\s*(\d{2})\s*[-\/\.]\s*(\d{4})/g;
  while ((match = altDatePattern.exec(normalized)) !== null) {
    const year = parseInt(match[3]);
    const possibleMonth = parseInt(match[1]);
    const possibleDay = parseInt(match[2]);
    
    // Assume MM/DD/YYYY for North American cards
    if (year >= 1900 && year <= new Date().getFullYear() &&
        possibleMonth >= 1 && possibleMonth <= 12 &&
        possibleDay >= 1 && possibleDay <= 31) {
      dates.push({
        dateStr: `${match[3]}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`,
        dateObj: new Date(year, possibleMonth - 1, possibleDay)
      });
    }
  }
  
  if (dates.length > 0) {
    // Sort by date (earliest first)
    dates.sort((a, b) => a.dateObj - b.dateObj);
    // The earliest date is the DOB
    return dates[0].dateStr;
  }
  
  return null;
};

/**
 * Quick validation check - does the image likely contain a valid health card?
 * MUST have PW or MK version code to be considered valid
 * @param {string} text - OCR text
 * @returns {boolean}
 */
export const isLikelyHealthCard = (text) => {
  const upper = text.toUpperCase();
  
  // MUST have valid version code (PW or MK)
  const hasValidVersionCode = /\b(PW|MK)\b/.test(upper);
  if (!hasValidVersionCode) return false;
  
  // Must also have digit patterns that look like a card number
  const hasDigitPattern = /\d{4}\s*[-]?\s*\d{3}\s*[-]?\s*\d{3}|\d{9,10}/.test(text);
  
  return hasDigitPattern;
};

/**
 * Parse test scenarios (for validation/debugging)
 * Valid version codes: PW (male), MK (female)
 */
export const testExtraction = () => {
  // Scenario A: Perfect Read - Male (PW)
  const scenarioA = `Health - Sante
JACKSON CHAMBERS
3193 - 338 - 138 - PW
BORN/ NE(E)
2005 - 07 - 25
ISS/DEL
2023 - 04 - 08`;

  // Scenario B: Noisy/Merged Lines - Male (PW)
  const scenarioB = `3193-338-138-PW BORN 2005-07-25
ISS 2023-04-08 EXP 2028-04-08`;
  
  // Scenario C: Female card (MK)
  const scenarioC = `Health - Sante
SARAH JOHNSON
4521 - 678 - 901 - MK
BORN/ NE(E)
1990 - 03 - 15`;
  
  // Scenario D: Invalid version code (should return null)
  const scenarioD = `1234-567-890-XX`;

  console.log('Scenario A (PW - valid):', extractData(scenarioA));
  console.log('Scenario B (PW - valid):', extractData(scenarioB));
  console.log('Scenario C (MK - valid):', extractData(scenarioC));
  console.log('Scenario D (XX - invalid):', extractData(scenarioD));
};

export default { scanCard, isLikelyHealthCard, testExtraction };
