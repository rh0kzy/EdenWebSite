# API Documentation

This document describes the Eden Parfum REST API endpoints.

## 🌐 Base URL

```
Production: https://your-backend-url.onrender.com
Development: http://localhost:3000
```

## 📋 API Endpoints

### Health Check

#### GET `/api/health`
Check if the API is running and database is connected.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-06T12:00:00.000Z",
  "version": "1.0.0",
  "database": {
    "status": "connected",
    "brands_count": 93,
    "perfumes_count": 506
  }
}
```

### Brands

#### GET `/api/brands`
Get all perfume brands.

**Query Parameters:**
- `limit` (optional): Number of brands to return (default: 50)
- `offset` (optional): Number of brands to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Chanel",
      "logo_url": "https://example.com/logos/chanel.png",
      "description": "Luxury French fashion house",
      "created_at": "2025-01-01T00:00:00.000Z"
    }
  ],
  "total": 93,
  "limit": 50,
  "offset": 0
}
```

#### GET `/api/brands/:id`
Get a specific brand by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Chanel",
    "logo_url": "https://example.com/logos/chanel.png",
    "description": "Luxury French fashion house",
    "perfume_count": 25
  }
}
```

### Perfumes

#### GET `/api/perfumes`
Get all perfumes with optional filtering.

**Query Parameters:**
- `limit` (optional): Number of perfumes to return (default: 50)
- `offset` (optional): Number of perfumes to skip (default: 0)
- `brand` (optional): Filter by brand name
- `gender` (optional): Filter by gender (Men, Women, Unisex)
- `search` (optional): Search in perfume names
- `min_price` (optional): Minimum price filter
- `max_price` (optional): Maximum price filter

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "reference": "1105",
      "name": "Chanel No. 5",
      "brand_name": "Chanel",
      "gender": "Women",
      "price": 125.00,
      "image_url": "https://example.com/images/chanel-no5.jpg",
      "description": "Iconic floral fragrance",
      "notes": ["Rose", "Jasmine", "Vanilla"],
      "created_at": "2025-01-01T00:00:00.000Z"
    }
  ],
  "total": 506,
  "limit": 50,
  "offset": 0,
  "filters": {
    "brand": null,
    "gender": null,
    "search": null
  }
}
```

#### GET `/api/perfumes/:reference`
Get a specific perfume by reference number.

**Response:**
```json
{
  "success": true,
  "data": {
    "reference": "1105",
    "name": "Chanel No. 5",
    "brand_name": "Chanel",
    "gender": "Women",
    "price": 125.00,
    "image_url": "https://example.com/images/chanel-no5.jpg",
    "description": "Iconic floral fragrance",
    "notes": ["Rose", "Jasmine", "Vanilla"],
    "ingredients": ["Alcohol", "Parfum", "Aqua"],
    "volume": "100ml",
    "concentration": "Eau de Parfum",
    "year_launched": 1921,
    "created_at": "2025-01-01T00:00:00.000Z"
  }
}
```

#### GET `/api/perfumes/search`
Search perfumes by name, brand, or notes.

**Query Parameters:**
- `q`: Search query (required)
- `limit` (optional): Number of results (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "reference": "1105",
      "name": "Chanel No. 5",
      "brand_name": "Chanel",
      "gender": "Women",
      "relevance_score": 0.95
    }
  ],
  "total": 15,
  "query": "chanel"
}
```

### Photos

#### GET `/api/photos`
Get perfume photos and images.

**Query Parameters:**
- `reference` (optional): Get photos for specific perfume
- `limit` (optional): Number of photos (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "perfume_reference": "1105",
      "url": "https://example.com/photos/chanel-no5-1.jpg",
      "alt_text": "Chanel No. 5 bottle",
      "is_primary": true,
      "sort_order": 1
    }
  ]
}
```

### Social Integration

#### GET `/api/social/shares`
Get social media share counts for perfumes.

**Query Parameters:**
- `reference` (optional): Get shares for specific perfume

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "perfume_reference": "1105",
      "platform": "instagram",
      "share_count": 1250,
      "last_updated": "2025-01-06T12:00:00.000Z"
    }
  ]
}
```

## 📊 Response Format

All API responses follow this structure:

```json
{
  "success": boolean,     // true for success, false for error
  "data": object|array,   // Response data (only present on success)
  "error": string,        // Error message (only present on failure)
  "message": string,      // Additional message (optional)
  "timestamp": string     // ISO 8601 timestamp
}
```

## 🚨 Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid request parameters",
  "message": "The 'limit' parameter must be a positive integer",
  "timestamp": "2025-01-06T12:00:00.000Z"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found",
  "message": "Perfume with reference '9999' not found",
  "timestamp": "2025-01-06T12:00:00.000Z"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "Database connection failed",
  "timestamp": "2025-01-06T12:00:00.000Z"
}
```

## 🔒 Authentication

Currently, the API is public and doesn't require authentication. All endpoints are accessible without API keys.

## 📏 Rate Limiting

- **Anonymous users**: 100 requests per hour
- **Authenticated users**: 1000 requests per hour (when implemented)

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 📡 CORS

The API supports Cross-Origin Resource Sharing (CORS) for web applications.

**Allowed Origins:**
- `http://localhost:3000` (development)
- `https://your-netlify-site.netlify.app` (production)

## 🧪 Testing

### Using cURL

```bash
# Health check
curl https://your-api-url.onrender.com/api/health

# Get brands
curl "https://your-api-url.onrender.com/api/brands?limit=5"

# Get perfumes
curl "https://your-api-url.onrender.com/api/perfumes?limit=10&gender=Women"

# Search perfumes
curl "https://your-api-url.onrender.com/api/perfumes/search?q=chanel"
```

### Using JavaScript

```javascript
// Fetch perfumes
fetch('/api/perfumes?limit=20')
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('Perfumes:', data.data);
    }
  })
  .catch(error => console.error('Error:', error));
```

## 📈 Performance

### Caching
- API responses are cached for 5 minutes
- Static assets are cached for 1 hour
- Database queries use connection pooling

### Optimization
- Database queries use indexes
- Images are optimized and served via CDN
- API responses are compressed (gzip)

## 🔧 SDK & Libraries

### JavaScript Client
```javascript
// apiClient.js is available in the frontend
import { getPerfumes, searchPerfumes } from './js/apiClient.js';

// Usage
const perfumes = await getPerfumes({ limit: 20, gender: 'Women' });
const results = await searchPerfumes('chanel');
```

## 📞 Support

For API issues or questions:
- Check the [GitHub Issues](https://github.com/rh0kzy/EdenWebSite/issues)
- Review server logs in Railway/Render dashboard
- Test with the provided test scripts in `/tests`

---

**API Version:** 1.0.0
**Last Updated:** January 6, 2025</content>
<parameter name="filePath">c:\Users\PC\Desktop\EdenWebSite\docs\API.md