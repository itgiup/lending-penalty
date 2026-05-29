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

  // Login with Google OAuth
  const loginWithGoogle = async () => {
    try {
      // For now, simulate OAuth flow
      // In production, this would redirect to Google OAuth page
      const mockGoogleUser = {
        id: `google-${Date.now()}`,
        email: 'user@gmail.com',
        name: 'Google User',
        google_id: '1234567890',
        created_at: new Date().toISOString()
      };

      // Try to login via API first
      const response = await axios.post(`${API_URL}/api/auth/google`, {
        email: mockGoogleUser.email,
        name: mockGoogleUser.name,
        google_id: mockGoogleUser.google_id
      });

      if (response.data.success) {
        const userData = response.data.user;
        const fakeToken = 'temp-token-google-' + Date.now();
        
        setUser(userData);
        setToken(fakeToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', fakeToken);
        
        return { success: true, user: userData };
      }
    } catch (error) {
      // If API fails, use mock user for demo
      console.log('Google OAuth API not ready, using mock user');
      const mockGoogleUser = {
        id: `google-${Date.now()}`,
        email: 'user@gmail.com',
        name: 'Google User',
        google_id: '1234567890',
        created_at: new Date().toISOString()
      };
      
      const fakeToken = 'temp-token-google-' + Date.now();
      
      setUser(mockGoogleUser);
      setToken(fakeToken);
      localStorage.setItem('user', JSON.stringify(mockGoogleUser));
      localStorage.setItem('token', fakeToken);
      
      return { success: true, user: mockGoogleUser };
    }
  };

  // Login with Facebook OAuth
  const loginWithFacebook = async () => {
    try {
      // For now, simulate OAuth flow
      // In production, this would redirect to Facebook OAuth page
      const mockFacebookUser = {
        id: `facebook-${Date.now()}`,
        email: 'user@facebook.com',
        name: 'Facebook User',
        facebook_id: '1234567890',
        created_at: new Date().toISOString()
      };

      // Try to login via API first
      const response = await axios.post(`${API_URL}/api/auth/facebook`, {
        email: mockFacebookUser.email,
        name: mockFacebookUser.name,
        facebook_id: mockFacebookUser.facebook_id
      });

      if (response.data.success) {
        const userData = response.data.user;
        const fakeToken = 'temp-token-facebook-' + Date.now();
        
        setUser(userData);
        setToken(fakeToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', fakeToken);
        
        return { success: true, user: userData };
      }
    } catch (error) {
      // If API fails, use mock user for demo
      console.log('Facebook OAuth API not ready, using mock user');
      const mockFacebookUser = {
        id: `facebook-${Date.now()}`,
        email: 'user@facebook.com',
        name: 'Facebook User',
        facebook_id: '1234567890',
        created_at: new Date().toISOString()
      };
      
      const fakeToken = 'temp-token-facebook-' + Date.now();
      
      setUser(mockFacebookUser);
      setToken(fakeToken);
      localStorage.setItem('user', JSON.stringify(mockFacebookUser));
      localStorage.setItem('token', fakeToken);
      
      return { success: true, user: mockFacebookUser };
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
    loginWithGoogle,
    loginWithFacebook,
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