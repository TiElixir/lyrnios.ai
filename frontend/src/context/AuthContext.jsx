import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = 'http://localhost:8000';

// Pre-configured axios instance with auth headers
const createApiClient = (token) => {
  const instance = axios.create({
    baseURL: API_URL,
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return instance;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      setToken(savedToken);
      fetchUser(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch user data with token
  const fetchUser = async (authToken) => {
    try {
      const response = await axios.get(`${API_URL}/auth/user`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Login with token (called after OAuth redirect)
  const login = (authToken) => {
    localStorage.setItem('auth_token', authToken);
    setToken(authToken);
    fetchUser(authToken);
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  };

  // Google login redirect
  const loginWithGoogle = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  // Create API client with current token
  const apiClient = token ? createApiClient(token) : createApiClient(null);

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    loginWithGoogle,
    isAuthenticated: !!user,
    apiClient
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
