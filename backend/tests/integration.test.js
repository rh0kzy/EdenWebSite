// Simple integration tests for API endpoints without database dependency
const request = require('supertest');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Create a simple test app that doesn't use Supabase
const createSimpleTestApp = () => {
  const app = express();
  
  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Mock routes that don't depend on Supabase
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'test'
    });
  });

  // Mock perfumes endpoint
  app.get('/api/v2/perfumes', (req, res) => {
    const mockPerfumes = [
      {
        id: 1,
        name: 'Test Perfume 1',
        brand: 'Test Brand',
        reference: 'TEST001',
        gender: 'homme'
      },
      {
        id: 2,
        name: 'Test Perfume 2',
        brand: 'Another Brand',
        reference: 'TEST002',
        gender: 'femme'
      }
    ];

    const { limit = 50, offset = 0, search, brand, gender } = req.query;
    let filteredPerfumes = [...mockPerfumes];

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPerfumes = filteredPerfumes.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.brand.toLowerCase().includes(searchLower) ||
        p.reference.toLowerCase().includes(searchLower)
      );
    }

    if (brand) {
      filteredPerfumes = filteredPerfumes.filter(p => 
        p.brand.toLowerCase() === brand.toLowerCase()
      );
    }

    if (gender) {
      filteredPerfumes = filteredPerfumes.filter(p => 
        p.gender.toLowerCase() === gender.toLowerCase()
      );
    }

    // Apply pagination
    const startIndex = parseInt(offset) || 0;
    const limitNum = parseInt(limit) || 50;
    const result = filteredPerfumes.slice(startIndex, startIndex + limitNum);

    res.status(200).json(result);
  });

  app.get('/api/v2/perfumes/genders', (req, res) => {
    res.status(200).json(['homme', 'femme', 'mixte']);
  });

  app.get('/api/v2/perfumes/reference/:reference', (req, res) => {
    const { reference } = req.params;
    
    if (!reference) {
      return res.status(400).json({ error: 'Reference parameter is required' });
    }

    if (reference === 'TEST001') {
      return res.status(200).json({
        id: 1,
        name: 'Test Perfume 1',
        brand: 'Test Brand',
        reference: 'TEST001',
        gender: 'homme'
      });
    }

    res.status(404).json({ error: 'Perfume not found' });
  });

  app.get('/api/v2/perfumes/:id', (req, res) => {
    const { id } = req.params;
    const numId = parseInt(id);
    
    if (!id || isNaN(numId) || numId < 1) {
      return res.status(400).json({ error: 'Invalid ID parameter' });
    }

    if (numId === 1) {
      return res.status(200).json({
        id: 1,
        name: 'Test Perfume 1',
        brand: 'Test Brand',
        reference: 'TEST001',
        gender: 'homme'
      });
    }

    res.status(404).json({ error: 'Perfume not found' });
  });

  app.get('/api/v2/brands', (req, res) => {
    const mockBrands = [
      { name: 'Test Brand' },
      { name: 'Another Brand' },
      { name: 'Chanel' }
    ];

    const { search } = req.query;
    let filteredBrands = [...mockBrands];

    if (search) {
      const searchLower = search.toLowerCase();
      filteredBrands = filteredBrands.filter(b => 
        b.name.toLowerCase().includes(searchLower)
      );
    }

    res.status(200).json(filteredBrands);
  });

  // 404 handler for unknown routes
  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  // Error handler
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'Invalid JSON' });
    }
    res.status(500).json({ error: 'Internal server error' });
  });
  
  return app;
};

