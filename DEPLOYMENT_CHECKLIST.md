# Deployment Checklist - Google OAuth Implementation

## Quick Start for Deployment

This checklist guides you through deploying Google OAuth to production.

---

## Phase 1: Pre-Deployment Verification ✅

### Code Review
- [x] All changes reviewed and tested locally
- [x] Database migration created: `004_google_oauth.sql`
- [x] Backend endpoint added: `/api/auth/google-login`
- [x] Frontend components updated
- [x] Microsoft references removed from auth flow
- [x] No breaking changes to existing features

### Local Testing
```bash
# Test locally before deploying
cd backend
npm run db:migrate    # Run migration
npm run db:verify     # Verify schema

cd ../frontend
npm run dev           # Start dev server
# Test Google Sign-In at http://localhost:5173
```

---

## Phase 2: Database Migration (Production)

### Option A: Render PostgreSQL (Recommended)

1. **Connect to Render Database**:
   ```bash
   # Get connection string from Render dashboard
   psql "your_connection_string"
   ```

2. **Run Migration**:
   ```bash
   # Option 1: Run from backend
   cd backend
   npm run db:migrate
   
   # Option 2: Manual SQL execution
   psql "your_connection_string" -f database/migrations/004_google_oauth.sql
   ```

3. **Verify**:
   ```bash
   npm run db:verify
   
   # Or manually check
   psql "your_connection_string" -c "\d users"
   ```

   Should show columns:
   - `google_id`
   - `login_provider`
   - `profile_picture`

### Option B: Manual Database Update

If migration script fails, run directly:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_provider VARCHAR(50) DEFAULT 'email';
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(500);

CREATE INDEX IF NOT EXISTS idx_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_login_provider ON users(login_provider);
```

---

## Phase 3: Backend Deployment (Render)

### Deploy Steps

1. **Push to GitHub**:
   ```bash
   git add -A
   git commit -m "feat: Implement Google OAuth authentication

   - Add Google OAuth endpoint: /auth/google-login
   - Add database migration for google_id and login_provider
   - Support user registration and login via Google
   - Remove Microsoft Sign-In references
   - Maintain Email + Password authentication"
   
   git push origin main
   ```

2. **Render Auto-Deploys**:
   - If webhook configured, deployment starts automatically
   - Monitor at: https://dashboard.render.com
   - Status: Should see "Deploy Succeeded"

3. **Verify Backend**:
   ```bash
   # Test the new endpoint
   curl -X POST https://cloudpulse-ai.onrender.com/api/auth/google-login \
     -H "Content-Type: application/json" \
     -d '{"token":"test","name":"Test","email":"test@test.com"}'
   
   # Should return: 400 or 401 (since token is invalid, but endpoint exists)
   ```

---

## Phase 4: Frontend Deployment (Vercel)

### Set Environment Variables

1. **Go to Vercel Dashboard**:
   - https://vercel.com/dashboard

2. **Select Project**: `CloudPulse-AI`

3. **Settings → Environment Variables**

4. **Add Variable**:
   - Name: `VITE_GOOGLE_CLIENT_ID`
   - Value: `640498533559-uo4m73jnk6k0qdaij2rpuokckpvd45qc.apps.googleusercontent.com`
   - Environments: Select all (Production, Preview, Development)
   - Click: **Save**

5. **Optional - Add API URL** (if not already set):
   - Name: `VITE_API_URL`
   - Value: `https://cloudpulse-ai.onrender.com`
   - Environments: Production only
   - Click: **Save**

### Deploy Frontend

1. **Push to GitHub**:
   ```bash
   git add -A
   git commit -m "feat: Implement Google Sign-In UI

   - Add Google Identity Services script to index.html
   - Implement Google Sign-In button
   - Add handleGoogleResponse callback
   - Update AuthContext with googleLogin method
   - Remove Microsoft Sign-In UI"
   
   git push origin main
   ```

2. **Vercel Auto-Deploys**:
   - Deployment starts automatically
   - Monitor at: https://vercel.com/cloudpulse-ai
   - Status: Should show "✓ Ready"

