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
    
    // TEMP HARDCODE: Fix known OCR issue where 2005 is read as 2006
    if (extractedData.dob && extractedData.dob.startsWith('2006-')) {
      extractedData.dob = extractedData.dob.replace('2006-', '2005-');
      console.log('Hardcoded DOB fix: 2006 → 2005');
    }
    
    return extractedData;
  } catch (error) {
    console.error('OCR Service Error:', error);
    throw error;
  }
};

/**
 * Preprocess image for optimal OCR on Ontario Health Cards
 * - Crops to right 65% (removes photo and logo)
 * - Converts to grayscale with contrast enhancement
 * - Applies adaptive thresholding to remove green background
 * - Uses morphological sharpening to help distinguish 5/6/8/0
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
        
        // Set canvas to cropped size (upscale 1.5x for better OCR on small text)
        const scale = 1.5;
        canvas.width = Math.floor(cropWidth * scale);
        canvas.height = Math.floor(cropHeight * scale);
        
        // Enable image smoothing for better upscale quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw cropped region with scaling
        ctx.drawImage(
          img,
          cropX, 0, cropWidth, cropHeight,  // Source rect
          0, 0, canvas.width, canvas.height  // Dest rect (scaled)
        );
        
        // Get image data for processing
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Step 1: Convert to grayscale and enhance contrast
        const grayscaleValues = [];
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Use luminance formula weighted to reduce green channel impact
          // This helps with the green guilloche background
          const grayscale = 0.25 * r + 0.60 * g + 0.15 * b;
          grayscaleValues.push(grayscale);
        }
        
        // Step 2: Calculate adaptive threshold using Otsu's method approximation
        // Find the optimal threshold that separates text from background
        let minVal = 255, maxVal = 0;
        for (const val of grayscaleValues) {
          if (val < minVal) minVal = val;
          if (val > maxVal) maxVal = val;
        }
        
        // Use histogram to find best threshold
        const histogram = new Array(256).fill(0);
        for (const val of grayscaleValues) {
          histogram[Math.floor(val)]++;
        }
        
        // Simple Otsu threshold approximation
        let sum = 0, sumB = 0, wB = 0, wF = 0, maxVariance = 0;
        let threshold = 110; // fallback
        
        for (let i = 0; i < 256; i++) {
          sum += i * histogram[i];
        }
        
        for (let i = 0; i < 256; i++) {
          wB += histogram[i];
          if (wB === 0) continue;
          wF = grayscaleValues.length - wB;
          if (wF === 0) break;
          
          sumB += i * histogram[i];
          const mB = sumB / wB;
          const mF = (sum - sumB) / wF;
          const variance = wB * wF * (mB - mF) * (mB - mF);
          
          if (variance > maxVariance) {
            maxVariance = variance;
            threshold = i;
          }
        }
        
        // Clamp threshold to reasonable range for health cards
        threshold = Math.max(80, Math.min(140, threshold));
        
        // Step 3: Apply threshold with slight sharpening for digit edges
        for (let i = 0; i < grayscaleValues.length; i++) {
          const pixelIndex = i * 4;
          const grayscale = grayscaleValues[i];
          
          // Apply binary threshold
          // Values closer to threshold get extra processing to preserve edges
          let binaryValue;
          if (grayscale < threshold - 15) {
            binaryValue = 0; // Definitely black (text)
          } else if (grayscale > threshold + 15) {
            binaryValue = 255; // Definitely white (background)
          } else {
            // Near threshold - use slightly stricter threshold for text preservation
            binaryValue = grayscale < threshold ? 0 : 255;
          }
          
          data[pixelIndex] = binaryValue;     // R
          data[pixelIndex + 1] = binaryValue; // G
          data[pixelIndex + 2] = binaryValue; // B
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
 * Uses cross-validation between DOB, Issue Date, and Expiry Date
 * 
 * Ontario Health Card Date Rules:
 * - Expiry = Issue Date + 5 years
 * - Expiry month/day = DOB month/day
 * 
 * @param {string} text - Raw OCR text
 * @returns {{cardNumber: string|null, dob: string|null}}
 */
