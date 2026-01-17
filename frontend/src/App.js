import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import PatientIntake from './components/PatientIntake';
import StaffDashboard from './components/StaffDashboard';

// Accessibility Context
export const AccessibilityContext = createContext();

export const useAccessibility = () => useContext(AccessibilityContext);

function App() {
  const [theme, setTheme] = useState('default'); // 'default' or 'high-contrast'
  const [uiSetting, setUiSetting] = useState('default'); // 'default' or 'large-text'

  const toggleHighContrast = () => {
    setTheme(prev => prev === 'high-contrast' ? 'default' : 'high-contrast');
  };

  const toggleDarkMode = () => { 
    setTheme(prev => prev === 'dark-mode' ? 'default' : 'dark-mode');
  }

  const toggleLargeText = () => {
    setUiSetting(prev => prev === 'large-text' ? 'default' : 'large-text');
  };

  return (
    <AccessibilityContext.Provider value={{ theme, uiSetting, toggleHighContrast, toggleLargeText, toggleDarkMode}}>
      <Router>
        <div 
          className="app-container"
          data-theme={theme}
          data-ui={uiSetting}
        >
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          
          <Header 
            toggleHighContrast={toggleHighContrast}
            toggleLargeText={toggleLargeText}
            toggleDarkMode={toggleDarkMode}
            theme={theme}
            uiSetting={uiSetting}
          />
          
          <main id="main-content" role="main">
            <Routes>
              <Route path="/" element={<PatientIntake />} />
              <Route path="/intake" element={<PatientIntake />} />
              <Route path="/dashboard" element={<StaffDashboard />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AccessibilityContext.Provider>
  );
}

function Header({ toggleHighContrast, toggleLargeText, theme, uiSetting }) {
  const location = useLocation();

  return (
    <header className="header" role="banner">
      <div className="header-content">
        <h1>Accessible Triage System</h1>
        
        <nav className="nav-links" role="navigation" aria-label="Main navigation">
          <Link 
            to="/intake" 
            className={location.pathname === '/' || location.pathname === '/intake' ? 'active' : ''}
          >
            Patient Check-In
          </Link>
          <Link 
            to="/dashboard" 
            className={location.pathname === '/dashboard' ? 'active' : ''}
          >
            Staff Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default App;
