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

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## Environment Variables

```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
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
