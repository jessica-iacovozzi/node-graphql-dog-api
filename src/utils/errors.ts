import { GraphQLError } from 'graphql';

/**
 * Custom error types for domain-specific errors following Apollo error handling best practices
 * Allows for consistent error responses with appropriate status codes and extensions
 */

// Base class for all domain errors
export class DogApiError extends GraphQLError {
  constructor(message: string, code: string, status: number = 400) {
    super(message, {
      extensions: {
        code,
        http: { status },
      },
    });
    
    Object.defineProperty(this, 'name', { value: this.constructor.name });
  }
}

// Resource not found
export class NotFoundError extends DogApiError {
  constructor(resource: string, id: string) {
    super(
      `${resource} with ID '${id}' not found`,
      'RESOURCE_NOT_FOUND',
      404
    );
  }
}

// Validation error
export class ValidationError extends DogApiError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

// Authentication error
export class AuthenticationError extends DogApiError {
  constructor(message: string = 'Authentication required') {
    super(message, 'UNAUTHENTICATED', 401);
  }
}

// Authorization error
export class ForbiddenError extends DogApiError {
  constructor(message: string = 'Permission denied') {
    super(message, 'FORBIDDEN', 403);
  }
}

// Conflict error (e.g. duplicate entry)
export class ConflictError extends DogApiError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409);
  }
}

// Database error
export class DatabaseError extends DogApiError {
  constructor(message: string = 'Database error occurred') {
    super(message, 'DATABASE_ERROR', 500);
  }
}

// Format error for client consumption
export const formatError = (error: any) => {
  // Log error for debugging
  console.error('GraphQL Error:', error);
  
  // If it's already one of our custom errors, return it as is
  if (error.originalError instanceof DogApiError) {
    return error;
  }
  
  // Check for Prisma errors and convert them to our custom format
  if (error.originalError?.name === 'PrismaClientKnownRequestError') {
    const prismaError = error.originalError;
    
    // Handle common Prisma error codes
    if (prismaError.code === 'P2002') {
      return new ConflictError('A record with this value already exists');
    }
    
    if (prismaError.code === 'P2025') {
      return new NotFoundError('Record', 'unknown');
    }
    
    return new DatabaseError('Database operation failed');
  }
  
  // Return a sanitized error for unexpected errors
  if (error.extensions?.code === 'INTERNAL_SERVER_ERROR') {
    return new GraphQLError('Internal server error', {
      extensions: {
        code: 'INTERNAL_SERVER_ERROR',
        http: { status: 500 },
      },
    });
  }
  
  // For other errors, return as is but limit error details in production
  return process.env.NODE_ENV === 'production'
    ? { ...error, message: error.message }
    : error;
};
