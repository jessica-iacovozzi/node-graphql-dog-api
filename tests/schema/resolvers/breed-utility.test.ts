import { breedResolvers } from '../../../src/schema/resolvers/breed';
import { BreedSortField, SortDirection } from '../../types';

// Mock Prisma client with controlled responses for all tests
const mockPrisma = {
  breed: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }
};

// No need for mockLoaders in this test file

describe('Breed Resolver Utility Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('buildFilters function (complete coverage)', () => {
    test('should handle empty or undefined filter', async () => {
      // Arrange
      mockPrisma.breed.findMany.mockResolvedValue([]);
      mockPrisma.breed.count.mockResolvedValue(0);

      // Act - call with no filter
      await breedResolvers.Query.breeds(null, {}, { prisma: mockPrisma as any });

      // Assert - empty where should be passed
      expect(mockPrisma.breed.findMany).toHaveBeenCalled();
      const findManyCall = mockPrisma.breed.findMany.mock.calls[0][0];
      expect(findManyCall.where).toEqual({});
    });

    test('should handle exact name filter', async () => {
      // Arrange
      mockPrisma.breed.findMany.mockResolvedValue([]);
      mockPrisma.breed.count.mockResolvedValue(0);

      // Act - call with exact name filter
      await breedResolvers.Query.breeds(null, {
        filter: { name: 'Golden Retriever' }
      }, { prisma: mockPrisma as any });

      // Assert - name filter should be passed directly
      expect(mockPrisma.breed.findMany).toHaveBeenCalled();
      const findManyCall = mockPrisma.breed.findMany.mock.calls[0][0];
      expect(findManyCall.where).toEqual({
        name: 'Golden Retriever'
      });
    });

    test('should handle all text filter options', async () => {
      // Arrange
      mockPrisma.breed.findMany.mockResolvedValue([]);
      mockPrisma.breed.count.mockResolvedValue(0);

      // Act - test with text filters
      await breedResolvers.Query.breeds(null, {
        filter: {
          nameContains: 'retriever',
          descriptionContains: 'friendly',
          historyContains: 'originated',
          originContains: 'scotland'
        }
      }, { prisma: mockPrisma as any });

      // Assert
      expect(mockPrisma.breed.findMany).toHaveBeenCalled();
      const findManyCall = mockPrisma.breed.findMany.mock.calls[0][0];
      
      // Check if all text filters were properly added
      expect(findManyCall.where).toEqual(expect.objectContaining({
        name: expect.objectContaining({
          contains: 'retriever',
          mode: 'insensitive'
        }),
        description: expect.objectContaining({
          contains: 'friendly',
          mode: 'insensitive'
        }),
        history: expect.objectContaining({
          contains: 'originated',
          mode: 'insensitive'
        }),
        origin: expect.objectContaining({
          contains: 'scotland',
          mode: 'insensitive'
        })
      }));
    });

    test('should handle category filters (single ID)', async () => {
      // Arrange
      mockPrisma.breed.findMany.mockResolvedValue([]);
      mockPrisma.breed.count.mockResolvedValue(0);

      // Act - test with categoryId
      await breedResolvers.Query.breeds(null, {
        filter: { categoryId: '123' }
      }, { prisma: mockPrisma as any });

      // Assert - categoryId should be set directly
      expect(mockPrisma.breed.findMany).toHaveBeenCalled();
      const findManyCall = mockPrisma.breed.findMany.mock.calls[0][0];
      expect(findManyCall.where).toEqual(expect.objectContaining({
        categoryId: '123'
      }));
    });

    test('should handle category filters (array of IDs)', async () => {
      // Arrange
      mockPrisma.breed.findMany.mockResolvedValue([]);
      mockPrisma.breed.count.mockResolvedValue(0);

      // Act - test with categoryIds array
      await breedResolvers.Query.breeds(null, {
        filter: { categoryIds: ['123', '456'] }
      }, { prisma: mockPrisma as any });

      // Assert - categoryId should use 'in' operator
      expect(mockPrisma.breed.findMany).toHaveBeenCalled();
      const findManyCall = mockPrisma.breed.findMany.mock.calls[0][0];
      expect(findManyCall.where).toEqual(expect.objectContaining({
        categoryId: { in: ['123', '456'] }
      }));
    });

    test('should handle colors array filter', async () => {
      // Arrange
      mockPrisma.breed.findMany.mockResolvedValue([]);
      mockPrisma.breed.count.mockResolvedValue(0);

      // Act - test with colors array
      await breedResolvers.Query.breeds(null, {
        filter: { colors: ['black', 'white'] }
      }, { prisma: mockPrisma as any });

      // Assert - colors filter should use array-some logic
      expect(mockPrisma.breed.findMany).toHaveBeenCalled();
      const findManyCall = mockPrisma.breed.findMany.mock.calls[0][0];
      expect(findManyCall.where).toEqual(expect.objectContaining({
        colors: { hasSome: ['black', 'white'] }
      }));
    });

    test('should handle min/max range filters', async () => {
      // Arrange
      mockPrisma.breed.findMany.mockResolvedValue([]);
      mockPrisma.breed.count.mockResolvedValue(0);

      // Act - test with min/max filters for one property
      await breedResolvers.Query.breeds(null, {
        filter: {
          minAverageHeight: 20,
          maxAverageHeight: 30
        }
      }, { prisma: mockPrisma as any });

      // Assert - range filter should be created
      expect(mockPrisma.breed.findMany).toHaveBeenCalled();
      const findManyCall = mockPrisma.breed.findMany.mock.calls[0][0];
      expect(findManyCall.where).toEqual(expect.objectContaining({
        averageHeight: { 
          gte: 20,
          lte: 30
        }
      }));
    });

    test('should handle min-only filters', async () => {
      // Arrange
      mockPrisma.breed.findMany.mockResolvedValue([]);
      mockPrisma.breed.count.mockResolvedValue(0);

      // Act - test with only min filters
      await breedResolvers.Query.breeds(null, {
        filter: {
          minAverageWeight: 10,
          minAverageLifeExpectancy: 8
        }
      }, { prisma: mockPrisma as any });

      // Assert - min-only filters should be created
      expect(mockPrisma.breed.findMany).toHaveBeenCalled();
      const findManyCall = mockPrisma.breed.findMany.mock.calls[0][0];
      expect(findManyCall.where).toEqual(expect.objectContaining({
        averageWeight: { gte: 10 },
        averageLifeExpectancy: { gte: 8 }
      }));
    });

    test('should handle max-only filters', async () => {
      // Arrange
      mockPrisma.breed.findMany.mockResolvedValue([]);
      mockPrisma.breed.count.mockResolvedValue(0);

      // Act - test with only max filters
      await breedResolvers.Query.breeds(null, {
        filter: {
          maxAverageWeight: 50,
          maxAverageLifeExpectancy: 15
        }
      }, { prisma: mockPrisma as any });

      // Assert - max-only filters should be created
      expect(mockPrisma.breed.findMany).toHaveBeenCalled();
      const findManyCall = mockPrisma.breed.findMany.mock.calls[0][0];
      expect(findManyCall.where).toEqual(expect.objectContaining({
        averageWeight: { lte: 50 },
        averageLifeExpectancy: { lte: 15 }
      }));
    });

    test('should handle all numeric rating filters', async () => {
      // Arrange
      mockPrisma.breed.findMany.mockResolvedValue([]);
      mockPrisma.breed.count.mockResolvedValue(0);

      // Act - test with all rating filters
      await breedResolvers.Query.breeds(null, {
        filter: {
          minExerciseRequired: 2,
          maxExerciseRequired: 4,
          minEaseOfTraining: 3,
          maxEaseOfTraining: 5,
          minAffection: 3,
          maxAffection: 5,
          minPlayfulness: 2,
          maxPlayfulness: 5,
          minGoodWithChildren: 3,
          maxGoodWithChildren: 5,
          minGoodWithDogs: 3,
          maxGoodWithDogs: 5,
          minGroomingRequired: 1,
          maxGroomingRequired: 3
        }
      }, { prisma: mockPrisma as any });

      // Assert - all rating filters should be created
      expect(mockPrisma.breed.findMany).toHaveBeenCalled();
      const findManyCall = mockPrisma.breed.findMany.mock.calls[0][0];
      
      expect(findManyCall.where).toEqual(expect.objectContaining({
        exerciseRequired: { gte: 2, lte: 4 },
        easeOfTraining: { gte: 3, lte: 5 },
        affection: { gte: 3, lte: 5 },
        playfulness: { gte: 2, lte: 5 },
        goodWithChildren: { gte: 3, lte: 5 },
        goodWithDogs: { gte: 3, lte: 5 },
        groomingRequired: { gte: 1, lte: 3 }
      }));
    });

    test('should combine multiple filter types', async () => {
      // Arrange
      mockPrisma.breed.findMany.mockResolvedValue([]);
      mockPrisma.breed.count.mockResolvedValue(0);

      // Act - test with combined filters
      await breedResolvers.Query.breeds(null, {
        filter: {
          nameContains: 'retriever',
          minAverageWeight: 20,
          maxAverageWeight: 40,
          colors: ['golden', 'cream'],
          categoryId: '123'
        }
      }, { prisma: mockPrisma as any });

      // Assert - combined filters should be created
      expect(mockPrisma.breed.findMany).toHaveBeenCalled();
      const findManyCall = mockPrisma.breed.findMany.mock.calls[0][0];
      
      expect(findManyCall.where).toEqual(expect.objectContaining({
        name: expect.objectContaining({
          contains: 'retriever',
          mode: 'insensitive'
        }),
        averageWeight: { gte: 20, lte: 40 },
        colors: { hasSome: ['golden', 'cream'] },
        categoryId: '123'
      }));
    });
  });

  describe('sorting options', () => {
    test('should use default sort when not provided', async () => {
      // Arrange
      mockPrisma.breed.findMany.mockResolvedValue([]);
      mockPrisma.breed.count.mockResolvedValue(0);

      // Act - call without sort
      await breedResolvers.Query.breeds(null, {}, { prisma: mockPrisma as any });

      // Assert - default sort by name should be used
      expect(mockPrisma.breed.findMany).toHaveBeenCalled();
      const findManyCall = mockPrisma.breed.findMany.mock.calls[0][0];
      expect(findManyCall.orderBy).toEqual({ name: 'asc' });
    });

    test('should handle sort by name field', async () => {
      // Arrange
      mockPrisma.breed.findMany.mockResolvedValue([]);
      mockPrisma.breed.count.mockResolvedValue(0);

      // Act - call with name sort
      await breedResolvers.Query.breeds(null, {
        sort: { field: BreedSortField.NAME, direction: SortDirection.DESC }
      }, { prisma: mockPrisma as any });

      // Assert - name sort with desc direction should be used
      expect(mockPrisma.breed.findMany).toHaveBeenCalled();
      const findManyCall = mockPrisma.breed.findMany.mock.calls[0][0];
      expect(findManyCall.orderBy).toEqual({ name: 'desc' });
    });

    test('should use default direction when not provided', async () => {
      // Arrange
      mockPrisma.breed.findMany.mockResolvedValue([]);
      mockPrisma.breed.count.mockResolvedValue(0);

      // Act - call with sort but no direction
      await breedResolvers.Query.breeds(null, {
        sort: { field: BreedSortField.NAME }
      }, { prisma: mockPrisma as any });

      // Assert - default direction (asc) should be used
      expect(mockPrisma.breed.findMany).toHaveBeenCalled();
      const findManyCall = mockPrisma.breed.findMany.mock.calls[0][0];
      expect(findManyCall.orderBy).toEqual({ name: 'asc' });
    });

    test('should handle all sort field options', async () => {
      // Test each sort field individually
      const sortFieldMappings = [
        { field: BreedSortField.AVERAGE_HEIGHT, dbField: 'averageHeight' },
        { field: BreedSortField.AVERAGE_WEIGHT, dbField: 'averageWeight' },
        { field: BreedSortField.AVERAGE_LIFE_EXPECTANCY, dbField: 'averageLifeExpectancy' },
        { field: BreedSortField.EXERCISE_REQUIRED, dbField: 'exerciseRequired' },
        { field: BreedSortField.EASE_OF_TRAINING, dbField: 'easeOfTraining' },
        { field: BreedSortField.AFFECTION, dbField: 'affection' },
        { field: BreedSortField.PLAYFULNESS, dbField: 'playfulness' },
        { field: BreedSortField.GOOD_WITH_CHILDREN, dbField: 'goodWithChildren' },
        { field: BreedSortField.GOOD_WITH_DOGS, dbField: 'goodWithDogs' },
        { field: BreedSortField.GROOMING_REQUIRED, dbField: 'groomingRequired' },
        { field: BreedSortField.CATEGORY_ID, dbField: 'categoryId' }
      ];

      for (const { field, dbField } of sortFieldMappings) {
        // Reset mocks for each iteration
        jest.clearAllMocks();
        mockPrisma.breed.findMany.mockResolvedValue([]);
        mockPrisma.breed.count.mockResolvedValue(0);

        // Act - test with current sort field
        await breedResolvers.Query.breeds(null, {
          sort: { field, direction: SortDirection.DESC }
        }, { prisma: mockPrisma as any });

        // Assert - correct db field should be used
        expect(mockPrisma.breed.findMany).toHaveBeenCalled();
        const findManyCall = mockPrisma.breed.findMany.mock.calls[0][0];
        expect(findManyCall.orderBy).toEqual({ [dbField]: 'desc' });
      }
    });
  });

  describe('pagination scenarios', () => {
    test('should use default pagination when not provided', async () => {
      // Arrange
      mockPrisma.breed.findMany.mockResolvedValue([]);
      mockPrisma.breed.count.mockResolvedValue(0);

      // Act - call without pagination
      await breedResolvers.Query.breeds(null, {}, { prisma: mockPrisma as any });

      // Assert - default take value (10) should be used
      expect(mockPrisma.breed.findMany).toHaveBeenCalled();
      const findManyCall = mockPrisma.breed.findMany.mock.calls[0][0];
      expect(findManyCall.take).toBe(10);
      expect(findManyCall.cursor).toBeUndefined();
      expect(findManyCall.skip).toBeUndefined();
    });

    test('should handle forward pagination (after cursor)', async () => {
      // Arrange
      const breeds = [
        { id: '2', name: 'Breed 2' },
        { id: '3', name: 'Breed 3' }
      ];
      mockPrisma.breed.findMany.mockResolvedValue(breeds);
      mockPrisma.breed.count.mockResolvedValue(5);

      const after = Buffer.from('1').toString('base64');

      // Act - call with forward pagination
      const result = await breedResolvers.Query.breeds(null, {
        pagination: { after, first: 2 }
      }, { prisma: mockPrisma as any });

      // Assert - cursor should be decoded and used
      expect(mockPrisma.breed.findMany).toHaveBeenCalled();
      const findManyCall = mockPrisma.breed.findMany.mock.calls[0][0];
      expect(findManyCall.cursor).toEqual({ id: '1' });
      expect(findManyCall.skip).toBe(1);
      expect(findManyCall.take).toBe(2);
      
      // Check pagination info in result
      expect(result.totalCount).toBe(5);
      expect(result.pageInfo).toBeDefined();
      expect(result.edges.length).toBe(2);
    });

    test('should handle backward pagination (before cursor)', async () => {
      // Arrange
      const breeds = [
        { id: '3', name: 'Breed 3' },
        { id: '4', name: 'Breed 4' }
      ];
      mockPrisma.breed.findMany.mockResolvedValue(breeds);
      mockPrisma.breed.count.mockResolvedValue(5);

      const before = Buffer.from('5').toString('base64');

      // Act - call with backward pagination
      const result = await breedResolvers.Query.breeds(null, {
        pagination: { before, last: 2 }
      }, { prisma: mockPrisma as any });

      // Assert - cursor and negative take should be used
      expect(mockPrisma.breed.findMany).toHaveBeenCalled();
      const findManyCall = mockPrisma.breed.findMany.mock.calls[0][0];
      expect(findManyCall.cursor).toEqual({ id: '5' });
      expect(findManyCall.skip).toBe(1);
      expect(findManyCall.take).toBe(-2); // Negative for backward pagination
      
      // Check pagination info in result
      expect(result.totalCount).toBe(5);
      expect(result.edges.length).toBe(2);
    });

    test('should apply correct cursor-based pagination with hasNextPage/hasPreviousPage', async () => {
      // Arrange
      const breeds = [
        { id: '1', name: 'Breed 1' },
        { id: '2', name: 'Breed 2' }
      ];
      mockPrisma.breed.findMany.mockResolvedValue(breeds);
      mockPrisma.breed.count.mockResolvedValue(5);
      
      // Act - test with pagination that should have next page
      const result = await breedResolvers.Query.breeds(null, {
        pagination: { first: 2 }
      }, { prisma: mockPrisma as any });
      
      // Assert
      expect(result.edges.length).toBe(2);
      expect(result.pageInfo.hasNextPage).toBe(true);
      expect(result.pageInfo.hasPreviousPage).toBe(false);
      // Verify cursors exist rather than checking exact format which may vary
      expect(result.pageInfo.startCursor).toBeTruthy();
      expect(result.pageInfo.endCursor).toBeTruthy();
    });

    test('should properly handle edge cases with pagination limits', async () => {
      // Arrange - setup case where all items fit on one page
      const breeds = [
        { id: '1', name: 'Breed 1' },
        { id: '2', name: 'Breed 2' }
      ];
      mockPrisma.breed.findMany.mockResolvedValue(breeds);
      mockPrisma.breed.count.mockResolvedValue(2); // Total is exactly what we're showing
      
      // Act
      const result = await breedResolvers.Query.breeds(null, {
        pagination: { first: 5 } // Request more than exists
      }, { prisma: mockPrisma as any });
      
      // Assert - hasNextPage should be false since we have all items
      expect(result.edges.length).toBe(2);
      expect(result.pageInfo.hasNextPage).toBe(false);
      expect(result.pageInfo.hasPreviousPage).toBe(false);
    });
  });
});
