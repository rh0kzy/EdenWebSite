# Project Structure Documentation

This document outlines the organized structure of the Eden Parfum project.

## 📁 Root Level Structure

```
eden-parfum/
├── .env.example              # Environment variables template
├── .gitignore               # Git ignore rules
├── .netlifyignore           # Netlify deployment ignore rules
├── .nvmrc                   # Node.js version specification
├── package.json             # Root project configuration
├── README.md                # Project documentation
├── backend/                 # Express.js API server
├── config/                  # Deployment configurations
├── database/                # Database schemas & migrations
├── docs/                    # Documentation files
├── frontend/                # Static website files
├── scripts/                 # Build & utility scripts
└── tests/                   # Integration tests
```

## 🗂️ Directory Details

### `/backend` - API Server
```
backend/
├── config/                  # Server configuration
│   ├── environmentValidator.js
│   ├── errorNotificationSystem.js
│   ├── healthMonitor.js
│   ├── logger.js
│   └── supabase.js
├── controllers/             # Route business logic
│   ├── photoController.js
│   ├── supabaseBrandController.js
│   └── supabasePerfumeController.js
├── middleware/              # Express middleware
│   ├── cacheBusting.js
│   ├── errorHandler.js
│   └── validation.js
├── routes/                  # API route definitions
│   ├── health.js
│   ├── monitoring.js
│   ├── photos.js
│   ├── social.js
│   ├── supabaseBrands.js
│   └── supabasePerfumes.js
├── utils/                   # Utility functions
│   ├── cache-manifest.json
│   └── cacheBusting.js
├── tests/                   # Backend unit tests
├── logs/                    # Application logs
├── package.json             # Backend dependencies
├── server.js                # Main server file
├── Procfile                 # Heroku deployment
├── railway.toml             # Railway deployment
└── render.yaml              # Render deployment
```

### `/frontend` - Static Website
```
frontend/
├── css/                     # Stylesheets
│   └── social-integration.css
├── js/                      # JavaScript modules
│   ├── animations.js
│   ├── apiClient.js
│   ├── cache-manifest.js
│   ├── catalog.js
│   ├── errorMonitor.js
│   ├── fastImageLoader.js
│   ├── fragranceData.js
│   ├── main.js
│   ├── navigation.js
│   ├── offlineData.js
│   ├── socialIntegration.js
│   ├── supabaseClient.js
│   └── uiUtils.js
├── photos/                  # Product images
├── tests/                   # Frontend tests
├── _redirects               # Netlify redirects
├── index.html               # Homepage
├── catalog.html             # Product catalog
├── perfume-detail.html      # Product detail page
├── styles.css               # Main stylesheet
└── script.js                # Legacy script (fallback)
```

### `/database` - Database Layer
```
database/
├── schema.sql               # Database schema
├── simple_schema.sql        # Simplified schema
├── complete_migration.js    # Full migration script
├── migrate.js               # Migration runner
├── migrate_service.js       # Migration service
├── integrate_photos.js      # Photo integration
├── fix_gender_constraint.sql
└── update_gender_constraint.sql
```

### `/config` - Configuration Files
```
config/
├── netlify.toml             # Netlify deployment config
├── netlify-functions-example.toml
└── netlify-simple.toml
```

### `/docs` - Documentation
```
docs/
├── database_summary.js      # Database analysis
└── PROJECT_ISSUES_REPORT.txt
```

### `/scripts` - Build Scripts
```
scripts/
# Build and deployment scripts
```

### `/tests` - Integration Tests
```
tests/
├── test_api.js              # API integration tests
└── test_supabase.js         # Supabase connection tests
```

## 🔧 File Naming Conventions

- **Directories**: lowercase, hyphen-separated (e.g., `user-settings`)
- **JavaScript files**: camelCase (e.g., `apiClient.js`)
- **Configuration files**: lowercase with dots (e.g., `package.json`)
- **Documentation**: Title Case with spaces (e.g., `API Documentation.md`)

## 📋 File Organization Rules

1. **One responsibility per file**: Each file should have a single, clear purpose
2. **Logical grouping**: Related files should be in the same directory
3. **Configuration separation**: Environment-specific configs in `/config`
4. **Documentation**: All docs in `/docs` directory
5. **Tests**: Colocated with code they test, or in dedicated test directories
6. **Assets**: Organized by type (CSS, JS, images)

## 🚀 Deployment Structure

- **Frontend**: Deployed to Netlify from `/frontend` directory
- **Backend**: Deployed to Railway/Render from `/backend` directory
- **Database**: Managed via Supabase migrations
- **Configuration**: Environment-specific configs in `/config`

## 🔄 Development Workflow

1. **Frontend changes**: Edit files in `/frontend`
2. **Backend changes**: Edit files in `/backend`
3. **Database changes**: Update files in `/database`
4. **Configuration**: Update files in `/config`
5. **Documentation**: Update files in `/docs`

This structure ensures maintainability, scalability, and clear separation of concerns across the entire application.</content>
<parameter name="filePath">c:\Users\PC\Desktop\EdenWebSite\docs\PROJECT_STRUCTURE.md