import { createContext, useState, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Initialize state from localStorage
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      return JSON.parse(storedUser);
    }
    return null;
  });
  
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token');
  });

  // Register new user
  const register = async (email, password, name, phone) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        email,
        password,
        name,
        phone
      });

      if (response.data.success) {
        return { success: true, user: response.data.user };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      });

      if (response.data.success) {
        const userData = response.data.user;
        // TODO: Store JWT token when implemented
        const fakeToken = 'temp-token-' + Date.now();
        
        setUser(userData);
        setToken(fakeToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', fakeToken);
        
        return { success: true, user: userData };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  // Logout user
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      // TODO: Implement API endpoint
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    token,
    loading: false,
    register,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}