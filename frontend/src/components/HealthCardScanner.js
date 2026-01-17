import React, { useState, useRef, useCallback, useEffect } from 'react';
import { scanCard, isLikelyHealthCard } from '../services/ocrService';
import Tesseract from 'tesseract.js';

/**
 * Health Card Scanner Component
 * Uses device camera with live preview and auto-detection
 * Optimized for Ontario Health Cards with green guilloche background
 * 
 * Validation: Only accepts cards ending in PW (male) or MK (female)
 * Format: ####-###-###-XX
 */
const HealthCardScanner = ({ onScan, onClose }) => {
  const [cameraReady, setCameraReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing camera...');
  const [cameraError, setCameraError] = useState(null);
  const [scanCount, setScanCount] = useState(0);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const isScanningRef = useRef(false);

  // Start camera immediately on mount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Start camera
  const startCamera = async () => {
    try {
      setCameraError(null);
      setStatus('Initializing camera...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(() => {
            setCameraReady(true);
            setStatus('Position your health card in the frame');
            // Start scanning after a brief delay to let video stabilize
            setTimeout(() => {
              startAutoScan();
            }, 500);
          });
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError') {
        setCameraError('Camera access denied. Please allow camera access.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('No camera found on this device.');
      } else {
        setCameraError('Unable to access camera.');
      }
    }
  };

  // Stop camera and cleanup
  const stopCamera = useCallback(() => {
    isScanningRef.current = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Start continuous auto-scanning (silent until valid card found)
  const startAutoScan = () => {
    if (intervalRef.current) return;
    isScanningRef.current = true;
    
    // Scan every 1.2 seconds
    intervalRef.current = setInterval(() => {
      if (isScanningRef.current && !isProcessing) {
        performScan();
      }
    }, 1200);
  };

  // Perform a single scan attempt
  const performScan = async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Capture frame
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.85);
    
    setScanCount(prev => prev + 1);

    // Rotate helpful status messages (but don't show "failed" messages)
    const messages = [
      'Position your health card in the frame',
      'Scanning... Hold card steady',
      'Make sure card is well lit',
      'Keep card flat and centered'
    ];
    setStatus(messages[scanCount % messages.length]);

    try {
      // Quick OCR check
      const result = await Tesseract.recognize(imageData, 'eng', {
        logger: () => {}
      });

      const text = result.data.text;
      console.log('Quick scan text:', text.substring(0, 100));
      
      // Check if we found a valid health card (must have PW or MK)
      if (isLikelyHealthCard(text)) {
        // Potential match - do full processing
        isScanningRef.current = false;
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        
        await processFullScan(imageData);
      }
      // If not valid, silently continue scanning
    } catch (err) {
      // Silently continue on errors
      console.error('Scan error:', err);
    }
  };

  // Full scan with preprocessing
  const processFullScan = async (imageDataUrl) => {
    setIsProcessing(true);
    setStatus('✓ Card detected! Reading...');
    setProgress(0);
    
    try {
      const result = await scanCard(imageDataUrl, ({ message, progress: p }) => {
        if (message) setStatus(message);
        if (p !== undefined) setProgress(p);
      });
      
      console.log('Full scan result:', result);
      
      // Validate: must have valid card number (with PW or MK)
      if (result.cardNumber && /-(PW|MK)$/.test(result.cardNumber)) {
        // Valid card found!
        onScan({
          healthCard: result.cardNumber,
          birthDay: result.dob
        });
      } else {
        // Not valid - resume scanning silently
        console.log('Card not valid, resuming scan...');
        setIsProcessing(false);
        setProgress(0);
        setStatus('Position your health card in the frame');
        setTimeout(() => {
          startAutoScan();
        }, 500);
      }
    } catch (err) {
      console.error('Full scan error:', err);
      setIsProcessing(false);
      setProgress(0);
      setStatus('Position your health card in the frame');
      setTimeout(() => {
        startAutoScan();
      }, 500);
    }
  };

  // Manual capture
  const manualCapture = async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;
    
    isScanningRef.current = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/png');
    await processFullScan(imageData);
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    stopCamera();
    setIsProcessing(true);
    setStatus('Processing uploaded image...');
    setProgress(0);

    const reader = new FileReader();
    reader.onload = async (e) => {
      await processFullScan(e.target?.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="scanner-overlay">
      <div className="scanner-modal">
        <div className="scanner-header">
          <h3>📷 Scan Ontario Health Card</h3>
          <button 
            className="scanner-close" 
            onClick={() => { stopCamera(); onClose(); }}
            aria-label="Close scanner"
          >
            ✕
          </button>
        </div>

        <div className="scanner-content">
          {/* Camera Error */}
          {cameraError && (
            <div className="scanner-error-state">
              <div className="error-icon">📷❌</div>
              <p>{cameraError}</p>
              <label className="file-upload-btn btn btn-primary">
                📁 Upload Image Instead
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  hidden
                />
              </label>
            </div>
          )}

          {/* Camera View */}
          {!cameraError && (
            <div className="camera-container">
              {/* Video element - always render it */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="camera-video"
                style={{ 
                  display: 'block',
                  width: '100%',
                  minHeight: '300px',
                  background: '#000'
                }}
              />
              
              {/* Overlay - only show when camera ready */}
              {cameraReady && (
                <div className="camera-overlay">
                  <div className="scan-guide">
                    <div className={`guide-frame ${isProcessing ? 'detected' : ''}`}>
                      <div className="corner tl"></div>
                      <div className="corner tr"></div>
                      <div className="corner bl"></div>
                      <div className="corner br"></div>
                      {!isProcessing && <div className="scan-line"></div>}
                    </div>
                    <p className="guide-text">{status}</p>
                  </div>
                </div>
              )}

              {/* Loading state before camera ready */}
              {!cameraReady && !cameraError && (
                <div className="camera-loading">
                  <div className="loading-spinner"></div>
                  <p>Starting camera...</p>
                </div>
              )}

              {/* Processing overlay */}
              {isProcessing && (
                <div className="processing-overlay">
                  <div className="processing-content">
                    <div className="processing-spinner"></div>
                    <p>{status}</p>
                    {progress > 0 && (
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progress}%` }} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Controls */}
          {cameraReady && !isProcessing && (
            <div className="scanner-controls">
              <button className="btn btn-primary capture-btn" onClick={manualCapture}>
                📸 Capture Now
              </button>
              <label className="btn btn-outline upload-btn">
                📁 Upload
                <input type="file" accept="image/*" onChange={handleFileUpload} hidden />
              </label>
            </div>
          )}

          {/* Instructions */}
          <div className="scanner-instructions">
            <p><strong>Auto-scanning is active.</strong> Just hold your card steady!</p>
            <ul>
              <li>🎯 Show the <strong>right side</strong> of your health card (with numbers)</li>
              <li>🔆 Good lighting helps</li>
              <li>📐 Keep card flat</li>
            </ul>
          </div>
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      <style>{`
        .scanner-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
        }

        .scanner-modal {
          background: var(--card-background);
          border-radius: 16px;
          max-width: 650px;
          width: 100%;
          max-height: 95vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .scanner-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-color);
          background: var(--card-background);
        }

        .scanner-header h3 {
          margin: 0;
          font-size: 1.25rem;
        }

        .scanner-close {
          background: none;
          border: none;
          font-size: 28px;
          cursor: pointer;
          color: var(--text-secondary);
          padding: 4px 8px;
          line-height: 1;
        }

        .scanner-content {
          padding: 16px;
          flex: 1;
          overflow-y: auto;
        }

        .scanner-error-state {
          text-align: center;
          padding: 40px 20px;
        }

        .error-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .scanner-error-state p {
          color: var(--text-secondary);
          margin-bottom: 24px;
        }

        .camera-container {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          background: #000;
        }

        .camera-video {
          width: 100%;
          display: block;
        }

        .camera-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .scan-guide {
          text-align: center;
        }

        .guide-frame {
          width: 340px;
          height: 210px;
          position: relative;
          margin: 0 auto 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 12px;
        }

        .guide-frame .corner {
          position: absolute;
          width: 35px;
          height: 35px;
          border: 4px solid rgba(255, 255, 255, 0.9);
        }

        .guide-frame.detected {
          border-color: #22c55e;
        }

        .guide-frame.detected .corner {
          border-color: #22c55e;
        }

        .corner.tl { top: -2px; left: -2px; border-right: none; border-bottom: none; border-radius: 12px 0 0 0; }
        .corner.tr { top: -2px; right: -2px; border-left: none; border-bottom: none; border-radius: 0 12px 0 0; }
        .corner.bl { bottom: -2px; left: -2px; border-right: none; border-top: none; border-radius: 0 0 0 12px; }
        .corner.br { bottom: -2px; right: -2px; border-left: none; border-top: none; border-radius: 0 0 12px 0; }

        .scan-line {
          position: absolute;
          left: 10%;
          right: 10%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #22c55e, transparent);
          animation: scan 2s ease-in-out infinite;
        }

        @keyframes scan {
          0%, 100% { top: 20%; opacity: 0.5; }
          50% { top: 80%; opacity: 1; }
        }

        .guide-text {
          background: rgba(0, 0, 0, 0.75);
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 15px;
          display: inline-block;
          font-weight: 500;
        }

        .processing-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .processing-content {
          text-align: center;
          color: white;
        }

        .processing-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(255,255,255,0.3);
          border-top-color: #22c55e;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .progress-bar {
          width: 200px;
          height: 6px;
          background: rgba(255,255,255,0.2);
          border-radius: 3px;
          margin: 12px auto 0;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #22c55e;
          transition: width 0.3s;
        }

        .progress-text {
          font-size: 12px;
          opacity: 0.7;
        }

        .scanner-controls {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }

        .capture-btn {
          flex: 1;
          padding: 16px;
          font-size: 18px;
        }

        .upload-btn {
          padding: 16px 20px;
          cursor: pointer;
        }

        .scanner-instructions {
          margin-top: 16px;
          padding: 14px;
          background: var(--background-color);
          border-radius: 10px;
        }

        .scanner-instructions h4 {
          margin: 0 0 10px 0;
          font-size: 14px;
        }

        .scanner-instructions ul {
          margin: 0;
          padding-left: 0;
          list-style: none;
        }

        .scanner-instructions li {
          font-size: 13px;
          color: var(--text-secondary);
          margin: 6px 0;
        }

        .file-upload-btn {
          display: inline-block;
          cursor: pointer;
        }

        .camera-loading {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #111;
          min-height: 300px;
        }

        .camera-loading p {
          color: #fff;
          margin-top: 16px;
          font-size: 15px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255,255,255,0.2);
          border-top-color: #22c55e;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @media (max-width: 500px) {
          .guide-frame {
            width: 280px;
            height: 175px;
          }
          
          .scanner-instructions {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default HealthCardScanner;
