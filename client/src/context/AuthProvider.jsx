import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const API_URL = 'http://localhost:8080';

  const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
  });

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const newToken = await refreshToken();
        if (newToken) {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      }
      return Promise.reject(error);
    }
  );

  const isTokenExpired = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return true;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');
      const refreshTokenValue = localStorage.getItem('refreshToken');

      if (token && storedUser && refreshTokenValue) {
        try {
          if (!isTokenExpired(token)) {
            setIsAuthenticated(true);
            setUser(JSON.parse(storedUser));
          } else {
            const newToken = await refreshToken();
            if (newToken) {
              setIsAuthenticated(true);
              setUser(JSON.parse(storedUser));
            } else {
              logout();
            }
          }
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          logout();
        }
      } else {
        logout();
      }
      setIsAuthLoading(false);
    };

    initializeAuth();
  }, []);

  const refreshToken = async () => {
    const refreshTokenValue = localStorage.getItem('refreshToken');
    if (!refreshTokenValue) {
      logout();
      return null;
    }

    try {
      const response = await api.post('${APP_URL}/api/auth/refresh-token', {
        refreshToken: refreshTokenValue,
      });
      const data = response.data;
      if (!data?.accessToken) {
        throw new Error('Invalid refresh token response');
      }
      localStorage.setItem('accessToken', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      return data.accessToken;
    } catch (error) {
      console.error('Refresh token error:', error);
      logout();
      return null;
    }
  };

  const login = (tokens, userData) => {
    if (!tokens?.accessToken || !tokens?.refreshToken || !userData) {
      console.error('Invalid login data');
      return false;
    }

    try {
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setIsAuthenticated(true);
      setUser(userData);
      setIsAuthLoading(false);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshTokenValue = localStorage.getItem('refreshToken');

    if (accessToken && refreshTokenValue) {
      try {
        await api.post('${APP_URL}/api/auth/logout', {
          accessToken,
          refreshToken: refreshTokenValue,
        });
      } catch (error) {
        console.error('Logout API error:', error);
      }
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setIsAuthLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, refreshToken, isAuthLoading, api }}
    >
      {children}
    </AuthContext.Provider>
  );
};