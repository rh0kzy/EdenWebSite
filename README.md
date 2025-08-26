# Eden Parfum Website

A full-stack perfume catalog website featuring a modern frontend and RESTful API backend.

## Project Structure

```
EdenWebSite/
├── frontend/                 # Frontend static files
│   ├── index.html           # Main website page
│   ├── catalog.html         # Perfume catalog page
│   ├── styles.css           # Main styles
│   ├── script.js            # Frontend JavaScript
│   ├── perfumes-data.js     # Perfume database
│   ├── photos/              # Image assets
│   └── package.json         # Frontend dependencies
├── backend/                 # Node.js API server
│   ├── server.js            # Main server file
│   ├── routes/              # API route handlers
│   ├── controllers/         # Business logic
│   ├── data/                # Data management
│   ├── middleware/          # Custom middleware
│   └── package.json         # Backend dependencies
└── package.json             # Root project configuration
```

## Features

### Frontend
- 🌸 Modern responsive design
- 📱 Mobile-friendly interface
- 🔍 Advanced search and filtering
- 🏷️ Brand-based organization
- 📋 Detailed perfume catalog
- 🎨 Premium UI/UX design

### Backend API
- 🚀 Express.js REST API
- 🔐 Security middleware (Helmet, CORS)
- 📊 Rate limiting
- 🗃️ Structured data management
- 📝 Comprehensive logging
- ⚡ Fast search capabilities

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/perfumes` - Get all perfumes
- `GET /api/perfumes/:id` - Get perfume by reference
- `GET /api/brands` - Get all brands
- `GET /api/search` - Search perfumes
- `POST /api/search` - Advanced search with filters

## Quick Start

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd EdenWebSite
   ```

2. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

3. **Start development servers:**
   ```bash
   npm run dev
   ```
   This runs both frontend (http://localhost:8080) and backend (http://localhost:3000)

### Alternative: Run Individually

**Backend only:**
```bash
cd backend
npm install
npm run dev
```

**Frontend only:**
```bash
cd frontend
npm install
npm run dev
```

## Environment Configuration

Create a `.env` file in the backend directory:

```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
```

## Deployment Options

### Option 1: Static Site Deployment (Recommended for GitHub Pages/Netlify)

The frontend can be deployed as a static site since it's self-contained:

#### **Netlify Deployment:**
1. **Automatic:** Connect your GitHub repo to Netlify
   - Build command: `echo 'Static site'`
   - Publish directory: `frontend`
   - The `netlify.toml` file is already configured

2. **Manual:** Drag and drop the `frontend` folder to Netlify

#### **GitHub Pages Deployment:**
1. Enable GitHub Pages in repository settings
2. Use GitHub Actions (`.github/workflows/deploy.yml` is configured)
3. Set source to "GitHub Actions"

### Option 2: Full-Stack Deployment (For both frontend + backend)

For platforms like Heroku, Railway, or VPS:

1. **Build and start backend:**
   ```bash
   cd backend
   npm install --production
   npm start
   ```

2. **Serve frontend through backend:**
   The backend can serve the frontend files at the root URL.

## Production Deployment

1. **Build and start backend:**
   ```bash
   cd backend
   npm install --production
   npm start
   ```

2. **Serve frontend through backend:**
   The backend automatically serves the frontend files at the root URL.

## API Usage Examples

### Get all perfumes
```bash
curl http://localhost:3000/api/perfumes
```

### Search perfumes
```bash
curl "http://localhost:3000/api/search?q=chanel&gender=Women"
```

### Get specific perfume
```bash
curl http://localhost:3000/api/perfumes/1101
```

## Development

### Backend Development
- Uses nodemon for auto-restart
- Morgan for request logging
- Express rate limiting
- CORS enabled for frontend

### Frontend Development
- Live-server for auto-reload
- Pure HTML/CSS/JavaScript
- Mobile-responsive design
- Progressive enhancement

## Database

Currently uses in-memory JavaScript arrays. The perfume data includes:
- Reference number
- Name
- Brand
- Gender (Women/Men/Mixte)
- Price multipliers for premium products

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support or questions, contact the Eden Parfum team.

---

**Eden Parfum** - Premium Fragrance Collection
