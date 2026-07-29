import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedAuth = localStorage.getItem('ticketpulse_auth');
      if (storedAuth) {
        try {
          const userData = await authAPI.getMe();
          setUser(userData);
        } catch (e) {
          console.warn('Session expired or invalid credentials');
          localStorage.removeItem('ticketpulse_auth');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const loginUser = async (username, password) => {
    // Store credentials first for Basic Auth header
    localStorage.setItem('ticketpulse_auth', JSON.stringify({ username, password }));
    try {
      const userData = await authAPI.login({ username, password });
      setUser(userData);
      return userData;
    } catch (err) {
      localStorage.removeItem('ticketpulse_auth');
      throw err;
    }
  };

  const registerUser = async (username, email, password, phone_number) => {
    try {
      const userData = await authAPI.register({ username, email, password, phone_number });
      localStorage.setItem('ticketpulse_auth', JSON.stringify({ username, password }));
      setUser(userData);
      return userData;
    } catch (err) {
      localStorage.removeItem('ticketpulse_auth');
      throw err;
    }
  };

  const logoutUser = async () => {
    try {
      await authAPI.logout();
    } catch (e) {
      // Ignore logout errors if session already gone
    }
    localStorage.removeItem('ticketpulse_auth');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, registerUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
