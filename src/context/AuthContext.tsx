import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
  currentUser: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get('/session', { withCredentials: true });
        console.log('Session response:', response.data); // Debugging statement
        if (response.data.user) {
          setCurrentUser(response.data.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('No active session found', error);
      }
    };
    checkSession();
  }, []);

  const login = async (email: string) => {
    try {
      const response = await axios.post('/api/login', { email }, { withCredentials: true });
      setCurrentUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/logout', {}, { withCredentials: true });
      setIsAuthenticated(false);
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
