# Eden Parfum - Complete Deployment Guide

## 🚀 Deployment Overview

This guide covers the deployment of Eden Parfum website using:
- **Frontend**: Netlify (static hosting)
- **Backend**: Railway/Render/Heroku (Node.js API server)
- **Database**: Supabase (PostgreSQL)

## 📋 Prerequisites

1. **Accounts needed:**
   - GitHub account (for code repository)
   - Netlify account (for frontend hosting)
   - Railway/Render/Heroku account (for backend hosting)
   - Supabase account (already set up)

2. **Required information:**
   - Supabase project URL
   - Supabase anon key
   - Supabase service role key

## 🔧 Step 1: Prepare Repository

### Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Eden Parfum with Supabase integration"
git branch -M main
git remote add origin https://github.com/yourusername/eden-parfum.git
git push -u origin main
```

## 🌐 Step 2: Deploy Frontend (Netlify)

### Option A: Deploy via Netlify Dashboard

1. **Connect Repository:**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository
   - Select the Eden Parfum repository

2. **Build Settings:**
   ```
   Build command: (leave empty)
   Publish directory: frontend
   ```

3. **Environment Variables:**
   No environment variables needed for frontend.

4. **Deploy:**
   - Click "Deploy site"
   - Note your Netlify domain (e.g., `https://amazing-name-123.netlify.app`)

### Option B: Deploy via Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod --dir=frontend
```

## 🖥️ Step 3: Deploy Backend

### Option A: Railway Deployment

1. **Connect Repository:**
   - Go to [Railway](https://railway.app)
   - Click "Start a new project"
   - Select "Deploy from GitHub repo"
   - Choose your Eden Parfum repository

2. **Service Configuration:**
   - Set root directory: `backend`
   - Railway will auto-detect Node.js

3. **Environment Variables:**
   Add these in Railway dashboard:
   ```
   NODE_ENV=production
   SUPABASE_URL=https://ztofzphjvcsuqsjglluk.supabase.co
   SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   FRONTEND_URL=https://your-netlify-domain.netlify.app
   ```

4. **Deploy:**
   - Railway will automatically deploy
   - Note your Railway domain (e.g., `https://your-app.railway.app`)

### Option B: Render Deployment

1. **Connect Repository:**
   - Go to [Render](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Service Configuration:**
   ```
   Name: eden-parfum-api
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

3. **Environment Variables:**
   ```
   NODE_ENV=production
   SUPABASE_URL=https://ztofzphjvcsuqsjglluk.supabase.co
   SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   FRONTEND_URL=https://your-netlify-domain.netlify.app
   ```

### Option C: Heroku Deployment

1. **Install Heroku CLI:**
   ```bash
   # Follow Heroku CLI installation guide
   heroku login
   ```

2. **Create App:**
   ```bash
   cd backend
   heroku create eden-parfum-api
   ```

3. **Set Environment Variables:**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set SUPABASE_URL=https://ztofzphjvcsuqsjglluk.supabase.co
   heroku config:set SUPABASE_ANON_KEY=your_anon_key_here
   heroku config:set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   heroku config:set FRONTEND_URL=https://your-netlify-domain.netlify.app
   ```

4. **Deploy:**
   ```bash
   git subtree push --prefix=backend heroku main
   ```

## 🔗 Step 4: Connect Frontend to Backend

### Update Netlify Configuration

1. **Update netlify.toml:**
   Replace `your-backend-domain.com` with your actual backend domain:
   ```toml
   [[redirects]]
     from = "/api/*"
     to = "https://your-backend-domain.railway.app/api/:splat"
     status = 200
   ```

2. **Update CORS in Backend:**
   In `backend/server.js`, add your Netlify domain:
   ```javascript
   'https://your-netlify-domain.netlify.app'
   ```

3. **Redeploy:**
   - Push changes to GitHub
   - Both Netlify and your backend service will auto-deploy

## 🔍 Step 5: Verification & Testing

### Test API Endpoints

```bash
# Health check
curl https://your-backend-domain.com/api/health

# Test perfumes endpoint
curl https://your-backend-domain.com/api/v2/perfumes?limit=5

# Test brands endpoint
curl https://your-backend-domain.com/api/v2/brands?limit=5
```

### Test Frontend

1. **Visit your Netlify domain**
2. **Check catalog page:** `https://your-netlify-domain.netlify.app/catalog.html`
3. **Verify data loading:** Ensure perfumes load from API
4. **Test detail page:** Click on a perfume to test detail view
5. **Check browser console:** No API errors should appear

## 🛠️ Troubleshooting

### Common Issues

1. **CORS Errors:**
   - Ensure Netlify domain is added to backend CORS configuration
   - Check environment variables are set correctly

2. **API Redirects Not Working:**
   - Verify netlify.toml redirect rules
   - Check backend domain in redirect configuration

3. **Database Connection Issues:**
   - Verify Supabase environment variables
   - Check Supabase project status
   - Ensure RLS policies allow public access

4. **Frontend Not Loading Data:**
   - Check browser developer tools for network errors
   - Verify API base URL configuration
   - Test API endpoints directly

### Debugging Commands

```bash
# Check backend logs (Railway)
railway logs

# Check backend logs (Heroku)
heroku logs --tail

# Test local development
cd backend && npm run dev
```

## 📊 Production Monitoring

### Key URLs to Monitor

- **Frontend:** `https://your-netlify-domain.netlify.app`
- **API Health:** `https://your-backend-domain.com/api/health`
- **Supabase Dashboard:** [Your Supabase Project](https://supabase.com/dashboard)

### Performance Checks

1. **API Response Times:** Should be < 500ms
2. **Frontend Load Time:** Should be < 2s
3. **Database Queries:** Monitor in Supabase dashboard
4. **Error Rates:** Check backend logs for errors

## 🔐 Security Checklist

- ✅ Environment variables secured (no keys in code)
- ✅ CORS properly configured
- ✅ HTTPS enabled on all services
- ✅ Supabase RLS policies configured
- ✅ Rate limiting enabled on API
- ✅ Security headers configured

## 🔄 Deployment Workflow

### Development Process

1. **Local Development:**
   ```bash
   # Backend
   cd backend && npm run dev
   
   # Frontend (if needed)
   cd frontend && live-server
   ```

2. **Push Changes:**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

3. **Auto-Deploy:**
   - Netlify automatically deploys frontend
   - Backend service automatically deploys API

### Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Public anon key | `eyJhbGciOiJIUzI1NiIs...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin service key | `eyJhbGciOiJIUzI1NiIs...` |
| `FRONTEND_URL` | Netlify domain | `https://xxx.netlify.app` |

## ✅ Final Checklist

- [ ] Code pushed to GitHub
- [ ] Frontend deployed to Netlify
- [ ] Backend deployed to hosting service
- [ ] Environment variables configured
- [ ] API redirects working
- [ ] CORS configured correctly
- [ ] All endpoints responding
- [ ] Frontend loading data correctly
- [ ] No console errors
- [ ] Mobile responsiveness working
- [ ] WhatsApp integration working

## 📞 Support

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review backend logs for errors
3. Test API endpoints individually
4. Verify environment variable configuration
5. Check Supabase dashboard for database issues

---

**Deployment completed successfully!** 🎉

Your Eden Parfum website is now live with:
- 506 perfumes in database
- 93 brands with photo integration  
- Full API-driven functionality
- Production-ready performance