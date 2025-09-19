# Eden Parfum Backend

A Node.js/Express REST API for the Eden Parfum perfume catalog website.

## Features

- **Perfume Catalog**: Complete database of perfumes with references, names, brands, and gender categories
- **Search Functionality**: Advanced search with multiple filters and suggestions
- **Brand Management**: Brand listings with logos and perfume counts
- **API Filtering**: Filter by brand, gender, search terms with pagination
- **Static File Serving**: Serves frontend assets and images
- **Rate Limiting**: Protection against abuse
- **CORS Support**: Cross-origin requests enabled
- **Error Handling**: Comprehensive error handling and validation
- **Environment Validation**: Automated validation of required environment variables
- **Cache Busting**: Automated asset versioning for optimal browser caching
- **Monitoring**: Health checks and performance monitoring

## API Endpoints

### Perfumes
- `GET /api/perfumes` - Get all perfumes with optional filtering
- `GET /api/perfumes/:reference` - Get perfume by reference number
- `GET /api/perfumes/brand/:brand` - Get perfumes by brand
- `GET /api/perfumes/gender/:gender` - Get perfumes by gender
- `GET /api/perfumes/random` - Get random perfumes for featured section
- `GET /api/perfumes/stats` - Get perfume statistics

### Brands
- `GET /api/brands` - Get all brands
- `GET /api/brands/featured` - Get featured brands with most perfumes
- `GET /api/brands/:name` - Get brand details by name

### Search
- `GET /api/search?q={query}` - Search perfumes
- `GET /api/search/suggestions?q={query}` - Get search suggestions
- `GET /api/search/advanced` - Advanced search with multiple filters

### Health Check
- `GET /api/health` - API health status

### Monitoring
- `GET /api/monitoring/health` - Comprehensive system health check
- `GET /api/monitoring/environment` - Environment validation status
- `GET /api/monitoring/environment/details` - Detailed environment validation
- `GET /api/monitoring/environment/example` - Download .env.example template

## Query Parameters

### Pagination
- `limit` - Number of results per page (1-100)
- `offset` - Number of results to skip

### Filtering
- `brand` - Filter by brand name
- `gender` - Filter by gender (Men, Women, Mixte)
- `search` - Search term for name, brand, or reference

### Search
- `q` - Search query
- `name` - Filter by perfume name
- `reference` - Filter by reference number
- `hasMultiplier` - Filter perfumes with price multipliers

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd EdenWebSite/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configurations
   ```

   **Required Environment Variables:**
   - `NODE_ENV` - Environment mode (development, production, staging, test)
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_ANON_KEY` - Your Supabase anonymous key

   **Optional Configuration:**
   - `PORT` - Server port (default: 3000)
   - `LOG_LEVEL` - Logging level (error, warn, info, debug)
   - `ENABLE_MONITORING` - Enable performance monitoring
   - See `.env.example` for complete configuration options

4. **Validate environment setup**
   ```bash
   # The server will automatically validate environment variables on startup
   # Check the console output for any configuration issues
   npm run dev
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## Environment Configuration

The backend includes comprehensive environment validation to ensure all required configuration is present and valid before starting the server.

### Environment Validation Features

- **Startup Validation**: Automatic validation when the server starts
- **Type Checking**: Validates data types for numeric and boolean values
- **Dependency Validation**: Ensures related configurations are consistent
- **Security Scoring**: Calculates configuration security score
- **Missing Variable Detection**: Identifies required but missing variables
- **API Endpoints**: Runtime access to validation status via monitoring endpoints

### Environment Categories

1. **Server Configuration**: Basic server settings (PORT, NODE_ENV)
2. **Database**: Supabase connection settings
3. **Logging**: Log levels, file paths, and rotation settings
4. **Monitoring**: Performance metrics and health check settings
5. **Notifications**: Error notification settings (email, webhooks)
6. **Security**: Authentication, CORS, and rate limiting settings

### Validation API Endpoints

- `GET /api/monitoring/environment` - Environment validation summary with security score
- `GET /api/monitoring/environment/details` - Detailed validation results
- `GET /api/monitoring/environment/example` - Download updated .env.example template

### Production Safety

In production environments, the server will **not start** if critical environment variables are missing or invalid. This prevents misconfigured deployments and ensures system reliability.

## Environment Variables

The backend uses environment variables for configuration. A comprehensive `.env.example` template is provided with detailed documentation for all available settings.

### Core Configuration

```env
# Server
PORT=3000
NODE_ENV=development

