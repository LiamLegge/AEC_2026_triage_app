import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getPatientQueue, checkBackendConnection } from '../services/api';

const STAFF_PASSWORD = 'ctrlaltelite';

const StaffDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isPolling, setIsPolling] = useState(true);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const intervalRef = useRef(null);

  // Handle password submission
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === STAFF_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password. Please try again.');
      setPasswordInput('');
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setPasswordInput('');
    setPasswordError('');
  };

  // Fetch patient queue data
  const fetchQueue = useCallback(async () => {
    try {
      const data = await getPatientQueue();
      setPatients(data);
      setLastUpdated(new Date());
      setError(null);
      setIsBackendConnected(true);
    } catch (err) {
      setIsBackendConnected(false);
      setError('Backend server not available. Please ensure the C++ backend is running on port 8080.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check backend connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      const connected = await checkBackendConnection();
      setIsBackendConnected(connected);
      if (!connected) {
        setError('Backend server not available. Please start the C++ backend on port 8080.');
        setIsLoading(false);
      }
    };
    checkConnection();
  }, []);

  // Initial fetch and polling setup
  useEffect(() => {
    fetchQueue();
    
    // Poll every 3 seconds as per spec
    if (isPolling) {
      intervalRef.current = setInterval(fetchQueue, 3000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchQueue, isPolling]);

  // Toggle polling
  const togglePolling = () => {
    setIsPolling(prev => !prev);
    if (isPolling && intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // Manual refresh
  const handleRefresh = () => {
    setIsLoading(true);
    fetchQueue();
  };

  // Get triage level info
  const getTriageLevelInfo = (level) => {
    const info = {
      1: { label: 'Resuscitation', color: 'triage-1', priority: 'CRITICAL' },
      2: { label: 'Emergent', color: 'triage-2', priority: 'HIGH' },
      3: { label: 'Urgent', color: 'triage-3', priority: 'MEDIUM' },
      4: { label: 'Less Urgent', color: 'triage-4', priority: 'LOW' },
      5: { label: 'Non-Urgent', color: 'triage-5', priority: 'ROUTINE' },
    };
    return info[level] || { label: 'Unknown', color: '', priority: 'N/A' };
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(typeof timestamp === 'number' && timestamp < 10000000000 
      ? timestamp * 1000 
      : timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  // Calculate wait time
  const getWaitTime = (timestamp) => {
    const now = Date.now();
    const arrival = typeof timestamp === 'number' && timestamp < 10000000000 
      ? timestamp * 1000 
      : timestamp;
    const diffMs = now - arrival;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just arrived';
    if (diffMins < 60) return `${diffMins} min`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };

  // Get queue statistics
  const getQueueStats = () => {
    const stats = {
      total: patients.length,
      critical: patients.filter(p => p.triage_level === 1).length,
      emergent: patients.filter(p => p.triage_level === 2).length,
      urgent: patients.filter(p => p.triage_level === 3).length,
      lessUrgent: patients.filter(p => p.triage_level === 4).length,
      nonUrgent: patients.filter(p => p.triage_level === 5).length,
    };
    return stats;
  };

  const stats = getQueueStats();

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="staff-dashboard">
        <div className="card" style={{ maxWidth: '400px', margin: '100px auto', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '24px' }}>🔒 Staff Login</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Please enter the staff password to access the dashboard.
          </p>
          
          <form onSubmit={handlePasswordSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '16px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  boxSizing: 'border-box'
                }}
                autoFocus
              />
            </div>
            
            {passwordError && (
              <p style={{ color: 'var(--danger-color)', marginBottom: '16px', fontSize: '14px' }}>
                {passwordError}
              </p>
            )}
            
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-dashboard">
      {/* Dashboard Header */}
      <div className="card">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h2 style={{ marginBottom: '8px' }}>📋 Staff Dashboard</h2>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              Real-time patient queue management
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Connection Status */}
            <div className="status-indicator" aria-live="polite">
              <span 
                className="status-dot" 
                style={{ background: isBackendConnected ? (isPolling ? 'var(--success-color)' : 'var(--warning-color)') : 'var(--danger-color)' }}
              ></span>
              <span>{isBackendConnected ? (isPolling ? 'Live Updates' : 'Paused') : 'Disconnected'}</span>
            </div>
            
            {/* Control Buttons */}
            <button 
              className="btn btn-outline" 
              onClick={togglePolling}
              aria-pressed={isPolling}
            >
              {isPolling ? '⏸️ Pause' : '▶️ Resume'}
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleRefresh}
              disabled={isLoading}
            >
              🔄 Refresh
            </button>
            <button 
              className="btn btn-outline" 
              onClick={handleLogout}
              style={{ marginLeft: '8px' }}
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Last Updated */}
        {lastUpdated && (
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '0.85em',
            marginTop: '12px'
          }}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Queue Statistics */}
      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>Queue Summary</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '16px'
        }}>
          <StatCard 
            label="Total Patients" 
            value={stats.total} 
            color="var(--primary-color)" 
          />
          <StatCard 
            label="Level 1 - Critical" 
            value={stats.critical} 
            color="#dc2626" 
          />
          <StatCard 
            label="Level 2 - Emergent" 
            value={stats.emergent} 
            color="#f97316" 
          />
          <StatCard 
            label="Level 3 - Urgent" 
            value={stats.urgent} 
            color="#eab308" 
          />
          <StatCard 
            label="Level 4 - Less Urgent" 
            value={stats.lessUrgent} 
            color="#22c55e" 
          />
          <StatCard 
            label="Level 5 - Non-Urgent" 
            value={stats.nonUrgent} 
            color="#3b82f6" 
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error" role="alert">
          ⚠️ {error}
        </div>
      )}

      {/* Patient Queue Table */}
      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>Patient Queue</h3>
        
        {isLoading && patients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner"></div>
            <p style={{ color: 'var(--text-secondary)' }}>Loading patient queue...</p>
          </div>
        ) : patients.length === 0 ? (
          <div className="empty-state">
            <p>No patients in queue</p>
            <small>New patients will appear here automatically</small>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="queue-table" role="grid" aria-label="Patient queue">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Triage</th>
                  <th scope="col">Patient Name</th>
                  <th scope="col">Age</th>
                  <th scope="col">Chief Complaint</th>
                  <th scope="col">Accessibility</th>
                  <th scope="col">Language</th>
                  <th scope="col">Wait Time</th>
                  <th scope="col">Arrived</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient, index) => {
                  const triageInfo = getTriageLevelInfo(patient.triage_level);
                  return (
                    <tr key={patient.id} role="row">
                      <td>{index + 1}</td>
                      <td>
                        <span className={`triage-badge ${triageInfo.color}`}>
                          L{patient.triage_level}
                        </span>
                      </td>
                      <td>
                        <strong>{patient.name}</strong>
                        {patient.accessibility_profile !== 'None' && (
                          <span 
                            style={{ marginLeft: '8px' }}
                            title={patient.accessibility_profile}
                            aria-label={`Accessibility: ${patient.accessibility_profile}`}
                          >
                            ♿
                          </span>
                        )}
                      </td>
                      <td>{patient.age}</td>
                      <td style={{ maxWidth: '200px' }}>
                        {patient.chief_complaint}
                      </td>
                      <td>
                        <AccessibilityBadge profile={patient.accessibility_profile} />
                      </td>
                      <td>{patient.language}</td>
                      <td>
                        <span style={{ 
                          color: patient.triage_level <= 2 ? 'var(--danger-color)' : 'inherit',
                          fontWeight: patient.triage_level <= 2 ? 600 : 400
                        }}>
                          {getWaitTime(patient.timestamp)}
                        </span>
                      </td>
                      <td>{formatTime(patient.timestamp)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>Triage Level Legend</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px'
        }}>
          {[1, 2, 3, 4, 5].map(level => {
            const info = getTriageLevelInfo(level);
            return (
              <div key={level} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className={`triage-badge ${info.color}`}>L{level}</span>
                <span>{info.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ label, value, color }) => (
  <div style={{
    background: 'var(--background-color)',
    padding: '16px',
    borderRadius: '8px',
    textAlign: 'center',
    borderLeft: `4px solid ${color}`
  }}>
    <div style={{ 
      fontSize: 'var(--font-size-2xl)', 
      fontWeight: 700,
      color: color
    }}>
      {value}
    </div>
    <div style={{ 
      fontSize: '0.85em', 
      color: 'var(--text-secondary)',
      marginTop: '4px'
    }}>
      {label}
    </div>
  </div>
);

// Accessibility Badge Component
const AccessibilityBadge = ({ profile }) => {
  if (!profile || profile === 'None') {
    return <span style={{ color: 'var(--text-secondary)' }}>—</span>;
  }

  const icons = {
    'Visual Impairment': '👁️',
    'Hearing Impairment': '👂',
    'Mobility': '🦽',
    'Cognitive': '🧠',
  };

  return (
    <span 
      style={{ 
        background: 'var(--background-color)',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '0.85em'
      }}
      title={profile}
    >
      {icons[profile] || '♿'} {profile}
    </span>
  );
};

export default StaffDashboard;
