# 🔐 OAuth Credentials Setup Guide

## 📋 Overview

This guide helps you set up real Google and Facebook OAuth credentials for production use.

---

## 🎯 Current Status

✅ **Code Implementation**: Complete  
✅ **Backend Endpoints**: Ready with token verification  
✅ **Frontend Integration**: Real OAuth hooks implemented  
⚠️ **Credentials**: Need to be configured  

---

## 🔑 Step 1: Google OAuth Setup

### **1.1 Create Google Cloud Project**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Name: `Lending Penalty`
4. Click **"Create"**
5. Wait for project creation (1-2 minutes)

### **1.2 Enable Google+ API**

1. In the sidebar, go to **APIs & Services → Library**
2. Search for **"Google+ API"**
3. Click on it → **"Enable"**

### **1.3 Configure OAuth Consent Screen**

1. Go to **APIs & Services → OAuth consent screen**
2. Choose **"External"** user type
3. Fill in required fields:
   - **App name**: Lending Penalty
   - **User support email**: your-email@gmail.com
   - **Developer contact information**: your-email@gmail.com
4. Click **"Save and Continue"**

#### **Scopes**
1. Click **"Add or Remove Scopes"**
2. Add these scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`
3. Click **"Update"** → **"Save and Continue"**

#### **Test Users**
1. Click **"+ Add Users"**
2. Add your email address (for testing)
3. Click **"Save and Continue"**
4. Review summary → **"Back to Dashboard"**

### **1.4 Create OAuth Credentials**

1. Go to **APIs & Services → Credentials**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Application type: **"Web application"**
4. Name: `Lending Penalty Web Client`

#### **Authorized JavaScript Origins**
```
http://localhost:5173
http://localhost:5174
https://your-domain.com
```

#### **Authorized Redirect URIs**
```
http://localhost:5173/oauth/callback/google
http://localhost:5174/oauth/callback/google
https://your-domain.com/oauth/callback/google
```

5. Click **"Create"**

### **1.5 Copy Credentials**

You'll see a popup with:
- **Client ID**: `123456789012-abc123def456.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-xyz789abc123`

**⚠️ IMPORTANT**: Copy both values and save them securely!

---

## 🔑 Step 2: Facebook OAuth Setup

### **2.1 Create Facebook App**

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **"My Apps"** → **"Create App"**
3. Choose **"Consumer"** app type
4. Click **"Next"**
5. App name: `Lending Penalty`
6. App contact email: your-email@gmail.com
7. Click **"Create App"**

### **2.2 Add Facebook Login Product**

1. In app dashboard, scroll down to **"Add a Product"**
2. Find **"Facebook Login"** → **"Set Up"**
3. Choose **"Web"** platform
4. Site URL: `http://localhost:5173`
5. Click **"Save"**

### **2.3 Configure Facebook Login Settings**

1. In left sidebar, go to **Products → Facebook Login → Settings**
2. **Valid OAuth Redirect URIs**:
   ```
   http://localhost:5173/oauth/callback/facebook
   http://localhost:5174/oauth/callback/facebook
   https://your-domain.com/oauth/callback/facebook
   ```
3. Click **"Save Changes"**

### **2.4 Get App Credentials**

1. Go to **Settings → Basic** (in left sidebar)
2. You'll see:
   - **App ID**: `123456789012345`
   - **App Secret**: `abc123def456ghi789jkl012mno345`

**⚠️ IMPORTANT**: Copy both values! You may need to click "Show" to reveal the secret.

---

## 🔧 Step 3: Configure Environment Variables

### **3.1 Update Frontend .env.local**

Edit `/home/u/Documents/lending-penalty/apps/web/.env.local`:

```bash
# API Configuration
VITE_API_URL=http://localhost:8787

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=123456789012-abc123def456.apps.googleusercontent.com

# Facebook OAuth Configuration  
VITE_FACEBOOK_APP_ID=123456789012345
```

**Replace with your actual credentials!**

### **3.2 Update Backend Environment**

For local development, create `/home/u/Documents/lending-penalty/apps/api/.env.local`:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=123456789012-abc123def456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xyz789abc123

# Facebook OAuth
FACEBOOK_APP_ID=123456789012345
FACEBOOK_APP_SECRET=abc123def456ghi789jkl012mno345
```

For Cloudflare Workers production:
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select your Worker
3. Go to **Settings → Variables**
4. Add each variable as a secret or plain text variable

---

## 🧪 Step 4: Test OAuth Flow

### **4.1 Restart Servers**

```bash
cd /home/u/Documents/lending-penalty
pnpm dev
```

### **4.2 Test Google Login**

1. Open http://localhost:5174/register
2. Click **"Google"** button
3. Should redirect to Google login page
4. Select your test account
5. Approve permissions
6. Should redirect back and create user
7. Check localStorage for user data

### **4.3 Test Facebook Login**

1. Open http://localhost:5174/login
2. Click **"Facebook"** button
3. Should open Facebook login popup
4. Enter credentials
5. Approve permissions
6. Should close popup and create user
7. Check localStorage for user data

---

## ✅ Success Checklist

- [ ] Google Cloud project created
- [ ] Google+ API enabled
- [ ] OAuth consent screen configured
- [ ] OAuth credentials created
- [ ] Client ID copied to `.env.local`
- [ ] Facebook app created
- [ ] Facebook Login product added
- [ ] App ID copied to `.env.local`
- [ ] Servers restarted
- [ ] Google login tested successfully
- [ ] Facebook login tested successfully

---

## 🐛 Troubleshooting

### **Issue: "Invalid Client" Error**

**Solution**: 
- Check if Client ID is correct in `.env.local`
- Verify Authorized JavaScript origins match your domain
- Ensure OAuth consent screen is published

### **Issue: "Redirect URI Mismatch"**

**Solution**:
- Check redirect URIs in Google/Facebook console
- Ensure they exactly match (including protocol, port, path)
- No trailing slashes allowed

### **Issue: "App Not Verified"**

**Solution** (Google):
- This is normal for test mode
- Add your email to test users list
- Or submit app for verification (for production)

### **Issue: Facebook Popup Blocked**

**Solution**:
- Allow popups for localhost in browser settings
- Try different browser
- Check ad blocker extensions

---

## 🔒 Security Best Practices

### **1. Never Commit Credentials**

Add to `.gitignore`:
```
.env.local
.env.*.local
*.env
```

### **2. Use Environment Variables**

Never hardcode credentials in source code!

### **3. HTTPS Required in Production**

OAuth requires HTTPS for production domains. Use:
- Let's Encrypt (free SSL)
- Cloudflare proxy
- Vercel/Netlify auto-SSL

### **4. Token Validation**

Backend already validates tokens:
- Google: Uses `google-auth-library` to verify ID tokens
- Facebook: Calls Graph API to verify access tokens

### **5. Rate Limiting**

Consider implementing rate limiting on OAuth endpoints to prevent abuse.

---

## 📚 Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
- [OAuth 2.0 Simplified](https://aaronparecki.com/oauth-2-simplified/)
- [Cloudflare Workers Secrets](https://developers.cloudflare.com/workers/configuration/secrets/)

---

## 🎉 Next Steps

After successful OAuth setup:

1. ✅ Remove demo mode fallback code (optional)
2. ✅ Implement JWT token generation
3. ✅ Add account linking UI
4. ✅ Implement OAuth logout
5. ✅ Add session management
6. ✅ Deploy to production

---

**Need Help?** Check the error messages and refer to official documentation above! 