git add .
git commit -m "feat: Add Google and Facebook OAuth login buttons

UI Changes:
- Added Google/Facebook OAuth buttons to Login page
- Added Google/Facebook OAuth buttons to Register page
- Styled buttons with brand colors (Google red, Facebook blue)
- Added loading states for OAuth login

Frontend Implementation:
- Updated AuthContext.jsx with loginWithGoogle() and loginWithFacebook() functions
- Implemented mock OAuth flow for demo purposes
- Auto-create users on first OAuth login
- Store user data in localStorage

Backend Implementation:
- Created /api/auth/google endpoint for Google OAuth
- Created /api/auth/facebook endpoint for Facebook OAuth
- Auto-find or create user based on OAuth ID or email
- Return user info with OAuth provider ID

Database Schema:
- Users table already has google_id and facebook_id columns
- Added indexes for better performance on OAuth lookups
- Supports multiple auth methods per user (email + OAuth)

Demo Mode Features:
- Simulates successful OAuth login without real credentials
- Creates mock users with fake Google/Facebook IDs
- Perfect for testing UI flow before production setup

Production Ready:
- Endpoints ready for real OAuth integration
- Documentation provided in OAUTH_SETUP.md
- Security best practices outlined

Files Changed:
- apps/web/src/pages/Login.jsx - Added OAuth buttons
- apps/web/src/pages/Register.jsx - Added OAuth buttons  
- apps/web/src/context/AuthContext.jsx - Added OAuth handlers
- apps/api/src/index.ts - Added OAuth endpoints
- apps/api/schema.sql - Added OAuth indexes
- OAUTH_SETUP.md - Complete setup guide

Technical Improvements:
- Clean separation between demo and production mode
- Easy migration path to real OAuth
- Backward compatible with existing email/password login
- No breaking changes to existing functionality"

git push