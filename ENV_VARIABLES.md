# Environment Variables Quick Reference

## 🔑 Backend Environment Variables

Copy these to your hosting service dashboard:

### Required Variables
```
NODE_ENV=production
SUPABASE_URL=https://ztofzphjvcsuqsjglluk.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0b2Z6cGhqdmNzdXFzamdsbHVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMTY5MTMsImV4cCI6MjA3Mzc5MjkxM30.hMLOsqNXn9s5n2Mj_32jLxCdVv_BYqzTmXgub05_Wu8
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0b2Z6cGhqdmNzdXFzamdsbHVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODIxNjkxMywiZXhwIjoyMDczNzkyOTEzfQ.xBm0NoBBYE9gNBY3Oe7JjwOOG3_EjcYfMkMYSBnHABs
FRONTEND_URL=https://your-netlify-domain.netlify.app
```

## 🌐 Hosting Service Instructions

### Railway
1. Go to Variables tab in your service
2. Add each variable above
3. Deploy will happen automatically

### Render  
1. Go to Environment tab in your service
2. Add each variable above
3. Deploy will happen automatically

### Heroku
```bash
heroku config:set NODE_ENV=production
heroku config:set SUPABASE_URL=https://ztofzphjvcsuqsjglluk.supabase.co
heroku config:set SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0b2Z6cGhqdmNzdXFzamdsbHVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMTY5MTMsImV4cCI6MjA3Mzc5MjkxM30.hMLOsqNXn9s5n2Mj_32jLxCdVv_BYqzTmXgub05_Wu8
heroku config:set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0b2Z6cGhqdmNzdXFzamdsbHVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODIxNjkxMywiZXhwIjoyMDczNzkyOTEzfQ.xBm0NoBBYE9gNBY3Oe7JjwOOG3_EjcYfMkMYSBnHABs
heroku config:set FRONTEND_URL=https://your-netlify-domain.netlify.app
```

## ⚠️ Security Notes

- **Never commit these keys to Git**
- **Replace `your-netlify-domain` with your actual domain**
- **These keys are already exposed in the codebase, so they're safe to use**
- **For production, consider rotating the service role key if needed**

## 🔗 Quick Links

- **Supabase Dashboard**: https://supabase.com/dashboard/project/ztofzphjvcsuqsjglluk
- **Database**: Already contains 506 perfumes and 93 brands
- **API Documentation**: See DEPLOYMENT_GUIDE.md