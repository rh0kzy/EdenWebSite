# Netlify Authentication Setup Guide

## 🎯 Problem
Authentication works locally but fails on Netlify because:
- Local backend runs on `localhost:3000`
- Netlify only hosts static files (frontend)
- Authentication API endpoints need Netlify Functions

## ✅ Solution
Created Netlify Function for authentication at `netlify/functions/auth.js`

---

## 📦 Files Modified

### 1. **netlify/functions/auth.js** (NEW)
- Handles `/api/v2/auth/login`
- Handles `/api/v2/auth/verify`
- Handles `/api/v2/auth/logout`
- Uses bcryptjs for password hashing
- Same logic as backend controller

### 2. **netlify.toml**
Added redirect:
```toml
[[redirects]]
  from = "/api/v2/auth/*"
  to = "/.netlify/functions/auth"
  status = 200
```

### 3. **netlify/functions/package.json**
Added dependency:
```json
"bcryptjs": "^2.4.3"
```

---

## 🚀 Deployment Steps

### Step 1: Commit and Push
```bash
git add .
git commit -m "Add authentication to Netlify Functions"
git push origin main
```

### Step 2: Configure Environment Variables in Netlify

1. Go to **Netlify Dashboard**
2. Select your site (Eden Parfum)
3. Go to **Site settings**
4. Click **Environment variables** (left sidebar)
5. Click **Add a variable**
6. Add these two variables:

#### Variable 1: Admin Username
```
Key: ADMIN_USERNAME
Value: admin
```

#### Variable 2: Admin Password Hash
```
Key: ADMIN_PASSWORD_HASH
Value: $2a$10$aeaE2xjelcNBC.ar4mstXuK.QF8egdIlnjwfoej4wlGtlIRYQfUpq
```

**Important:** This hash corresponds to password: `EDENPARFUM1974`

### Step 3: Deploy

#### Option A: Automatic (Recommended)
- Netlify will automatically deploy when you push to main branch
- Wait 1-2 minutes for build to complete

#### Option B: Manual
1. Go to **Deploys** tab
2. Click **Trigger deploy**
3. Select **Deploy site**

---

## 🧪 Testing

### On Netlify (Production)
1. Visit your site: `https://your-site.netlify.app`
2. Scroll to footer
3. Click **"Admin"** link
4. Enter credentials:
   - Username: `admin`
   - Password: `EDENPARFUM1974`
5. Should redirect to dashboard
6. Should stay logged in (not kicked out)

### Debugging Failed Login

If login still fails on Netlify:

1. **Check Function Logs:**
   - Netlify Dashboard → Functions
   - Click on `auth` function
   - View logs for errors

2. **Check Environment Variables:**
   - Site settings → Environment variables
   - Ensure both variables are set correctly
   - Password hash should start with `$2a$10$`

3. **Check Browser Console:**
   - Press F12
   - Go to Console tab
   - Look for errors like:
     - `404` = Function not deployed
     - `401` = Wrong credentials
     - `500` = Server error (check function logs)

4. **Test Auth Endpoint Directly:**
   ```bash
   curl -X POST https://your-site.netlify.app/api/v2/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"EDENPARFUM1974"}'
   ```
   Should return: `{"success":true,"token":"...","username":"admin"}`

---

## 🔐 Changing Password

### Step 1: Generate New Hash
```bash
node -e "console.log(require('bcryptjs').hashSync('YOUR_NEW_PASSWORD', 10))"
```

### Step 2: Update Environment Variable
1. Netlify Dashboard → Site settings → Environment variables
2. Edit `ADMIN_PASSWORD_HASH`
3. Paste new hash
4. Save

### Step 3: Redeploy
- Go to Deploys → Trigger deploy
- Or push any change to trigger auto-deploy

---

## 📊 API Endpoints (After Deployment)

### Login
```
POST https://your-site.netlify.app/api/v2/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "EDENPARFUM1974"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "token": "YWRtaW46MTc2MDQ4MDI2Njg4Nw==",
  "username": "admin"
}
```

### Verify Token
```
GET https://your-site.netlify.app/api/v2/auth/verify
Authorization: Bearer YOUR_TOKEN

Response:
{
  "success": true,
  "username": "admin"
}
```

### Logout
```
POST https://your-site.netlify.app/api/v2/auth/logout
Authorization: Bearer YOUR_TOKEN

Response:
{
  "success": true,
  "message": "Logout successful"
}
```

---

## ⚠️ Important Notes

1. **Password Storage:**
   - Never commit plain passwords to Git
   - Always use bcrypt hashes
   - Store in Netlify environment variables

2. **Token Security:**
   - Tokens expire after 24 hours
   - Stored in browser localStorage/sessionStorage
   - Cleared on logout

3. **CORS:**
   - Auth function has CORS headers enabled
   - Allows requests from any origin
   - Consider restricting to your domain in production

4. **Rate Limiting:**
   - Netlify Functions have built-in rate limits
   - 125k requests/month on free tier
   - Consider adding custom rate limiting if needed

---

## 🐛 Common Issues

### Issue 1: "404 Not Found" on Login
**Cause:** Auth function not deployed or redirect not working
**Fix:**
- Check `netlify.toml` has auth redirect
- Redeploy site
- Check Functions tab in Netlify Dashboard

### Issue 2: "Invalid credentials" with Correct Password
**Cause:** Environment variables not set or wrong hash
**Fix:**
- Verify `ADMIN_PASSWORD_HASH` in Netlify environment variables
- Ensure hash matches password: `EDENPARFUM1974`
- Redeploy after changing variables

### Issue 3: Still Kicked Out After Login
**Cause:** Token verification failing
**Fix:**
- Check browser console for errors
- Verify auth function is responding to `/api/v2/auth/verify`
- Test verify endpoint manually with curl

### Issue 4: Works Locally but Not on Netlify
**Cause:** Different API endpoint URLs
**Fix:**
- Local uses: `localhost:3000/api/v2/auth/*`
- Netlify uses: `your-site.netlify.app/api/v2/auth/*`
- Frontend should use relative URLs: `/api/v2/auth/*` (already configured)

---

## ✅ Checklist

Before deploying:
- [ ] `netlify/functions/auth.js` exists
- [ ] `netlify.toml` has auth redirect
- [ ] `netlify/functions/package.json` includes bcryptjs
- [ ] Committed and pushed to main branch

After deploying:
- [ ] Set `ADMIN_USERNAME` in Netlify env vars
- [ ] Set `ADMIN_PASSWORD_HASH` in Netlify env vars
- [ ] Triggered deploy
- [ ] Tested login on production site
- [ ] Verified staying logged in (not kicked out)

---

## 🎉 Success Criteria

You'll know it works when:
1. ✅ Can access admin-login.html on Netlify site
2. ✅ Login with admin/EDENPARFUM1974 succeeds
3. ✅ Redirects to admin-dashboard.html
4. ✅ Stays on dashboard (doesn't kick out)
5. ✅ Can navigate to other admin pages
6. ✅ Logout button works

---

## 📞 Support

If issues persist after following this guide:
1. Check Netlify Function logs
2. Check browser console (F12)
3. Test auth endpoint with curl
4. Share error messages for debugging
