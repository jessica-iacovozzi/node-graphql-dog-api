import { breedResolvers } from '../../../src/schema/resolvers/breed';
import { categoryResolvers } from '../../../src/schema/resolvers/category';

// Mock Prisma client with controlled error responses
const mockPrisma = {
  breed: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  category: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

describe('Error Handling in Resolvers', () => {
  describe('Breed Resolvers Error Handling', () => {
    test('breed query should return null when breed not found', async () => {
      // Arrange
      const breedId = 'non-existent-id';
      mockPrisma.breed.findUnique.mockResolvedValue(null);

      // Act
      const result = await breedResolvers.Query.breed(
        null, 
        { id: breedId }, 
        { prisma: mockPrisma as any }
      );

      // Assert
      expect(result).toBeNull();
      expect(mockPrisma.breed.findUnique).toHaveBeenCalledWith({
        where: { id: breedId }
      });
    });

    test('createBreed with invalid data should forward Prisma error', async () => {
      // Arrange
      const input = {
        name: 'Test Breed',
        categoryId: 'non-existent-category',
        description: 'Test breed description',
        history: 'Test breed history',
        health: 'Test breed health information',
        origin: 'Test country of origin',
        colors: ['brown', 'white'],
        averageHeight: 22,
        averageWeight: 30,
        averageLifeExpectancy: 13,
        exerciseRequired: 3,
        easeOfTraining: 4,
        affection: 4,
        playfulness: 3,
        goodWithChildren: 5,
        goodWithDogs: 4,
        groomingRequired: 2
      };
      
      // Mock Prisma to throw a foreign key constraint error
      const prismaError = new Error('Foreign key constraint failed on the field: `categoryId`') as any;
      prismaError.code = 'P2003';
      prismaError.name = 'PrismaClientKnownRequestError';
      prismaError.meta = { field_name: 'categoryId' };
      
      mockPrisma.breed.create.mockRejectedValue(prismaError);

      // Act & Assert
      await expect(
        breedResolvers.Mutation.createBreed(null, { input }, { prisma: mockPrisma as any })
      ).rejects.toThrow();
      
      // Verify the create was attempted
      expect(mockPrisma.breed.create).toHaveBeenCalled();
    });

    test('updateBreed should forward Prisma error when breed does not exist', async () => {
      // Arrange
      const id = 'non-existent-id';
      const input = { name: 'Updated Breed Name' };
      
      // Mock Prisma to throw a record not found error
      const prismaError = new Error('Record to update not found.') as any;
      prismaError.code = 'P2025';
      prismaError.name = 'PrismaClientKnownRequestError';
      
      mockPrisma.breed.update.mockRejectedValue(prismaError);

      // Act & Assert
      await expect(
        breedResolvers.Mutation.updateBreed(null, { id, input }, { prisma: mockPrisma as any })
      ).rejects.toThrow();
    });

    test('deleteBreed should forward Prisma error when breed does not exist', async () => {
      // Arrange
      const breedId = 'non-existent-id';
      
      // Mock delete to throw Prisma's RecordNotFound error
      const prismaError = new Error('Record to delete not found.') as any;
      prismaError.code = 'P2025';
      prismaError.name = 'PrismaClientKnownRequestError';
      
      mockPrisma.breed.delete.mockRejectedValue(prismaError);

      // Act & Assert
      await expect(
        breedResolvers.Mutation.deleteBreed(null, { id: breedId }, { prisma: mockPrisma as any })
      ).rejects.toThrow();
    });

    test('breeds query should handle database errors gracefully', async () => {
      // Arrange
      mockPrisma.breed.findMany.mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      await expect(
        breedResolvers.Query.breeds(null, {}, { prisma: mockPrisma as any })
      ).rejects.toThrow();
    });
  });

  describe('Category Resolvers Error Handling', () => {
    test('category query should return null when category not found', async () => {
      // Arrange
      const categoryId = 'non-existent-id';
      mockPrisma.category.findUnique.mockResolvedValue(null);

      // Act
      const result = await categoryResolvers.Query.category(
        null, 
        { id: categoryId }, 
        { prisma: mockPrisma as any }
      );

      // Assert
      expect(result).toBeNull();
      expect(mockPrisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: categoryId }
      });
    });

    test('createCategory should forward Prisma validation errors', async () => {
      // Arrange
      const input = {
        name: '', // Empty name might trigger a validation error
      };
      
      // Mock Prisma to throw a validation error
      const prismaError = new Error('Invalid value for field `name`') as any;
      prismaError.code = 'P2000'; // Value too long error code
      prismaError.name = 'PrismaClientKnownRequestError';
      
      mockPrisma.category.create.mockRejectedValue(prismaError);

      // Act & Assert
      await expect(
        categoryResolvers.Mutation.createCategory(null, { input }, { prisma: mockPrisma as any })
      ).rejects.toThrow();
    });

    test('updateCategory should forward Prisma error when category does not exist', async () => {
      // Arrange
      const id = 'non-existent-id';
      const input = { name: 'Updated Category Name' };
      
      // Mock Prisma to throw a record not found error
      const prismaError = new Error('Record to update not found.') as any;
      prismaError.code = 'P2025';
      prismaError.name = 'PrismaClientKnownRequestError';
      
      mockPrisma.category.update.mockRejectedValue(prismaError);

      // Act & Assert
      await expect(
        categoryResolvers.Mutation.updateCategory(null, { id, input }, { prisma: mockPrisma as any })
      ).rejects.toThrow();
    });

    test('deleteCategory with foreign key constraints should forward Prisma error', async () => {
      // Arrange
      const categoryId = 'category-with-breeds';
      
      // Mock Prisma to throw a foreign key constraint error
      const prismaError = new Error('Foreign key constraint failed') as any;
      prismaError.code = 'P2003';
      prismaError.name = 'PrismaClientKnownRequestError';
      prismaError.meta = { field_name: 'Breed_categoryId_fkey (index)' };
      
      mockPrisma.category.delete.mockRejectedValue(prismaError);

      // Act & Assert
      await expect(
        categoryResolvers.Mutation.deleteCategory(null, { id: categoryId }, { prisma: mockPrisma as any })
      ).rejects.toThrow();
    });

    test('categories query should handle database errors gracefully', async () => {
      // Arrange
      mockPrisma.category.findMany.mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      await expect(
        categoryResolvers.Query.categories(null, {}, { prisma: mockPrisma as any })
      ).rejects.toThrow();
    });
  });

  describe('Common Error Patterns', () => {
    test('should handle transaction failures', async () => {
      // Arrange
      const input = {
        name: 'Test Breed',
        categoryId: 'valid-category-id',
        description: 'Test breed description',
        history: 'Test breed history',
        health: 'Test breed health information',
        origin: 'Test country of origin',
        colors: ['brown', 'white'],
        averageHeight: 22,
        averageWeight: 30,
        averageLifeExpectancy: 13,
        exerciseRequired: 3,
        easeOfTraining: 4,
        affection: 4,
        playfulness: 3,
        goodWithChildren: 5,
        goodWithDogs: 4,
        groomingRequired: 2
      };
      
      // Mock transaction error
      const prismaError = new Error('Transaction failed') as any;
      prismaError.code = 'P2034';
      prismaError.name = 'PrismaClientKnownRequestError';
      
      mockPrisma.breed.create.mockRejectedValue(prismaError);

      // Act & Assert
      await expect(
        breedResolvers.Mutation.createBreed(null, { input }, { prisma: mockPrisma as any })
      ).rejects.toThrow();
    });

    test('should handle Prisma unique constraint violations', async () => {
      // Arrange
      const input = {
        name: 'Duplicate Breed',
        categoryId: 'valid-category-id',
        description: 'Test breed description',
        history: 'Test breed history',
        health: 'Test breed health information',
        origin: 'Test country of origin',
        colors: ['brown', 'white'],
        averageHeight: 22,
        averageWeight: 30,
        averageLifeExpectancy: 13,
        exerciseRequired: 3,
        easeOfTraining: 4,
        affection: 4,
        playfulness: 3,
        goodWithChildren: 5,
        goodWithDogs: 4,
        groomingRequired: 2
      };
      
      // Mock unique constraint violation with proper Prisma error structure
      const prismaError = new Error('Unique constraint failed on the field: `name`') as any;
      prismaError.code = 'P2002';
      prismaError.name = 'PrismaClientKnownRequestError';
      prismaError.meta = { target: ['name'] };
      
      mockPrisma.breed.create.mockRejectedValue(prismaError);

      // Act & Assert
      await expect(
        breedResolvers.Mutation.createBreed(null, { input }, { prisma: mockPrisma as any })
      ).rejects.toThrow();
    });
    
    test('breeds query should handle undefined sorting parameters', async () => {
      // Arrange - calling with undefined sort parameter
      mockPrisma.breed.count.mockResolvedValue(10);
      mockPrisma.breed.findMany.mockResolvedValue([]);

      // Act - should not throw error with undefined parameters
      const result = await breedResolvers.Query.breeds(null, { sort: undefined }, { prisma: mockPrisma as any });

      // Assert - should return a valid connection
      expect(result).toHaveProperty('edges');
      expect(result).toHaveProperty('pageInfo');
      expect(result).toHaveProperty('totalCount');
    });
  });
});
