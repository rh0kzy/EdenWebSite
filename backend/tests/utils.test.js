// Unit tests for utility functions and validation logic
// Create utility functions directly in the test file

const validators = {
  isValidId: (id) => {
    const numId = parseInt(id);
    return !isNaN(numId) && numId > 0;
  },
  
  sanitizeSearchQuery: (query) => {
    if (!query || typeof query !== 'string') return '';
    return query.trim().toLowerCase();
  },
  
  validatePaginationParams: (limit, offset) => {
    const numLimit = parseInt(limit) || 50;
    const numOffset = parseInt(offset) || 0;
    
    return {
      limit: Math.max(1, Math.min(100, numLimit)), // Between 1 and 100
      offset: Math.max(0, numOffset) // Non-negative
    };
  },
  
  isValidReference: (reference) => {
    if (!reference || typeof reference !== 'string') return false;
    return reference.trim().length > 0;
  },
  
  formatPerfumeResponse: (perfume) => {
    if (!perfume) return null;
    
    return {
      id: perfume.id,
      name: perfume.name || '',
      brand: perfume.brand || '',
      reference: perfume.reference || '',
      gender: perfume.gender || '',
      description: perfume.description || '',
      photo_url: perfume.photo_url || ''
    };
  }
};

describe('Validation Utilities', () => {
  describe('isValidId', () => {
    test('should return true for valid positive integers', () => {
      expect(validators.isValidId('1')).toBe(true);
      expect(validators.isValidId('123')).toBe(true);
      expect(validators.isValidId(1)).toBe(true);
    });

    test('should return false for invalid IDs', () => {
      expect(validators.isValidId('0')).toBe(false);
      expect(validators.isValidId('-1')).toBe(false);
      expect(validators.isValidId('abc')).toBe(false);
      expect(validators.isValidId('')).toBe(false);
      expect(validators.isValidId(null)).toBe(false);
      expect(validators.isValidId(undefined)).toBe(false);
    });
  });

  describe('sanitizeSearchQuery', () => {
    test('should sanitize and lowercase search queries', () => {
      expect(validators.sanitizeSearchQuery('  CHANEL  ')).toBe('chanel');
      expect(validators.sanitizeSearchQuery('Test Search')).toBe('test search');
      expect(validators.sanitizeSearchQuery('123')).toBe('123');
    });

    test('should handle invalid search queries', () => {
      expect(validators.sanitizeSearchQuery('')).toBe('');
      expect(validators.sanitizeSearchQuery(null)).toBe('');
      expect(validators.sanitizeSearchQuery(undefined)).toBe('');
      expect(validators.sanitizeSearchQuery(123)).toBe('');
    });
  });

  describe('validatePaginationParams', () => {
    test('should validate and normalize pagination parameters', () => {
      const result = validators.validatePaginationParams('10', '5');
      expect(result).toEqual({ limit: 10, offset: 5 });
    });

    test('should apply default values for invalid parameters', () => {
      const result = validators.validatePaginationParams('invalid', 'invalid');
      expect(result).toEqual({ limit: 50, offset: 0 });
    });

    test('should enforce maximum limit', () => {
      const result = validators.validatePaginationParams('200', '0');
      expect(result.limit).toBe(100); // Maximum enforced
    });

    test('should enforce minimum values', () => {
      const result = validators.validatePaginationParams('0', '-10');
      expect(result).toEqual({ limit: 50, offset: 0 }); // Uses default limit for invalid 0
    });
  });

  describe('isValidReference', () => {
    test('should return true for valid references', () => {
      expect(validators.isValidReference('TEST001')).toBe(true);
      expect(validators.isValidReference('ABC123')).toBe(true);
      expect(validators.isValidReference('  REF001  ')).toBe(true);
    });

    test('should return false for invalid references', () => {
      expect(validators.isValidReference('')).toBe(false);
      expect(validators.isValidReference('   ')).toBe(false);
      expect(validators.isValidReference(null)).toBe(false);
      expect(validators.isValidReference(undefined)).toBe(false);
      expect(validators.isValidReference(123)).toBe(false);
    });
  });

  describe('formatPerfumeResponse', () => {
    test('should format perfume object correctly', () => {
      const input = {
        id: 1,
        name: 'Test Perfume',
        brand: 'Test Brand',
        reference: 'TEST001',
        gender: 'homme',
        description: 'A test perfume',
        photo_url: 'test.jpg',
        extra_field: 'should be ignored'
      };

      const result = validators.formatPerfumeResponse(input);
      
      expect(result).toEqual({
        id: 1,
        name: 'Test Perfume',
        brand: 'Test Brand',
        reference: 'TEST001',
        gender: 'homme',
        description: 'A test perfume',
        photo_url: 'test.jpg'
      });
    });

    test('should handle missing fields with defaults', () => {
      const input = {
        id: 1,
        name: 'Test Perfume'
      };

      const result = validators.formatPerfumeResponse(input);
      
      expect(result).toEqual({
        id: 1,
        name: 'Test Perfume',
        brand: '',
        reference: '',
        gender: '',
        description: '',
        photo_url: ''
      });
    });

    test('should return null for invalid input', () => {
      expect(validators.formatPerfumeResponse(null)).toBe(null);
      expect(validators.formatPerfumeResponse(undefined)).toBe(null);
    });
  });
});

describe('Response Formatting', () => {
  describe('Error Response Format', () => {
    test('should format error responses consistently', () => {
      const formatError = (message, status = 500) => ({
        error: message,
        status,
        timestamp: expect.any(String)
      });

      const error404 = formatError('Not found', 404);
      expect(error404).toMatchObject({
        error: 'Not found',
        status: 404
      });
    });
  });

  describe('Success Response Format', () => {
    test('should format success responses consistently', () => {
      const formatSuccess = (data, meta = {}) => ({
        data,
        meta: {
          timestamp: new Date().toISOString(),
          ...meta
        }
      });

      const response = formatSuccess([{ id: 1 }], { total: 1 });
      expect(response).toMatchObject({
        data: [{ id: 1 }],
        meta: {
          total: 1,
          timestamp: expect.any(String)
        }
      });
    });
  });
});

describe('Data Processing', () => {
  describe('Array Processing', () => {
    test('should process perfume arrays correctly', () => {
      const perfumes = [
        { id: 1, name: 'Perfume 1', brand: 'Brand A' },
        { id: 2, name: 'Perfume 2', brand: 'Brand B' }
      ];

      const processedPerfumes = perfumes.map(validators.formatPerfumeResponse);
      
      expect(processedPerfumes).toHaveLength(2);
      expect(processedPerfumes[0]).toBeValidPerfume();
      expect(processedPerfumes[1]).toBeValidPerfume();
    });

    test('should filter out invalid perfumes', () => {
      const perfumes = [
        { id: 1, name: 'Valid Perfume', brand: 'Brand A' },
        null,
        { id: 2, name: 'Another Valid', brand: 'Brand B' },
        undefined
      ];

      const validPerfumes = perfumes
        .filter(p => p != null)
        .map(validators.formatPerfumeResponse);
      
      expect(validPerfumes).toHaveLength(2);
      expect(validPerfumes.every(p => p != null)).toBe(true);
    });
  });

  describe('String Processing', () => {
    test('should handle special characters in search', () => {
      const specialChars = "Chanel N°5";
      const sanitized = validators.sanitizeSearchQuery(specialChars);
      expect(sanitized).toBe("chanel n°5");
    });

    test('should handle Unicode characters', () => {
      const unicode = "Café Royal";
      const sanitized = validators.sanitizeSearchQuery(unicode);
      expect(sanitized).toBe("café royal");
    });
  });
});