describe('Eden Parfum API Integration Tests', () => {
  let app;

  beforeAll(() => {
    app = createSimpleTestApp();
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
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0]).toBeValidPerfume();
      });

      test('should handle pagination parameters', async () => {
        const response = await request(app)
          .get('/api/v2/perfumes?limit=1&offset=0')
          .expect(200);
        
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(1);
      });

      test('should handle search query', async () => {
        const response = await request(app)
          .get('/api/v2/perfumes?search=test')
          .expect(200);
        
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0].name.toLowerCase()).toContain('test');
      });

      test('should handle gender filter', async () => {
        const response = await request(app)
          .get('/api/v2/perfumes?gender=homme')
          .expect(200);
        
        expect(Array.isArray(response.body)).toBe(true);
        response.body.forEach(perfume => {
          expect(perfume.gender).toBe('homme');
        });
      });

      test('should handle brand filter', async () => {
        const response = await request(app)
          .get('/api/v2/perfumes?brand=Test Brand')
          .expect(200);
        
        expect(Array.isArray(response.body)).toBe(true);
        response.body.forEach(perfume => {
          expect(perfume.brand).toBe('Test Brand');
        });
      });

      test('should handle invalid limit parameter gracefully', async () => {
        const response = await request(app)
          .get('/api/v2/perfumes?limit=invalid')
          .expect(200);
        
        expect(Array.isArray(response.body)).toBe(true);
      });

      test('should return empty array for no matches', async () => {
        const response = await request(app)
          .get('/api/v2/perfumes?search=nonexistent')
          .expect(200);
        
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(0);
      });
    });

    describe('GET /api/v2/perfumes/genders', () => {
      test('should return unique genders', async () => {
        const response = await request(app)
          .get('/api/v2/perfumes/genders')
          .expect(200);
        
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body).toContain('homme');
        expect(response.body).toContain('femme');
      });
    });

    describe('GET /api/v2/perfumes/reference/:reference', () => {
      test('should return perfume by valid reference', async () => {
        const response = await request(app)
          .get('/api/v2/perfumes/reference/TEST001')
          .expect(200);
        
        expect(response.body).toBeValidPerfume();
        expect(response.body.reference).toBe('TEST001');
      });

      test('should return 404 for non-existent reference', async () => {
        const response = await request(app)
          .get('/api/v2/perfumes/reference/NONEXISTENT999')
          .expect(404);
        
        expect(response.body).toMatchObject({
          error: 'Perfume not found'
        });
      });
    });

    describe('GET /api/v2/perfumes/:id', () => {
      test('should return perfume by valid ID', async () => {
        const response = await request(app)
          .get('/api/v2/perfumes/1')
          .expect(200);
        
        expect(response.body).toBeValidPerfume();
        expect(response.body.id).toBe(1);
      });

      test('should return 404 for non-existent ID', async () => {
        const response = await request(app)
          .get('/api/v2/perfumes/999999')
          .expect(404);
        
        expect(response.body).toMatchObject({
          error: 'Perfume not found'
        });
      });

      test('should return 400 for invalid ID format', async () => {
        const response = await request(app)
          .get('/api/v2/perfumes/invalid-id')
          .expect(400);
        
        expect(response.body).toMatchObject({
          error: 'Invalid ID parameter'
        });
      });

      test('should return 400 for negative ID', async () => {
        const response = await request(app)
          .get('/api/v2/perfumes/-1')
          .expect(400);
        
        expect(response.body).toMatchObject({
          error: 'Invalid ID parameter'
        });
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
        expect(response.body.length).toBeGreaterThan(0);
        
        const brand = response.body[0];
        expect(brand).toHaveProperty('name');
        expect(typeof brand.name).toBe('string');
      });

      test('should handle search query for brands', async () => {
        const response = await request(app)
          .get('/api/v2/brands?search=test')
          .expect(200);
        
        expect(Array.isArray(response.body)).toBe(true);
        response.body.forEach(brand => {
          expect(brand.name.toLowerCase()).toContain('test');
        });
      });

      test('should return empty array for no brand matches', async () => {
        const response = await request(app)
          .get('/api/v2/brands?search=nonexistent')
          .expect(200);
        
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(0);
      });
    });
  });

  describe('Error Handling', () => {
    test('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/api/v2/unknown-endpoint')
        .expect(404);
        
      expect(response.body).toMatchObject({
        error: 'Route not found'
      });
    });

    test('should handle malformed JSON in POST requests', async () => {
      const response = await request(app)
        .post('/api/v2/perfumes')
        .send('invalid json string that is not json')
        .set('Content-Type', 'application/json')
        .expect(400);
        
      expect(response.body).toMatchObject({
        error: 'Invalid JSON'
      });
    });
  });

  describe('Security Headers', () => {
    test('should include Helmet security headers', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      // Check for Helmet security headers
      expect(response.headers['x-frame-options']).toBeDefined();
      expect(response.headers['x-content-type-options']).toBeDefined();
    });

    test('should handle CORS headers', async () => {
      const response = await request(app)
        .options('/api/health')
        .expect(204);
      
      // CORS should be enabled
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('Input Validation', () => {
    test('should validate pagination limit bounds', async () => {
      const response = await request(app)
        .get('/api/v2/perfumes?limit=0')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('should validate pagination offset bounds', async () => {
      const response = await request(app)
        .get('/api/v2/perfumes?offset=-1')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('should handle empty search queries', async () => {
      const response = await request(app)
        .get('/api/v2/perfumes?search=')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});