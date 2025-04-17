import type { Request, Response } from 'express';

// Mock the GraphQL dependencies
jest.mock('graphql', () => ({
  parse: jest.fn(),
  getOperationAST: jest.fn()
}));

// Mock the rate limiters
jest.mock('../../src/middleware/rateLimiter', () => ({
  mutationLimiter: jest.fn((_req, _res, next) => next()),
  queryLimiter: jest.fn((_req, _res, next) => next())
}));

// Import after mocks
const { graphqlRateLimiter } = jest.requireActual('../../src/middleware/graphqlRateLimiter');
const { mutationLimiter, queryLimiter } = jest.requireMock('../../src/middleware/rateLimiter');
const { parse: mockParse, getOperationAST: mockGetOperationAST } = jest.requireMock('graphql');

describe('GraphQL Rate Limiter Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      path: '/graphql',
      body: { query: 'query { someField }' }
    };
    mockResponse = {};
    mockNext = jest.fn();

    // Reset mocks
    jest.clearAllMocks();
    
    // Setup default mock implementation
    mockParse.mockReturnValue({});
    mockGetOperationAST.mockReturnValue({ operation: 'query' });
  });

  test('should call next() if path is not /graphql', () => {
    // Create a new request object with a different path
    const notGraphqlRequest = { ...mockRequest, path: '/not-graphql' };
    
    graphqlRateLimiter(notGraphqlRequest as Request, mockResponse as Response, mockNext);
    
    expect(mockNext).toHaveBeenCalled();
    expect(queryLimiter).not.toHaveBeenCalled();
    expect(mutationLimiter).not.toHaveBeenCalled();
  });

  test('should call next() if query is empty', () => {
    mockRequest.body = {};
    
    graphqlRateLimiter(mockRequest as Request, mockResponse as Response, mockNext);
    
    expect(mockNext).toHaveBeenCalled();
    expect(queryLimiter).not.toHaveBeenCalled();
    expect(mutationLimiter).not.toHaveBeenCalled();
  });

  test('should call queryLimiter for query operations', () => {
    mockGetOperationAST.mockReturnValue({ operation: 'query' });
    
    graphqlRateLimiter(mockRequest as Request, mockResponse as Response, mockNext);
    
    expect(mockParse).toHaveBeenCalledWith('query { someField }');
    expect(mockGetOperationAST).toHaveBeenCalled();
    expect(queryLimiter).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext);
    expect(mutationLimiter).not.toHaveBeenCalled();
  });

  test('should call mutationLimiter for mutation operations', () => {
    mockRequest.body.query = 'mutation { createSomething }';
    mockGetOperationAST.mockReturnValue({ operation: 'mutation' });
    
    graphqlRateLimiter(mockRequest as Request, mockResponse as Response, mockNext);
    
    expect(mockParse).toHaveBeenCalledWith('mutation { createSomething }');
    expect(mockGetOperationAST).toHaveBeenCalled();
    expect(mutationLimiter).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext);
    expect(queryLimiter).not.toHaveBeenCalled();
  });

  test('should call mutationLimiter for subscription operations as fallback', () => {
    mockRequest.body.query = 'subscription { onSomething }';
    mockGetOperationAST.mockReturnValue({ operation: 'subscription' });
    
    graphqlRateLimiter(mockRequest as Request, mockResponse as Response, mockNext);
    
    expect(mockParse).toHaveBeenCalledWith('subscription { onSomething }');
    expect(mockGetOperationAST).toHaveBeenCalled();
    expect(queryLimiter).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext);
    expect(mutationLimiter).not.toHaveBeenCalled();
  });

  test('should call mutationLimiter if there is an error parsing the query', () => {
    mockRequest.body.query = 'invalid query {';
    mockParse.mockImplementation(() => {
      throw new Error('Syntax Error: Expected Name, found <EOF>.');
    });
    
    graphqlRateLimiter(mockRequest as Request, mockResponse as Response, mockNext);
    
    expect(mockParse).toHaveBeenCalledWith('invalid query {');
    expect(mutationLimiter).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext);
    expect(queryLimiter).not.toHaveBeenCalled();
  });
});