3. **Wait for Build to Complete**:
   - Build process: 1-2 minutes
   - Deployment: Automatic to production

---

## Phase 5: Post-Deployment Testing

### Test Google Sign-In (Production)

1. **Visit Production URL**:
   - https://cloudpulse-ai.vercel.app (or your domain)

2. **Test New User Registration**:
   - Click "Continue with Google"
   - Select a Google account (or create test account)
   - Verify: User is created in database
   - Verify: Redirected to workspace/dashboard
   - Check browser console: No errors

3. **Test Existing User Login**:
   - Use same Google email you used for registration
   - Click "Continue with Google"
   - Verify: User is logged in
   - Verify: Redirected to workspace/dashboard

4. **Test Email + Password Still Works**:
   - Try logging in with email + password
   - Verify: Still works normally
   - Verify: No breaking changes

5. **Test Error Handling**:
   - Disconnect internet, try Google Sign-In
   - Network error should be displayed
   - No unhandled exceptions

6. **Check Database**:
   ```bash
   # Connect to production database
   psql "your_production_connection_string"
   
   # Check Google users were created
   SELECT id, full_name, email, google_id, login_provider FROM users 
   WHERE google_id IS NOT NULL;
   ```

### Browser Console Checks

Open browser DevTools (F12) and verify:

```javascript
// Should output the Client ID
console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID)

// Should be truthy
console.log(window.google?.accounts?.id)

// Check JWT is stored
console.log(localStorage.getItem('cloudpulse_token'))
```

### Network Tab Checks

1. Google script loads: `accounts.google.com/gsi/client`
2. API call succeeds: `POST /api/auth/google-login`
3. Response contains JWT token

---

## Phase 6: Monitoring & Verification

### Metrics to Monitor

1. **Authentication Success Rate**:
   - Google login attempts
   - Email + Password login attempts
   - Conversion rates

2. **Error Tracking**:
   - Failed Google authentications
   - Network errors
   - Database errors

3. **User Growth**:
   - New users via Google
   - New users via Email + Password
   - Google adoption rate

### Set Up Alerts (Optional)

In Render/Vercel dashboards, configure alerts for:
- [ ] Deploy failures
- [ ] High error rates
- [ ] Database connection issues

### Database Backup

Before deployment, consider:
```bash
# Backup production database
pg_dump "connection_string" > backup_before_google_oauth.sql
```

---

## Phase 7: Rollback Plan (If Needed)

### Quick Rollback (< 5 minutes)

**If critical issues:**

1. **Frontend Rollback** (instant):
   ```bash
   # Revert frontend changes
   git revert <commit_hash>
   git push origin main
   # Vercel auto-redeploys (1-2 min)
   ```

2. **Backend Rollback** (instant):
   ```bash
   # Revert backend changes
   git revert <commit_hash>
   git push origin main
   # Render auto-redeploys (2-3 min)
   ```

3. **Users Can Still**:
   - Login with Email + Password
   - Access their existing data
   - Use all existing features

### Database Rollback (If Needed)

```bash
# Restore from backup
psql "connection_string" < backup_before_google_oauth.sql

# Or manually drop the new columns (data is preserved)
ALTER TABLE users DROP COLUMN google_id;
ALTER TABLE users DROP COLUMN login_provider;
ALTER TABLE users DROP COLUMN profile_picture;
DROP INDEX IF EXISTS idx_google_id;
DROP INDEX IF EXISTS idx_login_provider;
```

---

## Phase 8: Post-Deployment Communication

### Update Documentation

- [x] IMPLEMENTATION_SUMMARY.md - Created
- [x] GOOGLE_OAUTH_SETUP.md - Created  
- [x] ENVIRONMENT_SETUP.md - Created
- [x] DEPLOYMENT_CHECKLIST.md - This file

### Notify Team/Users

