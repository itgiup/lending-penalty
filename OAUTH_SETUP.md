# 🔐 OAuth 2.0 Setup Guide - Google & Facebook Login

##  Overview

This guide explains how to set up Google and Facebook OAuth login for the Lending Penalty application.

---

## ✅ Current Status

### **Frontend (Complete)**
- ✅ Google/Facebook buttons added to Login page
- ✅ Google/Facebook buttons added to Register page
- ✅ AuthContext updated with `loginWithGoogle()` and `loginWithFacebook()` functions
- ✅ Mock OAuth flow implemented for demo purposes

### **Backend (Complete)**
- ✅ `/api/auth/google` endpoint created
- ✅ `/api/auth/facebook` endpoint created
- ✅ Database schema supports `google_id` and `facebook_id` fields
- ✅ Auto-create user if not exists

### **Demo Mode (Active)**
Currently, OAuth works in **demo mode**:
- Simulates successful login without real OAuth flow
- Creates mock users with fake Google/Facebook IDs
- Perfect for testing UI and flow

---

## 🚀 Production Setup

To enable real OAuth login, follow these steps:

### **1. Google OAuth Setup**

#### **Step 1.1: Create Google Cloud Project**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API**

#### **Step 1.2: Configure OAuth Consent Screen**
1. Go to **APIs & Services → OAuth consent screen**
2. Choose **External** user type
3. Fill in app details:
   - App name: "Lending Penalty"
   - User support email: your email
   - Developer contact information: your email
4. Add scopes: `email`, `profile`, `openid`
5. Add test users (during development)

#### **Step 1.3: Create OAuth Credentials**
1. Go to **APIs & Services → Credentials**
2. Click **Create Credentials → OAuth client ID**
3. Application type: **Web application**
4. Name: "Lending Penalty Web Client"
5. Authorized JavaScript origins:
   ```
   http://localhost:5173
   https://your-domain.com
   ```
6. Authorized redirect URIs:
   ```
   http://localhost:5173/oauth/callback/google
   https://your-domain.com/oauth/callback/google
   ```
7. Copy **Client ID** and **Client Secret**

#### **Step 1.4: Install Google OAuth Library**
```bash
cd apps/api
pnpm add google-auth-library
```

#### **Step 1.5: Update Backend Code**
Replace mock implementation in `apps/api/src/index.ts`:

```typescript
import { OAuth2Client } from 'google-auth-library';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const oauth2Client = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  'http://localhost:8787/oauth/callback/google'
);

app.post('/api/auth/google', async (c) => {
  try {
    const db = c.env.DB;
    const { code } = await c.req.json(); // Authorization code from frontend
    
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    // Get user info
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`
      }
    });
    
    const googleUser = await response.json();
    
    // Find or create user
    let user = await db.prepare(
      'SELECT id, email, name, phone, google_id FROM users WHERE google_id = ? OR email = ?'
    ).bind(googleUser.id, googleUser.email).first();
    
    if (!user) {
      const id = generateId();
      await db.prepare(
        'INSERT INTO users (id, email, name, google_id, created_at, updated_at) VALUES (?, ?, ?, ?, datetime("now"), datetime("now"))'
      ).bind(id, googleUser.email, googleUser.name, googleUser.id).run();
      
      user = { id, email: googleUser.email, name: googleUser.name, phone: null };
    }
    
    return c.json({
      success: true,
      message: 'Google login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        google_id: user.google_id
      }
    });
  } catch (error) {
    return c.json({ error: 'Google login failed', message: error.message }, 500);
  }
});
```

#### **Step 1.6: Update Frontend Code**
Replace mock implementation in `apps/web/src/context/AuthContext.jsx`:

```javascript
// Install Google OAuth library
// pnpm add @react-oauth/google

import { useGoogleLogin } from '@react-oauth/google';

