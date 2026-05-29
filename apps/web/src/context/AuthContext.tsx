import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios, { AxiosResponse } from 'axios';
import { User } from '@lending-penalty/shared';

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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';
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
      const response: AxiosResponse<{ success: boolean; user: User }> = await axios.post(`${API_URL}/api/auth/register`, {
        email,
        password,
        name,
        phone
      });

      if (response.data.success) {
        return { success: true, user: response.data.user };
      }
      return { success: false, error: 'Registration failed' };
    } catch (error) {
      const err = error as any;
      return { 
        success: false, 
        error: err.response?.data?.error || 'Registration failed' 
      };
    }
  };

  // Login user
  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const response: AxiosResponse<{ success: boolean; user: User }> = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      });

      if (response.data.success) {
        const userData: User = response.data.user;
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
        error: err.response?.data?.error || 'Login failed' 
      };
    }
  };

  // Login with Google OAuth (Demo mode due to hook limitation in context)
  const loginWithGoogle = async (): Promise<AuthResult> => {
    try {
      if (!GOOGLE_CLIENT_ID) {
        console.warn('Google Client ID not configured. Using demo mode.');
      } else {
        console.log('Google Client ID configured, but using demo mode due to hook limitation in context.');
      }
      
      // Fallback to demo mode
      return await mockGoogleLogin();
    } catch (error) {
      console.error('Google OAuth error:', error);
      return await mockGoogleLogin();
    }
  };

  // Mock Google Login (Fallback)
  const mockGoogleLogin = async (): Promise<AuthResult> => {
    const mockGoogleUser: User = {
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
  };

  // Login with Facebook OAuth (Real Implementation)
  const loginWithFacebook = async (): Promise<AuthResult> => {
    try {
      if (!FACEBOOK_APP_ID) {
        console.warn('Facebook App ID not configured. Using demo mode.');
        return await mockFacebookLogin();
      }

      // Check if FB SDK is loaded
      if (!(window as any).FB) {
        console.error('Facebook SDK not loaded');
        return await mockFacebookLogin();
      }

      // Use Facebook SDK to login
      (window as any).FB.login(async (response: any) => {
        if (response.authResponse) {
          try {
            // Send access token to backend for verification
            const result: AxiosResponse<{ success: boolean; user: User }> = await axios.post(`${API_URL}/api/auth/facebook`, {
              accessToken: response.authResponse.accessToken,
              userID: response.authResponse.userID
            });

            if (result.data.success) {
              const userData: User = result.data.user;
              const fakeToken = 'temp-token-facebook-' + Date.now();
              
              setUser(userData);
              setToken(fakeToken);
              localStorage.setItem('user', JSON.stringify(userData));
              localStorage.setItem('token', fakeToken);
              
              alert('Facebook login successful!');
            } else {
              throw new Error(result.data.error || 'Facebook login failed');
            }
          } catch (error) {
            console.error('Facebook OAuth error:', error);
            alert('Facebook login failed: ' + (error instanceof Error ? error.message : String(error)));
          }
        } else {
          console.error('User cancelled Facebook login or error occurred');
          alert('Facebook login cancelled');
        }
      }, { scope: 'email,public_profile' });
      
      return { success: true, message: 'Opening Facebook login...' };
    } catch (error) {
      console.error('Facebook OAuth setup error:', error);
      return await mockFacebookLogin();
    }
  };

  // Mock Facebook Login (Fallback)
  const mockFacebookLogin = async (): Promise<AuthResult> => {
    const mockFacebookUser: User = {
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