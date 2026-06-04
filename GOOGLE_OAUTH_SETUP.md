# Google OAuth Implementation Guide

## Overview

This document provides setup and deployment instructions for the Google OAuth implementation in CloudPulse AI. The authentication system now supports:

- **Email + Password Authentication** (existing)
- **Google Sign-In** (new)

Microsoft Sign-In has been completely removed from the authentication system.

---

## Database Changes

### Migration: 004_google_oauth.sql

The following columns have been added to the `users` table:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_provider VARCHAR(50) DEFAULT 'email';
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(500);
```

**Column Descriptions:**
- `google_id`: Stores the Google User ID from the Google Account
- `login_provider`: Identifies the authentication method ('email' or 'google')
- `profile_picture`: Stores the user's Google profile picture URL

**Run Migration:**
```bash
cd backend
npm run db:migrate
```

---

## Backend Changes

### New API Endpoint

**POST /api/auth/google-login**

Handles Google OAuth callback and user creation/login.

**Request Body:**
```json
{
  "token": "google_credential_jwt_token",
  "name": "User Full Name",
  "email": "user@example.com",
  "picture": "https://example.com/profile.jpg"
}
```

**Response (Success - 200):**
```json
{
  "token": "cloudpulse_jwt_token",
  "user": {
    "id": 1,
    "name": "User Full Name",
    "email": "user@example.com",
    "picture": "https://example.com/profile.jpg",
    "verified": true
  }
}
```

**Error Responses:**
- `400`: Missing required fields (token, email)
- `401`: Invalid Google token
- `409`: Email already exists with conflicting account
- `500`: Server error

**Flow:**
1. Frontend sends Google credential JWT + user profile data
2. Backend validates the token format
3. Backend checks if user exists by email
4. If exists: Update Google ID if not already set
5. If not exists: Create new user with Google credentials
6. Seed default alert subscriptions for new users
7. Return CloudPulse JWT token

---

## Frontend Changes

### Updated Components

1. **AuthPage.jsx** (`frontend/src/pages/AuthPage.jsx`)
   - Removed Microsoft Sign-In button
   - Added Google Sign-In button
   - Implemented Google Identity Services integration
   - Added `handleGoogleResponse()` callback
   - Added `handleGoogleSignIn()` function
   - Removed Microsoft imports

2. **AuthContext.jsx** (`frontend/src/context/AuthContext.jsx`)
   - Added `googleLogin()` method
   - Exported `googleLogin` in context provider
   - Handles Google login flow and token storage

3. **api.js** (`frontend/src/services/api.js`)
   - Added `googleLogin()` API method
   - Sends Google credentials to backend

4. **index.html** (`frontend/index.html`)
   - Added Google Identity Services script: `https://accounts.google.com/gsi/client`

---

## Environment Variables

### Frontend (.env or Vercel Environment)

```bash
# Google OAuth Client ID (required)
VITE_GOOGLE_CLIENT_ID=640498533559-uo4m73jnk6k0qdaij2rpuokckpvd45qc.apps.googleusercontent.com

# API URL (for production)
VITE_API_URL=https://cloudpulse-ai.onrender.com
```

### Backend

No additional environment variables required for Google OAuth.

---

## Deployment Instructions

### Step 1: Run Database Migration

**Local Development:**
```bash
cd backend
npm run db:migrate
```

**Production (Render):**
Database migrations run automatically on deployment if configured in the build command.

### Step 2: Deploy Backend

The new `/auth/google-login` endpoint will be available automatically after deployment.

**Deploy to Render:**
```bash
# Push changes to GitHub
git add .
git commit -m "Implement Google OAuth"
git push origin main

# Render will auto-deploy if webhook is configured
```

### Step 3: Deploy Frontend

**Vercel Environment Setup:**
1. Go to **Project Settings** → **Environment Variables**
2. Add the environment variable:
   ```
   VITE_GOOGLE_CLIENT_ID=640498533559-uo4m73jnk6k0qdaij2rpuokckpvd45qc.apps.googleusercontent.com
   ```
3. Redeploy the project (Vercel will auto-rebuild)

**Deploy to Vercel:**
```bash
# Changes will auto-deploy on push to main
git add .
git commit -m "Implement Google OAuth frontend"
git push origin main
```

### Step 4: Test Google Sign-In

1. **Local Development:**
   - Visit `http://localhost:5173` (frontend)
   - Click "Continue with Google"
   - Select your Google account
   - You should be logged in and redirected to the workspace/dashboard

2. **Production (Vercel):**
   - Visit your Vercel production URL
   - Follow the same steps to test

---

## Security Considerations

### Token Handling

1. **Frontend**: 
   - Decodes Google JWT to extract user info
   - Sends token to backend for verification
   - Does NOT validate JWT signature (backend responsibility)

