import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import PatientIntake from './components/PatientIntake';
import StaffDashboard from './components/StaffDashboard';
import { translations, getTranslation, languageDisplayNames, LANGUAGES } from './translations';

// NOTE: Comments in this file reflect AI-assisted coding directed by Jackson Chambers.
// Accessibility Context (shared UI settings for the whole app) — AI-assisted coding directed by Jackson Chambers.
export const AccessibilityContext = createContext();

// Hook for child components to read/update accessibility settings — AI-assisted coding directed by Jackson Chambers.
export const useAccessibility = () => useContext(AccessibilityContext);

function App() {
  // Theme and accessibility UI state — AI-assisted coding directed by Jackson Chambers.
  // This portion was created by Liam Legge
  const [theme, setTheme] = useState('default'); // 'default' or 'high-contrast'
  const [uiSetting, setUiSetting] = useState('default'); // 'default' or 'large-text'
  const [language, setLanguage] = useState('English'); // Current UI language

  // Toggle high-contrast accessibility mode — AI-assisted coding directed by Jackson Chambers.
  const toggleHighContrast = () => {
    setTheme(prev => prev === 'high-contrast' ? 'default' : 'high-contrast');
  };

  // Toggle dark theme (separate from high contrast) — AI-assisted coding directed by Jackson Chambers.
  const toggleDarkMode = () => { 
    setTheme(prev => prev === 'dark-mode' ? 'default' : 'dark-mode');
  }

  // Toggle larger text sizing for readability — AI-assisted coding directed by Jackson Chambers.
  const toggleLargeText = () => {
    setUiSetting(prev => prev === 'large-text' ? 'default' : 'large-text');
  };
  // Up to this portion


  // Cycle through languages or set a specific language — AI-assisted coding directed by Jackson Chambers.
  const toggleLanguage = (specificLang) => {
    if (specificLang && LANGUAGES.includes(specificLang)) {
      setLanguage(specificLang);
    } else {
      // Cycle to next language
      const currentIndex = LANGUAGES.indexOf(language);
      const nextIndex = (currentIndex + 1) % LANGUAGES.length;
      setLanguage(LANGUAGES[nextIndex]);
    }
  };

  // Translation helper function for the current language — AI-assisted coding directed by Jackson Chambers.
  const t = (key) => getTranslation(language, key);

  return (
    // Provide accessibility settings and helpers to the app — AI-assisted coding directed by Jackson Chambers.
    <AccessibilityContext.Provider value={{ theme, uiSetting, language, toggleHighContrast, toggleLargeText, toggleDarkMode, toggleLanguage, t, LANGUAGES, languageDisplayNames}}>
      <Router>
        <div 
          className="app-container"
          data-theme={theme}
          data-ui={uiSetting}
        >
          {/* Skip link for keyboard/screen-reader users — AI-assisted coding directed by Jackson Chambers. */}
          <a href="#main-content" className="skip-link">
            {t('skipToContent')}
          </a>
          
          {/* Top-level app header/navigation — AI-assisted coding directed by Jackson Chambers. */}
          <Header t={t} />
          
          {/* Routed content area — AI-assisted coding directed by Jackson Chambers. */}
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

function Header({ t }) {
  const location = useLocation();

  return (
    <header className="header" role="banner">
      <div className="header-content">
        {/* Localized application title — AI-assisted coding directed by Jackson Chambers. */}
        <h1>{t('appTitle')}</h1>
        
        <nav className="nav-links" role="navigation" aria-label="Main navigation">
          {/* Patient check-in route — AI-assisted coding directed by Jackson Chambers. */}
          <Link 
            to="/intake" 
            className={location.pathname === '/' || location.pathname === '/intake' ? 'active' : ''}
          >
            {t('patientCheckIn')}
          </Link>
          {/* Staff dashboard route — AI-assisted coding directed by Jackson Chambers. */}
          <Link 
            to="/dashboard" 
            className={location.pathname === '/dashboard' ? 'active' : ''}
          >
            {t('staffDashboard')}
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default App;
