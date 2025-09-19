// Mock environment variables for testing
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-key';

const mockPerfume = {
  id: 1,
  name: 'Test Perfume',
  brand: 'Test Brand',
  reference: 'TEST001',
  gender: 'homme',
  description: 'Test description',
  photo_url: 'test-photo.jpg'
};

// Mock Supabase with proper chaining
const mockSupabaseQuery = {
  select: jest.fn(() => mockSupabaseQuery),
  eq: jest.fn(() => mockSupabaseQuery),
  ilike: jest.fn(() => mockSupabaseQuery),
  order: jest.fn(() => mockSupabaseQuery),
  range: jest.fn(() => mockSupabaseQuery),
  not: jest.fn(() => mockSupabaseQuery),
  single: jest.fn(() => Promise.resolve({ 
    data: mockPerfume, 
    error: null 
  }))
};

// Set default return for chained methods
mockSupabaseQuery.select.mockReturnValue(mockSupabaseQuery);
mockSupabaseQuery.eq.mockReturnValue(mockSupabaseQuery);
mockSupabaseQuery.ilike.mockReturnValue(mockSupabaseQuery);
mockSupabaseQuery.order.mockReturnValue(mockSupabaseQuery);
mockSupabaseQuery.range.mockReturnValue(Promise.resolve({ 
  data: [mockPerfume], 
  error: null 
}));
mockSupabaseQuery.not.mockReturnValue(mockSupabaseQuery);

const mockSupabase = {
  from: jest.fn(() => mockSupabaseQuery)
};

// Mock the createClient function
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabase)
}));

const {
  getAllPerfumes,
  getPerfumeByReference,
  getPerfumeById,
  getUniqueGenders
} = require('../controllers/supabasePerfumeController');

describe('Perfume Controller Tests', () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {},
      params: {}
    };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(() => res),
      send: jest.fn(() => res)
    };
  });

  describe('getAllPerfumes', () => {
    test('should return all perfumes with default pagination', async () => {
      await getAllPerfumes(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([mockPerfume]);
    });

    test('should handle search query', async () => {
      req.query.search = 'test';
      
      await getAllPerfumes(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([mockPerfume]);
    });

    test('should handle pagination parameters', async () => {
      req.query.limit = '10';
      req.query.offset = '5';
      
      await getAllPerfumes(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([mockPerfume]);
    });

    test('should handle gender filter', async () => {
      req.query.gender = 'homme';
      
      await getAllPerfumes(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([mockPerfume]);
    });

    test('should handle brand filter', async () => {
      req.query.brand = 'Test Brand';
      
      await getAllPerfumes(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([mockPerfume]);
    });

    test('should validate limit parameter', async () => {
      req.query.limit = 'invalid';
      
      await getAllPerfumes(req, res);
      
      // Should use default limit and still work
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('should validate offset parameter', async () => {
      req.query.offset = 'invalid';
      
      await getAllPerfumes(req, res);
      
      // Should use default offset and still work
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getPerfumeByReference', () => {
    test('should return perfume by reference', async () => {
      req.params.reference = 'TEST001';
      
      await getPerfumeByReference(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockPerfume);
    });

    test('should handle missing reference parameter', async () => {
      // No reference in params
      
      await getPerfumeByReference(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Reference parameter is required'
      });
    });

    test('should handle empty reference parameter', async () => {
      req.params.reference = '';
      
      await getPerfumeByReference(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Reference parameter is required'
      });
    });
  });

  describe('getPerfumeById', () => {
    test('should return perfume by ID', async () => {
      req.params.id = '1';
      
      await getPerfumeById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockPerfume);
    });

    test('should handle invalid ID parameter', async () => {
      req.params.id = 'invalid';
      
      await getPerfumeById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid ID parameter'
      });
    });

    test('should handle missing ID parameter', async () => {
      // No ID in params
      
      await getPerfumeById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'ID parameter is required'
      });
    });

    test('should handle negative ID', async () => {
      req.params.id = '-1';
      
      await getPerfumeById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid ID parameter'
      });
    });
  });

  describe('getUniqueGenders', () => {
    test('should return unique genders', async () => {
      await getUniqueGenders(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([mockPerfume]);
    });
  });
});