Send announcement:
```
Subject: CloudPulse AI Now Supports Google Sign-In

Hi Team,

We've successfully deployed Google Sign-In to CloudPulse AI!

✨ New Features:
- Sign in with your Google account
- Automatic account creation on first login
- Profile picture from Google (coming soon to dashboard)

📚 Existing Features (Unchanged):
- Email + Password login still works
- All dashboard features
- Reports, Analytics, AI Copilot
- Cloud Simulator
- Demo Mode

🔐 Security:
- Passwords encrypted
- JWT tokens secure
- No data compromised

📖 Documentation:
- See GOOGLE_OAUTH_SETUP.md for technical details
- See ENVIRONMENT_SETUP.md for configuration

Questions? Check the documentation or contact support.
```

---

## Completion Checklist

### Before Deployment
- [ ] Code reviewed and tested locally
- [ ] Commit messages clear and descriptive
- [ ] No console warnings/errors
- [ ] Database migration tested locally

### During Deployment
- [ ] Database migration executed successfully
- [ ] Backend deployed successfully  
- [ ] Backend endpoint verified working
- [ ] Frontend environment variables set in Vercel
- [ ] Frontend deployed successfully

### After Deployment
- [ ] Google Sign-In button appears on auth page
- [ ] New user registration via Google works
- [ ] Existing user login via Google works
- [ ] Email + Password login still works
- [ ] No console errors
- [ ] JWT token stored correctly
- [ ] Redirect to dashboard works
- [ ] Database queries show new users
- [ ] Error handling works
- [ ] Mobile view responsive

### Documentation
- [ ] IMPLEMENTATION_SUMMARY.md reviewed
- [ ] GOOGLE_OAUTH_SETUP.md available to team
- [ ] ENVIRONMENT_SETUP.md available to team
- [ ] Team notified of changes
- [ ] Known issues documented
- [ ] Rollback plan documented

---

## Support & Troubleshooting

### If Google Button Doesn't Appear

```bash
# Check 1: Verify environment variable
console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID)

# Check 2: Verify script loaded
console.log(window.google?.accounts?.id)

# Fix: Restart Vercel deployment
# In Vercel: Deployments → Latest → Redeploy
```

### If Login Fails

```bash
# Check 1: Backend endpoint exists
curl https://cloudpulse-ai.onrender.com/api/auth/google-login

# Check 2: Network tab shows API call
# DevTools → Network → Filter: google-login

# Check 3: Backend logs (Render)
# Dashboard → Logs → View logs
```

### If Database Migration Fails

```bash
# Check 1: Database connection
npm run db:test

# Check 2: Run manually
psql "connection_string" -f database/migrations/004_google_oauth.sql

# Check 3: Verify schema
npm run db:verify
```

---

## Timeline Estimate

| Phase | Duration |
|---|---|
| Phase 1: Verification | ✓ Done |
| Phase 2: Database Migration | 1-5 min |
| Phase 3: Backend Deploy | 2-3 min |
| Phase 4: Frontend Deploy | 1-2 min |
| Phase 5: Testing | 5-10 min |
| Phase 6: Monitoring Setup | 5 min |
| **Total** | **~15-30 min** |

---

## Final Verification Command

Run this after full deployment:

```bash
# Backend test
curl -X POST https://cloudpulse-ai.onrender.com/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Should return user info (success)
# Or 401 (token invalid, but endpoint exists)

# Frontend test
curl https://cloudpulse-ai.vercel.app | grep "accounts.google.com"
# Should find the Google script tag
```

---

## Success Criteria ✅

Deployment is successful when:

1. ✅ Database migration runs without errors
2. ✅ Backend `/auth/google-login` endpoint responds
3. ✅ Google Sign-In button visible on frontend
4. ✅ User can create account via Google
5. ✅ User can login via Google
6. ✅ Email + Password login still works
7. ✅ JWT token generated and stored
8. ✅ User redirected to workspace/dashboard
9. ✅ No console errors in browser
10. ✅ Mobile view responsive

---

**Status**: Ready for Deployment ✅
**Last Updated**: 2024
**Reviewed**: Yes
