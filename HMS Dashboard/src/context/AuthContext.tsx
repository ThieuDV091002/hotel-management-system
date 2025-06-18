import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-toastify';
import { Role } from './Role';

interface User {
  id: number;
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  role: Role;
  active: boolean;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (tokens: TokenPair, userData: User) => boolean;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => false,
  logout: async () => {},
  refreshToken: async () => null,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const API_URL = 'http://localhost:8080';

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        if (parsedUser.role === Role.CUSTOMER) {
          logout();
          toast.error('Access denied: CUSTOMER role is not allowed');
        } else {
          setIsAuthenticated(true);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        logout();
      }
    }
  }, []);

  const refreshToken = async (): Promise<string | null> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      logout();
      return null;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data: TokenPair = await response.json();
        if (!data?.accessToken) {
          throw new Error('Invalid refresh token response');
        }
        localStorage.setItem('accessToken', data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        return data.accessToken;
      } else {
        logout();
        return null;
      }
    } catch (error) {
      console.error('Refresh token error:', error);
      logout();
      return null;
    }
  };

  const login = (tokens: TokenPair, userData: User): boolean => {
    if (!tokens?.accessToken || !tokens?.refreshToken || !userData) {
      console.error('Invalid login data');
      toast.error('Invalid login data');
      return false;
    }

    if (userData.role === Role.CUSTOMER) {
      console.error('Access denied: CUSTOMER role is not allowed');
      toast.error('Access denied: CUSTOMER role is not allowed');
      return false;
    }

    try {
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setIsAuthenticated(true);
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed due to an error');
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (accessToken && refreshToken) {
      try {
        const response = await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken, refreshToken }),
        });

        if (!response.ok) {
          console.warn('Logout API failed:', response.status);
        }
      } catch (error) {
        console.error('Logout API error:', error);
      }
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};