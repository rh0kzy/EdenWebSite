const request = require('supertest');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Import routes
const supabasePerfumeRoutes = require('../routes/supabasePerfumes');
const supabaseBrandRoutes = require('../routes/supabaseBrands');
const photoRoutes = require('../routes/photos');

// Create test app
const createTestApp = () => {
  const app = express();
  
  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Routes
  app.use('/api/v2/perfumes', supabasePerfumeRoutes);
  app.use('/api/v2/brands', supabaseBrandRoutes);
  app.use('/api/v2/photos', photoRoutes);
  
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });
  
  return app;
};

describe('Eden Parfum API Tests', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('Health Check', () => {
    test('GET /api/health should return 200 with status ok', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      expect(response.body).toMatchObject({
        status: 'ok',
        environment: 'test'
      });
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('Perfumes API', () => {
    describe('GET /api/v2/perfumes', () => {
      test('should return list of perfumes', async () => {
        const response = await request(app)
          .get('/api/v2/perfumes')
          .expect(200);
        
        expect(Array.isArray(response.body)).toBe(true);
        
        // If perfumes exist, test structure
        if (response.body.length > 0) {
          expect(response.body[0]).toBeValidPerfume();
        }
      });

      test('should handle pagination parameters', async () => {
        const response = await request(app)
          .get('/api/v2/perfumes?limit=5&offset=0')
          .expect(200);
        
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeLessThanOrEqual(5);
      });

      test('should handle search query', async () => {
        const response = await request(app)
          .get('/api/v2/perfumes?search=chanel')
          .expect(200);
        
        expect(Array.isArray(response.body)).toBe(true);
        
        // If results exist, they should contain the search term
        if (response.body.length > 0) {
          const firstResult = response.body[0];
          const searchTerm = 'chanel';
          const containsSearchTerm = 
            firstResult.name?.toLowerCase().includes(searchTerm) ||
            firstResult.brand?.toLowerCase().includes(searchTerm) ||
            firstResult.reference?.toLowerCase().includes(searchTerm);
          
          expect(containsSearchTerm).toBe(true);
        }
      });

      test('should handle gender filter', async () => {
        const response = await request(app)
          .get('/api/v2/perfumes?gender=homme')
          .expect(200);
        
        expect(Array.isArray(response.body)).toBe(true);
        
        // If results exist, they should match the gender filter
        if (response.body.length > 0) {
          response.body.forEach(perfume => {
            expect(perfume.gender?.toLowerCase()).toBe('homme');
          });
        }
      });

      test('should handle brand filter', async () => {
        const response = await request(app)
          .get('/api/v2/perfumes?brand=Chanel')
          .expect(200);
        
        expect(Array.isArray(response.body)).toBe(true);
        
        // If results exist, they should match the brand filter
        if (response.body.length > 0) {
          response.body.forEach(perfume => {
            expect(perfume.brand?.toLowerCase()).toBe('chanel');
          });
        }
      });

      test('should handle invalid limit parameter', async () => {
        const response = await request(app)
          .get('/api/v2/perfumes?limit=invalid')
          .expect(200); // Should still work with default limit
        
        expect(Array.isArray(response.body)).toBe(true);
      });
    });

    describe('GET /api/v2/perfumes/genders', () => {
      test('should return unique genders', async () => {
        const response = await request(app)
          .get('/api/v2/perfumes/genders')
          .expect(200);
        
        expect(Array.isArray(response.body)).toBe(true);
        
        // Should contain unique values only
        const uniqueValues = [...new Set(response.body)];
        expect(response.body.length).toBe(uniqueValues.length);
      });
    });

    describe('GET /api/v2/perfumes/reference/:reference', () => {
      test('should return 404 for non-existent reference', async () => {
        const response = await request(app)
          .get('/api/v2/perfumes/reference/NONEXISTENT999')
          .expect(404);
        
        expect(response.body).toMatchObject({
          error: 'Perfume not found'
        });
      });

      test('should handle invalid reference format', async () => {
        const response = await request(app)
          .get('/api/v2/perfumes/reference/')
          .expect(404); // Route not found
      });
    });

    describe('GET /api/v2/perfumes/:id', () => {
      test('should return 404 for non-existent ID', async () => {
        const response = await request(app)
          .get('/api/v2/perfumes/999999')
          .expect(404);
        
        expect(response.body).toMatchObject({
          error: 'Perfume not found'
        });
      });

      test('should handle invalid ID format', async () => {
        const response = await request(app)
          .get('/api/v2/perfumes/invalid-id')
          .expect(400);
      });
    });
  });

  describe('Brands API', () => {
    describe('GET /api/v2/brands', () => {
      test('should return list of brands', async () => {
        const response = await request(app)
          .get('/api/v2/brands')
          .expect(200);
        
        expect(Array.isArray(response.body)).toBe(true);
        
        // If brands exist, test structure
        if (response.body.length > 0) {
          const brand = response.body[0];
          expect(brand).toHaveProperty('name');
          expect(typeof brand.name).toBe('string');
        }
      });

      test('should handle search query for brands', async () => {
        const response = await request(app)
          .get('/api/v2/brands?search=chanel')
          .expect(200);
        
        expect(Array.isArray(response.body)).toBe(true);
      });
    });
  });

  describe('Photos API', () => {
    describe('GET /api/v2/photos/brands', () => {
      test('should return brand photos list', async () => {
        const response = await request(app)
          .get('/api/v2/photos/brands')
          .expect(200);
        
        expect(Array.isArray(response.body)).toBe(true);
      });
    });

    describe('GET /api/v2/photos/brands/:filename', () => {
      test('should return 404 for non-existent photo', async () => {
        await request(app)
          .get('/api/v2/photos/brands/nonexistent.jpg')
          .expect(404);
      });
    });
  });

  describe('Error Handling', () => {
    test('should return 404 for unknown routes', async () => {
      await request(app)
        .get('/api/v2/unknown-endpoint')
        .expect(404);
    });

    test('should handle malformed JSON in POST requests', async () => {
      const response = await request(app)
        .post('/api/v2/perfumes')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400);
    });
  });

  describe('Security Headers', () => {
    test('should include security headers', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      // Check for Helmet security headers
      expect(response.headers['x-frame-options']).toBeDefined();
      expect(response.headers['x-content-type-options']).toBeDefined();
    });
  });
});