const loginWithGoogle = async () => {
  try {
    // Use Google OAuth hook
    const response = await googleLogin({
      onSuccess: async (credentialResponse) => {
        // Send credential to backend
        const result = await axios.post(`${API_URL}/api/auth/google`, {
          credential: credentialResponse.credential
        });
        
        if (result.data.success) {
          const userData = result.data.user;
          const fakeToken = 'temp-token-google-' + Date.now();
          
          setUser(userData);
          setToken(fakeToken);
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('token', fakeToken);
          
          return { success: true, user: userData };
        }
      },
      onError: () => {
        console.error('Google login failed');
        return { success: false, error: 'Google login failed' };
      }
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
};
```

---

### **2. Facebook OAuth Setup**

#### **Step 2.1: Create Facebook App**
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps → Create App**
3. Choose **Consumer** app type
4. App name: "Lending Penalty"
5. Contact email: your email

#### **Step 2.2: Configure Facebook Login**
1. In app dashboard, go to **Products → Facebook Login → Settings**
2. Valid OAuth Redirect URIs:
   ```
   http://localhost:5173/oauth/callback/facebook
   https://your-domain.com/oauth/callback/facebook
   ```
3. Save changes

#### **Step 2.3: Get App Credentials**
1. Go to **Settings → Basic**
2. Copy **App ID** and **App Secret**

#### **Step 2.4: Install Facebook SDK**
```bash
cd apps/web
pnpm add react-facebook-login
```

#### **Step 2.5: Update Frontend Code**
```javascript
import FacebookLogin from 'react-facebook-login';

const handleFacebookLogin = async (response) => {
  try {
    const result = await axios.post(`${API_URL}/api/auth/facebook`, {
      accessToken: response.accessToken,
      userID: response.userID
    });
    
    if (result.data.success) {
      const userData = result.data.user;
      const fakeToken = 'temp-token-facebook-' + Date.now();
      
      setUser(userData);
      setToken(fakeToken);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', fakeToken);
      
      return { success: true, user: userData };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};
```

---

## 🔒 Security Best Practices

### **1. Environment Variables**
Never commit credentials! Use `.env.local`:

```bash
# apps/api/.env.local
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

Add to `.gitignore`:
```
.env.local
.env.*.local
```

### **2. HTTPS Required**
OAuth requires HTTPS in production:
- Use Let's Encrypt for free SSL certificates
- Or use Cloudflare proxy

### **3. Token Validation**
Always validate OAuth tokens on the backend:
```typescript
// Verify Google token
const ticket = await oauth2Client.verifyIdToken({
  idToken: credential,
  audience: GOOGLE_CLIENT_ID
});
const payload = ticket.getPayload();
```

### **4. Rate Limiting**
Implement rate limiting to prevent abuse:
```typescript
// Example: Max 10 OAuth attempts per IP per hour
const rateLimit = new Map();
```

---

## 🧪 Testing

### **Test Demo Mode**
1. Start both servers:
   ```bash
   cd /home/u/Documents/lending-penalty
   pnpm dev
   ```

2. Open http://localhost:5174/register
3. Click "Google" button → Should create mock Google user
4. Click "Facebook" button → Should create mock Facebook user
5. Check localStorage for user data

### **Test Real OAuth (After Setup)**
1. Configure Google/Facebook credentials
2. Restart servers
3. Try login with real Google/Facebook accounts
4. Verify user is created in database

---

##  Database Schema

### **Users Table**
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,           -- For email/password login
  name TEXT,
  phone TEXT,
  google_id TEXT UNIQUE,        -- For Google OAuth
  facebook_id TEXT UNIQUE,      -- For Facebook OAuth
  passkey_credentials TEXT,     -- For Passkey auth (future)
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### **Indexes**
```sql
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_facebook_id ON users(facebook_id);
```

---

## 🎯 Next Steps

### **Phase 1: Demo Mode (✅ Complete)**
- [x] UI buttons added
- [x] Mock OAuth flow
- [x] Backend endpoints ready

### **Phase 2: Real OAuth Integration (TODO)**
- [ ] Set up Google Cloud project
- [ ] Set up Facebook developer app
- [ ] Install OAuth libraries
- [ ] Implement real OAuth flow
- [ ] Test with real accounts

### **Phase 3: Advanced Features (Future)**
- [ ] JWT token generation
- [ ] Refresh token rotation
- [ ] Account linking (connect multiple providers)
- [ ] OAuth logout
- [ ] Session management

---

## 🐛 Troubleshooting

### **Issue: "Invalid redirect URI"**
**Solution:** Make sure redirect URI in Google/Facebook console matches exactly:
- Protocol (http/https)
- Domain
- Port
- Path

### **Issue: "CORS error"**
**Solution:** Ensure CORS is enabled in backend:
```typescript
app.use('*', cors());
```

### **Issue: "User already exists"**
**Solution:** The OAuth endpoint checks both OAuth ID and email. If email exists but OAuth ID doesn't, it will link them.

---

## 📚 Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
- [Hono OAuth Examples](https://hono.dev/examples)
- [OAuth 2.0 Simplified](https://aaronparecki.com/oauth-2-simplified/)

---

## 🎉 Success Criteria

OAuth integration is complete when:
✅ Users can click Google/Facebook buttons  
✅ Redirect to provider login page works  
✅ Callback URL receives authorization code  
✅ Backend exchanges code for access token  
✅ User info retrieved from provider  
✅ User created/updated in database  
✅ Session established successfully  

---

**Happy coding! 🚀**