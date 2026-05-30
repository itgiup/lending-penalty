import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authAPI } from '../api/client';
import { API_BASE_URL, User } from '@lending-penalty/shared';

// Type definitions
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  register: (email: string, password: string, name: string, phone?: string) => Promise<AuthResult>;
  login: (email: string, password: string) => Promise<AuthResult>;
  loginWithGoogle: () => Promise<AuthResult>;
  loginWithFacebook: () => Promise<AuthResult>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  isAuthenticated: boolean;
}

interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  message?: string;
}

interface OAuthEventDetail {
  user: User;
  token: string;
  provider: 'google' | 'facebook';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
console.log(import.meta);

const API_URL = import.meta.env.VITE_API_URL || API_BASE_URL;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID || '';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(() => {
    // Initialize state from localStorage
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      try {
        return JSON.parse(storedUser) as User;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  // Listen for OAuth login success events
  useEffect(() => {
    const handleOAuthLoginSuccess = (event: CustomEvent<OAuthEventDetail>) => {
      const { user, token, provider } = event.detail;
      console.log(`OAuth login success from ${provider}:`, user);

      setUser(user);
      setToken(token);
    };

    window.addEventListener('oauth-login-success', handleOAuthLoginSuccess as EventListener);

    return () => {
      window.removeEventListener('oauth-login-success', handleOAuthLoginSuccess as EventListener);
    };
  }, []);

  // Register new user
  const register = async (email: string, password: string, name: string, phone?: string): Promise<AuthResult> => {
    try {
      const response = await authAPI.register({
        json: {
          email,
          password,
          name,
          phone
        }
      });

      const data = await response.json();

      if (data.success) {
        return { success: true, user: data.user };
      }
      return { success: false, error: 'Registration failed' };
    } catch (error) {
      const err = error as any;
      return {
        success: false,
        error: err.message || 'Registration failed'
      };
    }
  };

  // Login user
  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const response = await authAPI.login({
        json: {
          email,
          password
        }
      });

      const data = await response.json();

      if (data.success) {
        const userData: User = data.user;
        // TODO: Store JWT token when implemented
        const fakeToken = 'temp-token-' + Date.now();

        setUser(userData);
        setToken(fakeToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', fakeToken);

        return { success: true, user: userData };
      }
      return { success: false, error: 'Login failed' };
    } catch (error) {
      const err = error as any;
      return {
        success: false,
        error: err.message || 'Login failed'
      };
    }
  };

  // Login with Google OAuth (Demo mode due to hook limitation in context)
  const loginWithGoogle = async (): Promise<AuthResult> => {
   
  };


  // Login with Facebook OAuth (Real Implementation)
  const loginWithFacebook = async (): Promise<AuthResult> => {
    throw new Error('Not implemented');
  };


  // Logout user
  const logout = (): void => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Update user profile
  const updateProfile = async (updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    try {
      // TODO: Implement API endpoint
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser as User);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { success: true };
    } catch (error) {
      const err = error as Error;
      return { success: false, error: err.message };
    }
  };

  const value: AuthContextType = {
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
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}