import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMe = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.data);
    } catch (err) {
      setUser(null);
      localStorage.removeItem('accessToken');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchMe();
    } else {
      setLoading(false);
    }

    const handleLogout = () => {
      setUser(null);
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const { accessToken, user: userData } = data.data;
      localStorage.setItem('accessToken', accessToken);
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const { data } = await api.post('/auth/register', userData);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    }
  };

  const verifyEmail = async (email, otp) => {
    try {
      const { data } = await api.post('/auth/verify-email', { email, otp });
      const { accessToken, user: userData } = data.data;
      localStorage.setItem('accessToken', accessToken);
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
      throw err;
    }
  };

  const resendOtp = async (email) => {
    try {
      const { data } = await api.post('/auth/resend-otp', { email });
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      setUser(null);
      localStorage.removeItem('accessToken');
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, verifyEmail, resendOtp, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
