# Development Setup Guide

This guide will help you set up the Eden Parfum project for local development.

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** - [Download from nodejs.org](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download from git-scm.com](https://git-scm.com/)
- **Supabase account** - [Sign up at supabase.com](https://supabase.com/)

### Optional Tools
- **VS Code** - Recommended IDE
- **Postman** - For API testing
- **GitHub Desktop** - GUI for Git operations

## 📥 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/rh0kzy/EdenWebSite.git
cd eden-parfum
```

### 2. Install Dependencies

Install dependencies for all workspaces:

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

Or use the convenience script:

```bash
npm run install:all
```

### 3. Environment Configuration

#### Backend Environment Setup

1. Copy the environment template:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Edit `backend/.env` with your configuration:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Frontend Configuration
   FRONTEND_URL=http://localhost:3000

   # Supabase Configuration
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Database direct connection (optional)
   DATABASE_URL=postgresql://postgres:password@db.supabase.co:5432/postgres
   ```

#### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com/)
2. Go to Settings → API to get your project URL and keys
3. Run the database migrations:
   ```bash
   cd database
   # Connect to your Supabase database and run:
   psql -f schema.sql
   node complete_migration.js
   ```

### 4. Database Setup

Run the database migrations:

```bash
# From project root
npm run migrate:supabase
```

Or manually:

```bash
cd database
node migrate.js
```

## 🚀 Running the Application

### Development Mode (Recommended)

Run both frontend and backend simultaneously:

```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:3000`
- Frontend development server on `http://localhost:8080`

### Manual Startup

#### Backend Only
```bash
cd backend
npm run dev  # Development with nodemon
# or
npm start    # Production mode
```

#### Frontend Only
```bash
cd frontend
npm run dev  # If available
# or
npx live-server --port=8080 --open=/index.html
```

### Production Build

```bash
# Build for production
npm run build

# The frontend files in /frontend are ready for static hosting
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Backend Tests
```bash
cd backend
npm test
```

### Integration Tests
```bash
cd tests
node test_api.js
node test_supabase.js
```

### Manual Testing

1. **API Testing**: Use Postman or curl to test endpoints
2. **Frontend Testing**: Open browser to `http://localhost:8080`
3. **Database Testing**: Check Supabase dashboard for data

## 🔧 Development Workflow

### Code Changes

1. **Frontend**: Edit files in `/frontend`
2. **Backend**: Edit files in `/backend`
3. **Database**: Update schemas in `/database`

### Git Workflow

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Add your feature description"

# Push to GitHub
git push origin feature/your-feature-name

# Create a Pull Request
```

### Code Quality

- Run tests before committing
- Follow the existing code style
- Update documentation for new features
- Test both locally and in production-like environment

## 🚀 Deployment

### Frontend (Netlify)

1. Connect your GitHub repository to Netlify
2. Set build settings:
   - **Build command**: `echo 'No build needed'`
   - **Publish directory**: `frontend`
3. Add environment variables in Netlify dashboard

### Backend (Railway/Render)

1. Connect your GitHub repository
2. Set build settings:
   - **Build command**: `npm install`
   - **Start command**: `npm start`
3. Add environment variables

### Database

Database is managed through Supabase - no additional deployment needed.

## 🔍 Troubleshooting

### Common Issues

#### Backend Won't Start
- Check if port 3000 is available
- Verify `.env` file exists and has correct values
- Check console for error messages

#### Frontend Not Loading
- Ensure backend is running
- Check browser console for JavaScript errors
- Verify API endpoints are accessible

#### Database Connection Issues
- Verify Supabase credentials
- Check if database migrations ran successfully
- Test connection with `node tests/test_supabase.js`

#### Port Conflicts
- Change ports in `.env` file
- Kill processes using the ports:
  ```bash
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  ```

### Debug Mode

Enable debug logging:

```bash
# Backend debug
cd backend
DEBUG=* npm run dev

# Frontend debug
# Open browser DevTools (F12)
# Check Console and Network tabs
```

### Getting Help

1. Check existing issues on GitHub
2. Review documentation in `/docs`
3. Test with the provided test scripts
4. Check logs in `backend/logs/`

## 📚 Additional Resources

- [API Documentation](./docs/api.md)
- [Database Schema](./docs/database.md)
- [Contributing Guidelines](./docs/contributing.md)
- [Supabase Documentation](https://supabase.com/docs)
- [Express.js Guide](https://expressjs.com/)

---

Happy coding! 🎉</content>
<parameter name="filePath">c:\Users\PC\Desktop\EdenWebSite\docs\DEVELOPMENT_SETUP.md