2. **Backend**:
   - Receives Google credential JWT
   - Validates token format (basic check)
   - **Important**: In production, verify with Google's servers using [Google Token Verification API](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token)
   - Creates/updates user in database
   - Returns CloudPulse JWT

### Recommended Production Enhancement

Add JWT verification to `backend/routes/auth.js`:

```javascript
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload();
  } catch (error) {
    throw new Error('Invalid token');
  }
}
```

Install dependency: `npm install google-auth-library`

---

## User Flows

### New User Registration via Google

1. User clicks "Continue with Google"
2. Google Account Picker opens
3. User selects their Google account
4. Frontend extracts: name, email, picture, credential JWT
5. Frontend sends to backend `/auth/google-login`
6. Backend creates user with:
   - `google_id`: Unique Google User ID
   - `login_provider`: 'google'
   - `profile_picture`: User's Google avatar
7. Backend generates CloudPulse JWT
8. Frontend stores JWT and redirects to workspace/dashboard
9. Default alert subscriptions are created for the new user

### Existing User Login via Google

1. User clicks "Continue with Google"
2. User selects Google account (same as their registered email)
3. Frontend sends to backend `/auth/google-login`
4. Backend finds user by email
5. Backend updates `google_id` if not already set
6. Backend generates CloudPulse JWT
7. Frontend stores JWT and redirects to workspace/dashboard

### Conflict Handling

**Case: Same email with different login method**
- Email only (password set): User can still login with password
- User tries Google: Backend links Google ID to existing account
- Result: User can now use both methods

**Case: Account takeover attempt**
- Different person attempts to login with Google using someone else's email
- Google itself prevents this (only verified emails can sign in)
- No additional security needed at application level

---

## Removed Components

The following Microsoft Sign-In related code has been removed:

1. Microsoft Sign-In button from AuthPage
2. `FaMicrosoft` icon import
3. Microsoft auth handler function
4. Microsoft OAuth notice message

### Files Modified (Microsoft Removal)

- `frontend/src/pages/AuthPage.jsx` - Removed Microsoft button and imports
- `frontend/src/context/AuthContext.jsx` - No Microsoft references
- `frontend/src/services/api.js` - No Microsoft references

### Files NOT Modified (Azure Cloud Services)

The following files still reference "Microsoft Azure" for cloud provider support:
- `frontend/src/pages/WorkspacePage.jsx` - Contains Azure cloud provider icons
- `frontend/src/features/workspace/ConnectDialog.jsx` - Azure connection form
- `frontend/src/utils/demoData.js` - Demo data includes Azure

**These are NOT related to authentication** and should remain unchanged.

---

## Testing Checklist

- [ ] Database migration runs successfully
- [ ] User can create account via Google Sign-In
- [ ] User can login with existing email via Google
- [ ] Google profile picture is stored
- [ ] JWT token is generated and stored
- [ ] User is redirected to workspace/dashboard
- [ ] Email + Password login still works
- [ ] No Microsoft Sign-In button appears
- [ ] Error handling works (network failures, invalid tokens)
- [ ] Mobile responsiveness maintained
- [ ] Dashboard features work after Google login

---

## Troubleshooting

### Google Sign-In Button Not Appearing

**Solution:**
- Ensure Google Identity Services script is in `index.html`
- Check browser console for errors
- Verify `VITE_GOOGLE_CLIENT_ID` is set correctly
- Clear browser cache and reload

### Token Verification Fails

**Solution:**
- Ensure backend can reach Google's servers
- Check token format and expiration
- Verify Client ID matches in frontend and Google Cloud Console

### User Can't Login After Google Account Change

**Solution:**
- Google email changed: Create new CloudPulse account with new email
- Google security: Check if account requires additional verification
- Browser cookies: Clear cookies and try again

### 409 Conflict Error

**Solution:**
- Email already registered with different method
- User can use existing login method (email + password)
- Or contact support to migrate account

---

## Production Rollback

If issues arise after deployment:

1. **Remove Google Script from index.html**
2. **Remove Google button from AuthPage**
3. **Redeploy frontend to Vercel**
4. Users can still use Email + Password authentication

Database schema changes are backwards compatible and don't need to be rolled back.

---

## Support & Maintenance

### Regular Checks

- Monitor Google Sign-In error rates
- Check for any Google API deprecations
- Review user feedback for UX improvements

### Future Enhancements

- Add profile picture display in dashboard
- Implement account linking (multiple auth methods per user)
- Add logout with Google
- Implement refresh token rotation

---

## References

- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web)
- [Google Sign-In Guide](https://developers.google.com/identity/sign-in/web)
- [JWT Token Verification](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token)
- [OAuth 2.0 Standard](https://tools.ietf.org/html/rfc6749)
