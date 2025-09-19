// Test setup file
process.env.NODE_ENV = 'test';

// Set test environment variables
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'test-key';

// Extend Jest matchers
expect.extend({
  toBeValidPerfume(received) {
    const pass = received && 
                 typeof received.id === 'number' &&
                 typeof received.name === 'string' &&
                 typeof received.brand === 'string' &&
                 typeof received.reference === 'string';
    
    if (pass) {
      return {
        message: () => `expected ${JSON.stringify(received)} not to be a valid perfume`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${JSON.stringify(received)} to be a valid perfume with id, name, brand, and reference`,
        pass: false,
      };
    }
  },
});

// Global test timeout
jest.setTimeout(10000);