# Database (Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# Monitoring
ENABLE_MONITORING=false
HEALTH_CHECK_TIMEOUT=5000
```

### Complete Configuration

For a complete list of all available environment variables with descriptions and default values, see the `.env.example` file. The configuration includes:

- **Server Settings**: Port, environment mode, timeouts
- **Database**: Supabase connection and authentication
- **Logging**: Log levels, file rotation, formats
- **Security**: JWT secrets, CORS, rate limiting
- **Monitoring**: Performance metrics, health checks
- **Notifications**: Error alerts via email or webhooks
- **Caching**: Redis configuration, TTL settings
- **File Uploads**: Size limits, allowed types, storage paths

### Environment Validation

The server automatically validates all environment variables on startup using the built-in EnvironmentValidator. This ensures:

- Required variables are present
- Values have correct data types
- Dependencies between variables are satisfied
- Security best practices are followed

Access validation status via the monitoring API at `/api/monitoring/environment`.
```

## Project Structure

```
backend/
├── controllers/         # Request handlers
│   ├── perfumeController.js
│   ├── brandController.js
│   └── searchController.js
├── data/               # Data files
│   └── perfumes.js     # Perfume database
├── middleware/         # Custom middleware
│   └── validation.js   # Request validation
├── routes/            # Route definitions
│   ├── perfumes.js
│   ├── brands.js
│   └── search.js
├── .env               # Environment variables
├── package.json       # Dependencies and scripts
└── server.js          # Main server file
```

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "offset": 0,
    "limit": 20,
    "hasMore": true
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}
```

## Sample Perfume Object

```json
{
  "reference": "1101",
  "name": "Loverdose",
  "brand": "Diesel",
  "gender": "Women",
  "multiplier": "x1.5",
  "brandLogo": "/photos/diesel.png",
  "imageUrl": "/photos/Fragrances/Loverdose.avif"
}
```

## Usage Examples

### Get all perfumes
```bash
curl "http://localhost:3000/api/perfumes"
```

### Search perfumes
```bash
curl "http://localhost:3000/api/search?q=chanel"
```

### Get perfumes by brand
```bash
curl "http://localhost:3000/api/perfumes/brand/Dior"
```

### Get perfume by reference
```bash
curl "http://localhost:3000/api/perfumes/1101"
```

### Advanced search
```bash
curl "http://localhost:3000/api/search/advanced?brand=Chanel&gender=Women&limit=10"
```

## Dependencies

- **express** - Web framework
- **cors** - Cross-origin resource sharing
- **helmet** - Security middleware
- **morgan** - HTTP request logger
- **dotenv** - Environment variables
- **express-rate-limit** - Rate limiting
- **multer** - File uploads (for future use)

## Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Adding New Perfumes
1. Edit `data/perfumes.js`
2. Add new perfume objects to the `perfumesDatabase` array
3. Ensure proper reference numbering and required fields

### Testing
Test API endpoints using tools like:
- Postman
- curl
- Browser (for GET requests)

## Deployment

1. Set `NODE_ENV=production` in environment
2. Configure proper CORS origins
3. Set up process manager (PM2)
4. Configure reverse proxy (nginx)
5. Set up SSL certificates

## License

MIT License - see LICENSE file for details.

## Support

For support and questions, contact the Eden Parfum team.
