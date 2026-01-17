import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import PatientIntake from './components/PatientIntake';
import StaffDashboard from './components/StaffDashboard';
import { translations, getTranslation, languageDisplayNames, LANGUAGES } from './translations';

// Accessibility Context
export const AccessibilityContext = createContext();

export const useAccessibility = () => useContext(AccessibilityContext);

function App() {
  const [theme, setTheme] = useState('default'); // 'default' or 'high-contrast'
  const [uiSetting, setUiSetting] = useState('default'); // 'default' or 'large-text'
  const [language, setLanguage] = useState('English'); // Current UI language

  const toggleHighContrast = () => {
    setTheme(prev => prev === 'high-contrast' ? 'default' : 'high-contrast');
  };

  const toggleDarkMode = () => { 
    setTheme(prev => prev === 'dark-mode' ? 'default' : 'dark-mode');
  }

  const toggleLargeText = () => {
    setUiSetting(prev => prev === 'large-text' ? 'default' : 'large-text');
  };

  // Cycle through languages or set specific language
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

  // Translation helper function
  const t = (key) => getTranslation(language, key);

  return (
    <AccessibilityContext.Provider value={{ theme, uiSetting, language, toggleHighContrast, toggleLargeText, toggleDarkMode, toggleLanguage, t, LANGUAGES, languageDisplayNames}}>
      <Router>
        <div 
          className="app-container"
          data-theme={theme}
          data-ui={uiSetting}
        >
          <a href="#main-content" className="skip-link">
            {t('skipToContent')}
          </a>
          
          <Header t={t} />
          
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
        <h1>{t('appTitle')}</h1>
        
        <nav className="nav-links" role="navigation" aria-label="Main navigation">
          <Link 
            to="/intake" 
            className={location.pathname === '/' || location.pathname === '/intake' ? 'active' : ''}
          >
            {t('patientCheckIn')}
          </Link>
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
