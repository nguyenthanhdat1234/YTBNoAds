import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localSession = localStorage.getItem('cinema_session');
    const sessionSession = sessionStorage.getItem('cinema_session');
    if (localSession === 'authorized' || sessionSession === 'authorized') {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = (password, rememberMe = false) => {
    // Simple password check
    if (password === 'nguyenthanhdat12') {
      setIsAuthenticated(true);
      if (rememberMe) {
        localStorage.setItem('cinema_session', 'authorized');
      } else {
        // Use sessionStorage or a shorter-lived session indicator
        // For simplicity in this app, we indicate short-term session in localStorage 
        // but normally sessionStorage would be better. Let's use sessionStorage.
        sessionStorage.setItem('cinema_session', 'authorized');
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('cinema_session');
    sessionStorage.removeItem('cinema_session');
  };

  const value = {
    isAuthenticated,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