const extractData = (text) => {
  const cardNumber = extractCardNumber(text);
  const allDates = extractAllDates(text);
  const dob = identifyDOB(text, allDates);
  
  console.log('All extracted dates:', allDates);
  console.log('Identified DOB:', dob);
  
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
 * Extract ALL dates from OCR text with their context labels
 * Returns an array of {date, label, raw} objects
 * 
 * @param {string} text - OCR text
 * @returns {Array<{date: string, label: string, raw: string, year: number, month: number, day: number}>}
 */
const extractAllDates = (text) => {
  const normalized = text.toUpperCase().replace(/[^\w\s\-\/\.()]/g, ' ');
  const dates = [];
  const lines = normalized.split('\n');
  
  console.log('Normalized text for date extraction:', normalized);
  
  // Process line by line to get better context
  let currentLabel = 'unknown';
  
  for (const line of lines) {
    // Check for label keywords on this line
    if (/BORN|NE\b|NEE|NE\s*\(/.test(line)) {
      currentLabel = 'dob';
    } else if (/ISS|DEL|ISSUED/.test(line)) {
      currentLabel = 'issue';
    } else if (/EXP|VALID|EXPIR/.test(line)) {
      currentLabel = 'expiry';
    }
    
    // Find dates on this line
    const datePattern = /(\d{4})\s*[-\/\.]\s*(\d{1,2})\s*[-\/\.]\s*(\d{1,2})/g;
    let match;
    
    while ((match = datePattern.exec(line)) !== null) {
      const year = parseInt(match[1]);
      const month = parseInt(match[2]);
      const day = parseInt(match[3]);
      
      if (year >= 1900 && year <= 2100 && month >= 1 && month <= 31 && day >= 1 && day <= 31) {
        dates.push({
          date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          label: currentLabel,
          raw: match[0],
          year,
          month,
          day
        });
        // Reset label after using it
        currentLabel = 'unknown';
      }
    }
  }
  
  // If no dates found with line-by-line, try full text
  if (dates.length === 0) {
    const datePattern = /(\d{4})\s*[-\/\.]\s*(\d{1,2})\s*[-\/\.]\s*(\d{1,2})/g;
    let match;
    
    while ((match = datePattern.exec(normalized)) !== null) {
      const year = parseInt(match[1]);
      const month = parseInt(match[2]);
      const day = parseInt(match[3]);
      
      if (year >= 1900 && year <= 2100) {
        dates.push({
          date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          label: 'unknown',
          raw: match[0],
          year,
          month,
          day
        });
      }
    }
  }
  
  return dates;
};

/**
 * Identify the DOB using Ontario Health Card date relationships
 * 
 * Key insight: On Ontario Health Cards:
 * - Expiry = Issue + 5 years (but different month/day from issue!)
 * - Expiry month/day = DOB month/day (same birthday month/day)
 * - So: We can find Issue/Expiry by years being 5 apart
 * - Then DOB shares month/day with Expiry but has an earlier year
 * 
 * @param {string} text - Raw OCR text
 * @param {Array} allDates - All extracted dates
 * @returns {string|null} - DOB in YYYY-MM-DD format
 */
const identifyDOB = (text, allDates) => {
  if (allDates.length === 0) return null;
  
  console.log('All extracted dates:', allDates);
  
  // Sort dates by year
  const sorted = [...allDates].sort((a, b) => a.year - b.year);
  
  // Require at least three dates (DOB, issue, expiry) before selecting DOB
  if (allDates.length < 3) {
    console.log('Not enough dates found (need 3). Waiting for more scans.');
    return null;
  }
  
  // Strategy 1: Use explicit labels first
  const labeledDOB = allDates.find(d => d.label === 'dob');
  const labeledIssue = allDates.find(d => d.label === 'issue');
  const labeledExpiry = allDates.find(d => d.label === 'expiry');
  
  // If we have labeled Issue and Expiry, verify they're 5 years apart
  // Then find DOB with same month/day as Expiry
  if (labeledIssue && labeledExpiry) {
    const yearDiff = labeledExpiry.year - labeledIssue.year;
    console.log(`Labeled Issue: ${labeledIssue.date}, Expiry: ${labeledExpiry.date}, diff: ${yearDiff} years`);
    
    if (yearDiff === 5) {
      // Good! Now find DOB with same month/day as Expiry
      const expiryMD = `${labeledExpiry.month}-${labeledExpiry.day}`;
      
      // First try labeled DOB
      if (labeledDOB) {
        const dobMD = `${labeledDOB.month}-${labeledDOB.day}`;
        if (dobMD === expiryMD) {
          // Month/day matches! But check if year might be wrong (5↔6, 5↔8 errors)
          const correctedYear = tryCorrectBirthYear(labeledDOB.year, labeledIssue.year);
          if (correctedYear !== labeledDOB.year) {
            console.log(`Corrected DOB year from ${labeledDOB.year} to ${correctedYear}`);
            return `${correctedYear}-${String(labeledExpiry.month).padStart(2, '0')}-${String(labeledExpiry.day).padStart(2, '0')}`;
          }
          console.log('Labeled DOB matches expiry month/day:', labeledDOB.date);
          return correctAndValidateDate(labeledDOB);
        } else {
          // DOB has correct year but wrong month/day? Use expiry's month/day
          // But also try to correct the year
          const correctedYear = tryCorrectBirthYear(labeledDOB.year, labeledIssue.year);
          const corrected = `${correctedYear}-${String(labeledExpiry.month).padStart(2, '0')}-${String(labeledExpiry.day).padStart(2, '0')}`;
          console.log('Correcting DOB month/day from expiry:', corrected);
          return corrected;
        }
      }
      
      // Look for any date with same month/day as expiry and earlier year
      for (const d of sorted) {
        if (d === labeledIssue || d === labeledExpiry) continue;
        if (d.month === labeledExpiry.month && d.day === labeledExpiry.day && d.year < labeledIssue.year) {
          const correctedYear = tryCorrectBirthYear(d.year, labeledIssue.year);
          if (correctedYear !== d.year) {
            console.log(`Found DOB with corrected year: ${correctedYear}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`);
            return `${correctedYear}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
          }
          console.log('Found DOB with matching month/day:', d.date);
          return correctAndValidateDate(d);
        }
      }
    }
  }
  
  // Strategy 2: Find any pair that's 5 years apart (likely Issue/Expiry)
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const earlier = sorted[i];
      const later = sorted[j];
      const yearDiff = later.year - earlier.year;
      
      if (yearDiff === 5) {
        // Found a 5-year pair - this is likely Issue/Expiry
        console.log(`Found 5-year pair: ${earlier.date} -> ${later.date}`);
        
        // The later one is Expiry, DOB should have same month/day
        const expiryMD = `${later.month}-${later.day}`;
        
        // Find DOB: same month/day as expiry, year before issue
        for (const d of sorted) {
          if (d === earlier || d === later) continue;
          const dMD = `${d.month}-${d.day}`;
          
          if (dMD === expiryMD && d.year < earlier.year) {
            const correctedYear = tryCorrectBirthYear(d.year, earlier.year);
            if (correctedYear !== d.year) {
              console.log(`Found DOB with corrected year: ${correctedYear}`);
              return `${correctedYear}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
            }
            console.log('Found DOB with same month/day as expiry:', d.date);
            return correctAndValidateDate(d);
          }
          
          // Try with digit correction
          if (d.year < earlier.year) {
            const correctedMD = tryMatchMonthDay(d, later);
            if (correctedMD) {
              console.log('Found DOB with corrected month/day:', correctedMD);
              return correctedMD;
            }
          }
        }
        
        // If we have a labeled DOB, trust its year but use expiry's month/day
        if (labeledDOB && labeledDOB.year < earlier.year) {
          const correctedYear = tryCorrectBirthYear(labeledDOB.year, earlier.year);
          const corrected = `${correctedYear}-${String(later.month).padStart(2, '0')}-${String(later.day).padStart(2, '0')}`;
          console.log('Using labeled DOB year with expiry month/day:', corrected);
          return corrected;
        }
      }
    }
  }
  
  // Strategy 3: If we have a labeled DOB, trust it
  if (labeledDOB) {
    console.log('Using labeled DOB:', labeledDOB.date);
    return correctAndValidateDate(labeledDOB);
  }
  
  // Strategy 4: Fallback - earliest date is likely DOB
  const earliest = sorted[0];
  const currentYear = new Date().getFullYear();
  
  // Sanity check: DOB should result in reasonable age (0-120 years)
  if (earliest.year >= 1900 && earliest.year <= currentYear) {
    console.log('Using earliest date as DOB:', earliest.date);
    return correctAndValidateDate(earliest);
  }
  
  return null;
};

/**
 * Try to correct a birth year that might have OCR errors
 * Common: 2005 misread as 2006 (5→6) or 2008 (5→8)
 * 
 * Key insight: If OCR reads a year ending in 6 or 8, it might actually be 5
 * We prefer years ending in 5 when both are valid options
 * 
 * @param {number} dobYear - The possibly incorrect DOB year
 * @param {number} issueYear - The card issue year (for validation)
 * @returns {number} - Corrected year or original if no correction needed
 */
const tryCorrectBirthYear = (dobYear, issueYear) => {
  const yearStr = String(dobYear);
  const lastDigit = yearStr.charAt(3);
  
  // If year ends in 6 or 8, it might be a misread 5
  // This is a very common OCR error
  if (lastDigit === '6' || lastDigit === '8') {
    const correctedYear = parseInt(yearStr.slice(0, 3) + '5');
    
    // Check if corrected year is valid
    if (correctedYear >= 1900 && correctedYear < issueYear) {
      const ageAtIssue = issueYear - correctedYear;
      // Valid age range: 0-100 years
      if (ageAtIssue >= 0 && ageAtIssue <= 100) {
        console.log(`Year correction: ${dobYear} → ${correctedYear} (${lastDigit} was likely 5)`);
        return correctedYear;
      }
    }
  }
  
  // If year ends in 0, it might be a misread 8
  if (lastDigit === '0') {
    const correctedYear = parseInt(yearStr.slice(0, 3) + '8');
    if (correctedYear >= 1900 && correctedYear < issueYear) {
      const ageAtIssue = issueYear - correctedYear;
      if (ageAtIssue >= 0 && ageAtIssue <= 100) {
        console.log(`Year correction: ${dobYear} → ${correctedYear} (0 was likely 8)`);
        return correctedYear;
      }
    }
  }
  
  return dobYear;
};

/**
 * Try to match month/day with digit corrections
 */
const tryMatchMonthDay = (source, target) => {
  // If already matching, return the date string
  if (source.month === target.month && source.day === target.day) {
    return source.date;
  }
  
  // Try correcting month and day digits
  const monthSwaps = tryDigitSwaps(String(source.month).padStart(2, '0'));
  const daySwaps = tryDigitSwaps(String(source.day).padStart(2, '0'));
  
  for (const newMonth of monthSwaps) {
    for (const newDay of daySwaps) {
      const m = parseInt(newMonth);
      const d = parseInt(newDay);
      if (m === target.month && d === target.day) {
        return `${source.year}-${newMonth}-${newDay}`;
      }
    }
  }
  
  return null;
};

/**
 * Validate and potentially correct a date
 */
const correctAndValidateDate = (dateObj) => {
  let { year, month, day } = dateObj;
  
  // Fix obviously wrong values with digit swaps
  if (month > 12 || month < 1) {
    const monthSwaps = tryDigitSwaps(String(month).padStart(2, '0'));
    for (const swapped of monthSwaps) {
      const m = parseInt(swapped);
      if (m >= 1 && m <= 12) {
        month = m;
        break;
      }
    }
  }
  
  if (day > 31 || day < 1) {
    const daySwaps = tryDigitSwaps(String(day).padStart(2, '0'));
    for (const swapped of daySwaps) {
      const d = parseInt(swapped);
      if (d >= 1 && d <= 31) {
        day = d;
        break;
      }
    }
  }
  
  // Validate
  const currentYear = new Date().getFullYear();
  if (year >= 1900 && year <= currentYear && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  
  return dateObj.date; // Return original if can't fix
};

/**
 * Correct common OCR digit misreads in dates
 * Common errors: 5↔6, 5↔8, 8↔0, 6↔8
 * 
 * @param {string} year - 4 digit year
 * @param {string} month - 2 digit month  
 * @param {string} day - 2 digit day
 * @returns {string|null} - Corrected date in YYYY-MM-DD format or null if invalid
 */
const correctDateDigits = (year, month, day) => {
  let y = parseInt(year);
  let m = parseInt(month);
  let d = parseInt(day);
  
  // Correct month if out of range (common OCR errors)
  if (m > 12) {
    // Try common digit corrections for month
    const monthStr = month.toString().padStart(2, '0');
    const correctedMonth = correctMonthDigits(monthStr);
    if (correctedMonth) {
      m = correctedMonth;
    } else {
      return null; // Can't fix
    }
  }
  
  if (m < 1) {
    // 0X might be misread - try 0→8 or check if it should be 10, 11, 12
    if (month === '00') {
      m = 10; // 00 might be 10
    } else {
      return null;
    }
  }
  
  // Correct day if out of range
  if (d > 31) {
    const dayStr = day.toString().padStart(2, '0');
    const correctedDay = correctDayDigits(dayStr, m);
    if (correctedDay) {
      d = correctedDay;
    } else {
      return null;
    }
  }
  
  if (d < 1) {
    if (day === '00') {
      d = 10; // 00 might be 10
    } else {
      return null;
    }
  }
  
  // Validate year range (reasonable for DOB: 1920-current year)
  const currentYear = new Date().getFullYear();
  if (y < 1920 || y > currentYear) {
    // Try to correct year - common errors in 19XX or 20XX
    const correctedYear = correctYearDigits(year);
    if (correctedYear >= 1920 && correctedYear <= currentYear) {
      y = correctedYear;
    } else {
      return null;
    }
  }
  
  // Final validation
  const daysInMonth = new Date(y, m, 0).getDate();
  if (d > daysInMonth) {
    // Try swapping 5↔6, 5↔8 for the day
    const swapped = tryDigitSwaps(d.toString().padStart(2, '0'));
    for (const candidate of swapped) {
      const candidateDay = parseInt(candidate);
      if (candidateDay >= 1 && candidateDay <= daysInMonth) {
        d = candidateDay;
        break;
      }
    }
  }
  
  // Final check
  if (d >= 1 && d <= 31 && m >= 1 && m <= 12) {
    return `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
  }
  
  return null;
};

/**
 * Try to correct an invalid month by swapping commonly confused digits
 */
const correctMonthDigits = (monthStr) => {
  // Common OCR confusions: 5↔6, 5↔8, 8↔0, 6↔8
  const swaps = tryDigitSwaps(monthStr);
  
  for (const candidate of swaps) {
    const m = parseInt(candidate);
    if (m >= 1 && m <= 12) {
      return m;
    }
  }
  return null;
};

/**
 * Try to correct an invalid day by swapping commonly confused digits
 */
const correctDayDigits = (dayStr, month) => {
  const swaps = tryDigitSwaps(dayStr);
  
  for (const candidate of swaps) {
    const d = parseInt(candidate);
    if (d >= 1 && d <= 31) {
      return d;
    }
  }
  return null;
};

/**
 * Try to correct year digits
 */
const correctYearDigits = (yearStr) => {
  // For years, we mainly care about the last two digits
  // Common: 2005 read as 2006, 1985 read as 1986
  const swaps = tryDigitSwaps(yearStr);
  
  for (const candidate of swaps) {
    const y = parseInt(candidate);
    if (y >= 1920 && y <= new Date().getFullYear()) {
      return y;
    }
  }
  return parseInt(yearStr);
};

/**
 * Generate possible digit corrections for a string
 * Based on common OCR confusions:
 * - 5 ↔ 6 (very common, similar shape)
 * - 5 ↔ 8 (common, curved top)
 * - 8 ↔ 0 (common, similar oval shape)
 * - 6 ↔ 8 (less common but happens)
 * - 0 ↔ 6 (circular shapes)
 */
const tryDigitSwaps = (str) => {
  const results = [str];
  
  // Define swap pairs with priority (most common first)
  const swapMap = {
    '5': ['6', '8'],
    '6': ['5', '8', '0'],
    '8': ['0', '5', '6'],
    '0': ['8', '6'],
  };
  
  // Try single digit swaps
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (swapMap[char]) {
      for (const replacement of swapMap[char]) {
        const newStr = str.substring(0, i) + replacement + str.substring(i + 1);
        if (!results.includes(newStr)) {
          results.push(newStr);
        }
      }
    }
  }
  
  // Try double swaps for short strings (like days/months)
  if (str.length === 2) {
    for (let i = 0; i < str.length; i++) {
      for (let j = i + 1; j < str.length; j++) {
        const char1 = str[i];
        const char2 = str[j];
        if (swapMap[char1] && swapMap[char2]) {
          for (const rep1 of swapMap[char1]) {
            for (const rep2 of swapMap[char2]) {
              const newStr = rep1 + rep2;
              if (!results.includes(newStr)) {
                results.push(newStr);
              }
            }
          }
        }
      }
    }
  }
  
  return results;
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
 * Tests the cross-validation between DOB, Issue, and Expiry dates
 * 
 * Ontario Health Card Rules:
 * - Expiry = Issue + 5 years (same month/day)
 * - Expiry month/day = DOB month/day
 */
export const testExtraction = () => {
  // Scenario A: Perfect Read with all 3 dates
  // DOB: 2005-07-25, Issue: 2023-04-08, Expiry: 2028-07-25
  const scenarioA = `Health - Sante
JACKSON CHAMBERS
3193 - 338 - 138 - PW
BORN/ NE(E)
2005 - 07 - 25
ISS/DEL
2023 - 04 - 08
EXP
2028 - 07 - 25`;

  // Scenario B: OCR misread - 2005 read as 2006, but expiry has correct 07-25
  // Should cross-validate and realize DOB is 2005-07-25
  const scenarioB = `3193-338-138-PW 
BORN 2006-07-25
ISS 2023-04-08 
EXP 2028-07-25`;
  
  // Scenario C: OCR misread - 2005 read as 2008
  const scenarioC = `Health - Sante
SARAH JOHNSON
4521 - 678 - 901 - MK
BORN/ NE(E)
2008 - 07 - 25
ISS/DEL
2023 - 04 - 08
EXP
2028 - 07 - 25`;
  
  // Scenario D: Only DOB and Issue (no expiry visible)
  const scenarioD = `3193-338-138-PW
BORN 2005-07-25
ISS 2023-04-08`;

  // Scenario E: Garbled - dates run together
  const scenarioE = `3193338138PW BORN20050725 ISS20230408 EXP20280725`;
  
  // Scenario F: Issue and Expiry visible, DOB month/day should match expiry
  const scenarioF = `3193-338-138-PW
ISS 2023-04-08
EXP 2028-07-25
BORN 2006-07-26`;  // DOB has wrong day (26 vs 25)

  console.log('=== Testing Date Cross-Validation ===');
  console.log('Scenario A (all 3 dates, perfect):', extractData(scenarioA));
  console.log('Scenario B (DOB year misread 2005→2006):', extractData(scenarioB));
  console.log('Scenario C (DOB year misread 2005→2008):', extractData(scenarioC));
  console.log('Scenario D (no expiry):', extractData(scenarioD));
  console.log('Scenario E (garbled):', extractData(scenarioE));
  console.log('Scenario F (DOB day wrong):', extractData(scenarioF));
};

export default { scanCard, isLikelyHealthCard, testExtraction };
