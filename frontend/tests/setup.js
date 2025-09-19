// Frontend test setup
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock IntersectionObserver for image loading tests
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }

  observe(target) {
    // Immediately trigger the callback with a mock entry
    this.callback([{
      isIntersecting: true,
      target: target
    }]);
  }

  unobserve() {}
  disconnect() {}
};

// Mock fetch for API tests
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([
      {
        id: 1,
        name: 'Test Perfume',
        brand: 'Test Brand',
        reference: 'TEST001',
        gender: 'homme',
        photo_url: 'test.jpg'
      }
    ]),
  })
);

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock URL constructor properly
class MockURL {
  constructor(url, base) {
    this.href = url;
    this.searchParams = new MockURLSearchParams();
  }
}

class MockURLSearchParams {
  constructor() {
    this.params = new Map();
  }

  append(key, value) {
    this.params.set(key, value);
  }

  toString() {
    const pairs = [];
    for (const [key, value] of this.params) {
      pairs.push(`${key}=${value}`);
    }
    return pairs.join('&');
  }
}

global.URL = MockURL;
global.URLSearchParams = MockURLSearchParams;

// Custom matchers
expect.extend({
  toBeValidPerfumeElement(received) {
    const hasClass = received.classList && received.classList.contains('perfume-card');
    const hasName = received.querySelector('.perfume-name') !== null;
    const hasBrand = received.querySelector('.perfume-brand') !== null;
    
    const pass = hasClass && hasName && hasBrand;
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid perfume element`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid perfume element with perfume-card class, perfume-name, and perfume-brand`,
        pass: false,
      };
    }
  },
});

// Set test timeout
jest.setTimeout(5000);