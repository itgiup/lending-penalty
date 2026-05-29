import { useGoogleLogin } from '@react-oauth/google';
import axios, { AxiosResponse } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

// Type definitions
interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface UserData {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  google_id?: string;
  facebook_id?: string;
  picture?: string;
  created_at?: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  user?: UserData;
  error?: string;
}

interface UseGoogleOAuthReturn {
  login: () => void;
}

/**
 * Custom hook for Google OAuth login
 * Usage: Call this in React components (not in Context)
 */
export const useGoogleOAuth = (): UseGoogleOAuthReturn => {
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse: OAuthTokenResponse) => {
      try {
        console.log('Google OAuth success, token:', tokenResponse);
        
        // Send access token to backend for verification
        const response: AxiosResponse<AuthResponse> = await axios.post(`${API_URL}/api/auth/google`, {
          credential: tokenResponse.access_token
        });

        if (response.data.success && response.data.user) {
          const userData: UserData = response.data.user;
          
          // Store user data
          const fakeToken = 'temp-token-google-' + Date.now();
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('token', fakeToken);
          
          // Dispatch custom event to notify AuthContext
          window.dispatchEvent(new CustomEvent('oauth-login-success', {
            detail: { user: userData, token: fakeToken, provider: 'google' }
          }));
          
          alert('Đăng nhập Google thành công!');
        } else {
          throw new Error(response.data.error || 'Google login failed');
        }
      } catch (error) {
        console.error('Google OAuth error:', error);
        alert('Đăng nhập Google thất bại: ' + (error instanceof Error ? error.message : String(error)));
      }
    },
    onError: (error) => {
      console.error('Google OAuth error:', error);
      alert('Đăng nhập Google thất bại');
    },
    flow: 'implicit' // Use implicit flow for simpler setup
  });

  return {
    login: () => {
      console.log('Triggering Google login...');
      googleLogin();
    }
  };
};