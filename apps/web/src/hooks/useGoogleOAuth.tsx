import { useGoogleLogin } from '@react-oauth/google';
import { authAPI } from '../api/client';

// Type definitions
interface UseGoogleOAuthReturn {
  login: () => void;
}

/**
 * Custom hook for Google OAuth login
 * Usage: Call this in React components (not in Context)
 */
export const useGoogleOAuth = (): UseGoogleOAuthReturn => {
  const googleLogin = useGoogleLogin({
    onSuccess: async (response: any) => {
      try {
        console.log('Google OAuth success, full response:', response);
        
        // The @react-oauth/google library should return the ID token directly
        // The response object should contain the credential field which is the ID token
        let idToken: string | undefined;
        
        // Check if the response has the expected credential field (ID token)
        if (response.credential) {
          idToken = response.credential;
          console.log('Using credential (ID token) field from response');
        } else {
          // If no credential field, this suggests a configuration issue
          console.error('Response does not contain credential field. Check Google OAuth configuration.');
          console.log('Available response keys:', Object.keys(response));
          
          // Try to find any JWT-like token in the response
          for (const [key, value] of Object.entries(response)) {
            if (typeof value === 'string' && value.includes('.') && value.split('.').length === 3) {
              // This looks like a JWT token
              idToken = value as string;
              console.log(`Found potential JWT token in ${key} field`);
              break;
            }
          }
        }
        
        if (!idToken) {
          throw new Error('No valid ID token received from Google. Make sure your Google OAuth is configured correctly and the client ID is valid.');
        }
        
        console.log('Sending ID token to backend:', idToken.substring(0, 20) + '...');
        
        // Use the Hono RPC client with the correct function signature
        const apiResponse = await authAPI.google({ 
          credential: idToken
        });

        // Convert response to JSON since Hono client returns Response object
        const responseData = await apiResponse.json();

        console.log('Backend response:', responseData);

        if (responseData.success && responseData.user) {
          const userData = responseData.user;
          
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
          throw new Error(responseData.error || 'Google login failed');
        }
      } catch (error) {
        console.error('Google OAuth error:', error);
        alert('Đăng nhập Google thất bại: ' + (error instanceof Error ? error.message : String(error)));
      }
    },
    onError: (error) => {
      console.error('Google OAuth error during login:', error);
      alert('Đăng nhập Google thất bại: ' + JSON.stringify(error));
    }
  });

  return {
    login: () => {
      console.log('Triggering Google login...');
      googleLogin();
    }
  };
};