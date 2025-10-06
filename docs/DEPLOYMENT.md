# Deployment Guide

This guide covers deploying the Eden Parfum application to production environments.

## 🚀 Deployment Overview

The application consists of three main components:

1. **Frontend** - Static website deployed to Netlify
2. **Backend** - Node.js API deployed to Railway or Render
3. **Database** - PostgreSQL managed by Supabase

## 📋 Prerequisites

- GitHub repository with the project
- Netlify account
- Railway or Render account
- Supabase project

## 🌐 Frontend Deployment (Netlify)

### Method 1: GitHub Integration (Recommended)

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository

2. **Configure Build Settings**
   ```
   Branch to deploy: main
   Build command: echo 'Static site - no build needed'
   Publish directory: frontend
   ```

3. **Environment Variables**
   Add these in Netlify dashboard (Site settings → Environment variables):
   ```
   # Not required for frontend, but can add if needed
   NODE_VERSION=18
   ```

4. **Custom Domain** (Optional)
   - Go to Site settings → Domain management
   - Add your custom domain
   - Configure DNS records as instructed

### Method 2: Manual Deploy

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy from frontend directory
cd frontend
netlify deploy --prod --dir=.
```

## 🔧 Backend Deployment

### Option A: Railway (Recommended)

1. **Connect Repository**
   - Go to [railway.app](https://railway.app)
   - Click "Deploy from GitHub"
   - Connect your repository

2. **Configure Service**
   - Railway auto-detects Node.js
   - Set root directory to `backend`
   - Build command: `npm install`
   - Start command: `npm start`

3. **Environment Variables**
   Add these in Railway dashboard:
   ```
   PORT=3000
   NODE_ENV=production
   FRONTEND_URL=https://your-netlify-site.netlify.app

   # Supabase credentials
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   DATABASE_URL=your_database_url
   ```

4. **Custom Domain** (Optional)
   - Go to Settings → Domains
   - Add your API domain (e.g., `api.yourdomain.com`)

### Option B: Render

1. **Connect Repository**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   ```
   Name: eden-parfum-backend
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   Root Directory: backend
   ```

3. **Environment Variables**
   Same as Railway configuration above.

## 🗄️ Database Setup (Supabase)

### Initial Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Choose your region

2. **Database Configuration**
   - Go to SQL Editor in Supabase dashboard
   - Run the schema file:
   ```sql
   -- Copy contents of database/schema.sql and run
   ```

3. **Run Migrations**
   ```bash
   # Locally test migrations
   cd database
   node complete_migration.js
   ```

4. **Seed Data** (Optional)
   - Add initial perfume and brand data via Supabase dashboard
   - Or create seed scripts in `/database`

### Environment Variables

Get these from Supabase dashboard (Settings → API):

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:password@db.supabase.co:5432/postgres
```

## 🔗 Connecting Frontend to Backend

### Update Frontend Configuration

1. **Update API URLs**
   - Edit `frontend/js/apiClient.js`
   - Change localhost URLs to production URLs:
   ```javascript
   const API_BASE_URL = 'https://your-backend-url.onrender.com/api';
   ```

2. **Update Supabase Configuration**
   - Edit `frontend/js/supabaseClient.js`
   - Use production Supabase credentials

### CORS Configuration

Ensure your backend allows requests from your frontend domain:

```javascript
// In backend/server.js or cors configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',           // Development
    'https://your-netlify-site.netlify.app'  // Production
  ],
  credentials: true
};
```

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All tests pass locally
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] API endpoints working
- [ ] Frontend builds successfully

### Frontend Deployment
- [ ] Netlify site connected to GitHub
- [ ] Build settings configured
- [ ] Environment variables set
- [ ] Custom domain configured (optional)

### Backend Deployment
- [ ] Railway/Render service created
- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] API endpoints accessible

### Database
- [ ] Supabase project created
- [ ] Schema deployed
- [ ] Migrations run
- [ ] Data seeded (if needed)

### Post-Deployment
- [ ] Frontend loads correctly
- [ ] API calls work from frontend
- [ ] Database queries successful
- [ ] Error logging configured
- [ ] Monitoring set up

## 🔍 Testing Production Deployment

### Automated Tests
```bash
# Test API endpoints
curl https://your-backend-url.onrender.com/api/health

# Test database connection
curl https://your-backend-url.onrender.com/api/brands
```

### Manual Testing
1. Visit your Netlify frontend URL
2. Test all navigation links
3. Test catalog functionality
4. Test search and filtering
5. Check browser console for errors

## 📊 Monitoring & Maintenance

### Logs
- **Railway/Render**: View logs in dashboard
- **Netlify**: Check deploy logs and function logs
- **Supabase**: Monitor database performance

### Error Tracking
- Set up error monitoring (e.g., Sentry)
- Configure log aggregation
- Set up alerts for downtime

### Performance Monitoring
- Use Netlify Analytics
- Monitor API response times
- Track database query performance

## 🔄 Updates & Rollbacks

### Deploying Updates
1. Push changes to `main` branch
2. Netlify auto-deploys frontend
3. Railway/Render auto-deploys backend
4. Monitor deployment logs

### Rollback Strategy
- Use Git tags for releases
- Keep backup of database schema
- Test in staging environment first

## 🆘 Troubleshooting

### Common Issues

#### Frontend Not Loading
- Check Netlify deploy logs
- Verify publish directory is `frontend`
- Check for broken asset links

#### Backend API Errors
- Check Railway/Render logs
- Verify environment variables
- Test database connection

#### CORS Errors
- Update CORS origins in backend
- Check if frontend URL is correct

#### Database Connection Issues
- Verify Supabase credentials
- Check database URL format
- Test connection from backend logs

### Debug Commands

```bash
# Test backend locally with production env
cd backend
NODE_ENV=production npm start

# Test API endpoints
curl -H "Content-Type: application/json" \
     https://your-backend-url.onrender.com/api/health
```

## 📞 Support

For deployment issues:
1. Check deployment platform documentation
2. Review application logs
3. Test locally with production environment variables
4. Check GitHub issues for similar problems

---

**Deployment successful!** 🎉 Your Eden Parfum application is now live.</content>
<parameter name="filePath">c:\Users\PC\Desktop\EdenWebSite\docs\DEPLOYMENT.md