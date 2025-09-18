# Eden Parfum - Clean Production Structure

## 🎯 Project Overview
A modern perfume catalog website with Supabase PostgreSQL database, featuring 506 perfumes and 93 brands with integrated photo management.

## 📁 Directory Structure

```
EdenWebSite/
├── frontend/                    # Client-side application
│   ├── index.html              # Main landing page
│   ├── catalog.html            # Perfume catalog page  
│   ├── perfume-detail.html     # Individual perfume details
│   ├── perfume-detail.js       # Detail page functionality
│   ├── script.js               # Main frontend JavaScript
│   ├── styles.css              # All CSS styles
│   ├── package.json            # Frontend dependencies (@supabase/supabase-js)
│   ├── js/
│   │   └── supabaseClient.js   # Supabase client configuration
│   ├── photos/                 # Static image assets
│   │   ├── [96 brand logos]    # Brand logos (.png, .jpg, .svg, .webp)
│   │   └── [499 perfume images] # Perfume bottle images
│   └── _redirects              # Netlify redirect configuration
│
├── backend/                     # API server
│   ├── server.js               # Main Express.js server
│   ├── package.json            # Backend dependencies
│   ├── .env                    # Environment variables (Supabase keys)
│   ├── .gitignore              # Git ignore rules
│   ├── config/
│   │   └── supabase.js         # Supabase client configuration
│   ├── controllers/            # Business logic
│   │   ├── supabasePerfumeController.js  # Perfume CRUD operations
│   │   ├── supabaseBrandController.js    # Brand CRUD operations
│   │   └── photoController.js            # Photo management
│   ├── routes/                 # API endpoint definitions
│   │   ├── supabasePerfumes.js # /api/v2/perfumes routes
│   │   ├── supabaseBrands.js   # /api/v2/brands routes
│   │   └── photos.js           # /api/v2/photos routes
│   └── middleware/
│       └── validation.js       # Request validation middleware
│
├── DEPLOYMENT.md               # Deployment guide
├── ADMIN_GUIDE.md             # Admin documentation
├── README.md                  # Project documentation
├── package.json               # Root package.json
├── netlify.toml               # Netlify deployment config
└── netlify-simple.toml        # Simple Netlify config
```

## 🗄️ Database Structure

### Supabase PostgreSQL Tables

**brands**
- id (uuid, primary key)
- name (text, unique)
- slug (text, unique) 
- photo_url (text)
- created_at (timestamptz)

**perfumes**
- id (uuid, primary key)
- name (text)
- brand_id (uuid, foreign key → brands.id)
- gender (text: Homme/Femme/Mixte)
- category (text)
- concentration (text)
- size (text)
- price (numeric)
- photo_url (text)
- created_at (timestamptz)

## 🚀 API Endpoints

### Brand Endpoints
- `GET /api/v2/brands` - List all brands (with pagination)
- `GET /api/v2/brands/:id` - Get specific brand
- `GET /api/v2/brands/search?name=query` - Search brands

### Perfume Endpoints  
- `GET /api/v2/perfumes` - List all perfumes (with pagination)
- `GET /api/v2/perfumes/:id` - Get specific perfume
- `GET /api/v2/perfumes/search?q=query` - Search perfumes
- `GET /api/v2/perfumes/filter?brand=X&gender=Y` - Filter perfumes

### Photo Endpoints
- `GET /api/v2/photos/brands` - List available brand photos
- `GET /api/v2/photos/perfumes` - List available perfume photos
- `GET /api/v2/photos/stats` - Photo coverage statistics

### System Endpoints
- `GET /api/health` - Health check

## 📊 Data Summary
- **506 perfumes** across 93 brands
- **96 brand logos** (60 mapped to database)
- **499 perfume images** (46 mapped to database)  
- Full-text search capability
- Pagination support (50 items/page)
- French localization (Mixte = Unisex)

## 🔧 Dependencies

### Backend
- **express**: Web framework
- **@supabase/supabase-js**: Database client
- **cors**: Cross-origin resource sharing
- **helmet**: Security headers
- **morgan**: HTTP logging
- **express-rate-limit**: Rate limiting
- **dotenv**: Environment variables

### Frontend  
- **@supabase/supabase-js**: Direct database access
- **live-server**: Development server (dev only)

## 🌟 Features Implemented
- ✅ Modern REST API with Supabase
- ✅ Automatic photo URL generation  
- ✅ Search and filtering
- ✅ Pagination
- ✅ Rate limiting & security
- ✅ Error handling
- ✅ CORS configuration
- ✅ Static file serving
- ✅ French localization

## 🚀 Next Steps
1. Update frontend to use `/api/v2/` endpoints
2. Test all functionality end-to-end
3. Deploy to production (Netlify + Railway/Heroku)
4. Add monitoring and analytics
5. Implement admin panel for content management

## 📝 Environment Variables Required
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
FRONTEND_URL=your_frontend_domain
NODE_ENV=production
```

---
**Generated**: Database migration completed successfully  
**Status**: Ready for production deployment