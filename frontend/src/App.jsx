import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

import Login from './Login.jsx';
import Customer from './Customer.jsx';
import Store from './Store.jsx';
import Driver from './Driver.jsx';

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function App() {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth token
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>{t('common.loading')}</div>
      </div>
    );
  }

  const renderUserInterface = () => {
    if (!user) return null;

    switch (user.role) {
      case 'customer':
        return <Customer user={user} onLogout={handleLogout} />;
      case 'store':
        return <Store user={user} onLogout={handleLogout} />;
      case 'driver':
        return <Driver user={user} onLogout={handleLogout} />;
      default:
        return <div>Invalid user role</div>;
    }
  };

  return (
    <BrowserRouter>
      <div className="app">
        {/* Language Toggle - Only show on login page */}
        {!user && (
          <div style={{ 
            position: 'fixed', 
            top: '20px', 
            right: i18n.language === 'ar' ? 'auto' : '20px',
            left: i18n.language === 'ar' ? '20px' : 'auto',
            zIndex: 1000 
          }}>
            <button
              onClick={toggleLanguage}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {i18n.language === 'en' ? t('common.arabic') : t('common.english')}
            </button>
          </div>
        )}

        <Routes>
          <Route 
            path="/login" 
            element={
              user ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/" 
            element={
              user ? renderUserInterface() : <Navigate to="/login" replace />
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;