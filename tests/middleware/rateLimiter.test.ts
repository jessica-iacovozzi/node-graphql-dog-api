import type { Request, Response } from 'express';

// Mock express-rate-limit
jest.mock('express-rate-limit', () => {
  return jest.fn().mockImplementation((options) => {
    // Return a mock middleware function that calls the handler for certain IPs
    return jest.fn().mockImplementation((req, res, next) => {
      if (options.keyGenerator && req.ip === 'rate-limited-ip') {
        options.handler(req, res, null);
        return;
      }
      if (next) next();
    });
  });
});

// Mock Redis modules
jest.mock('@redis/client', () => ({
  createClient: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
    sendCommand: jest.fn()
  }))
}));

jest.mock('rate-limit-redis', () => ({
  RedisStore: jest.fn().mockImplementation(() => ({}))
}));

// Get the mocked express-rate-limit
const mockRateLimiter = jest.requireMock('express-rate-limit');

// Import the actual rate limiter implementation (after mocks)
const { 
  createRateLimiter, 
  apiLimiter,
  mutationLimiter,
  queryLimiter 
} = jest.requireActual('../../src/middleware/rateLimiter');

describe('Rate Limiter Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      ip: '127.0.0.1'
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    mockRateLimiter.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createRateLimiter', () => {
    test('should create a rate limiter with default config', () => {
      const limiter = createRateLimiter();
      expect(limiter).toBeDefined();
      expect(mockRateLimiter).toHaveBeenCalled();
    });

    test('should create a rate limiter with custom config', () => {
      const customConfig = {
        windowMs: 1000,
        max: 5,
        message: 'Custom limit message'
      };
      
      const limiter = createRateLimiter(customConfig);
      expect(limiter).toBeDefined();
      
      const mockOptions = mockRateLimiter.mock.calls[0][0];
      expect(mockOptions.max).toBe(5);
      expect(mockOptions.windowMs).toBe(1000);
      expect(mockOptions.message).toBe('Custom limit message');
    });

    test('should use key generator to get unique identifier', () => {
      createRateLimiter();
      
      const mockOptions = mockRateLimiter.mock.calls[0][0];
      const keyGeneratorFn = mockOptions.keyGenerator;
      
      // Test with regular IP
      const key = keyGeneratorFn(mockRequest as Request);
      expect(key).toBe('127.0.0.1');
      
      // Test with undefined IP
      const reqWithNoIp = { ...mockRequest, ip: undefined };
      const fallbackKey = keyGeneratorFn(reqWithNoIp as Request);
      expect(fallbackKey).toBe('unknown-ip');
    });
    
    test('should handle rate limited requests', () => {
      const limiter = createRateLimiter();
      
      // Set a request IP that will trigger rate limiting
      const limitedReq = { ...mockRequest, ip: 'rate-limited-ip' };
      
      // Call the middleware
      limiter(limitedReq as Request, mockResponse as Response, mockNext);
      
      // Next should not be called
      expect(mockNext).not.toHaveBeenCalled();
      
      // Response should have correct status and format
      expect(mockResponse.status).toHaveBeenCalledWith(429);
      expect(mockResponse.json).toHaveBeenCalled();
    });
    
    test('should call next for non-limited requests', () => {
      const limiter = createRateLimiter();
      limiter(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Predefined limiters', () => {
    test('apiLimiter should be defined and be a function', () => {
      expect(apiLimiter).toBeDefined();
      expect(typeof apiLimiter).toBe('function');
    });
    
    test('mutationLimiter and queryLimiter should be different instances', () => {
      expect(mutationLimiter).toBeDefined();
      expect(queryLimiter).toBeDefined();
      expect(mutationLimiter).not.toBe(queryLimiter);
    });
  });
});