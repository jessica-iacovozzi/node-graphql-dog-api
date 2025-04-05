import { breedResolvers } from '../../../src/schema/resolvers/breed';
import { DataLoaders } from '../../../src/utils/dataLoaders';
import { BreedSortField, SortDirection } from '../../types';

// Mock Prisma client
const mockPrisma = {
  breed: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  category: {
    findUnique: jest.fn(),
  },
};

// Mock DataLoaders
const mockLoaders = {
  categoryLoader: {
    load: jest.fn(),
    loadMany: jest.fn(),
    clear: jest.fn(),
    clearAll: jest.fn(),
    prime: jest.fn(),
    name: 'categoryLoader'
  },
  breedsByCategoryLoader: {
    load: jest.fn(),
    loadMany: jest.fn(),
    clear: jest.fn(),
    clearAll: jest.fn(),
    prime: jest.fn(),
    name: 'breedsByCategoryLoader'
  },
  breedLoader: {
    load: jest.fn(),
    loadMany: jest.fn(),
    clear: jest.fn(),
    clearAll: jest.fn(),
    prime: jest.fn(),
    name: 'breedLoader'
  },
} as unknown as DataLoaders;

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

describe('Breed Resolvers', () => {
  describe('Query', () => {
    describe('breeds', () => {
      test('should return all breeds with default pagination', async () => {
        // Arrange
        const mockBreeds = [
          { id: '1', name: 'Border Collie', categoryId: '1' },
          { id: '2', name: 'German Shepherd', categoryId: '1' },
        ];
        const mockTotalCount = 2;
        mockPrisma.breed.findMany.mockResolvedValue(mockBreeds);
        mockPrisma.breed.count.mockResolvedValue(mockTotalCount);

        // Act
        const result = await breedResolvers.Query.breeds(
          null,
          {},
          { prisma: mockPrisma as any }
        );

        // Assert
        expect(mockPrisma.breed.findMany).toHaveBeenCalledWith({
          where: {},
          orderBy: { name: 'asc' },
          cursor: undefined,
          skip: undefined,
          take: 10,
        });
        expect(mockPrisma.breed.count).toHaveBeenCalledWith({ where: {} });
        
        // Check connection structure
        expect(result).toHaveProperty('edges');
        expect(result).toHaveProperty('pageInfo');
        expect(result).toHaveProperty('totalCount', mockTotalCount);
        
        // Check edges
        expect(result.edges).toHaveLength(2);
        expect(result.edges[0].node).toEqual(mockBreeds[0]);
        expect(result.edges[0].cursor).toBeTruthy();
        
        // Check pageInfo
        expect(result.pageInfo).toHaveProperty('hasNextPage');
        expect(result.pageInfo).toHaveProperty('hasPreviousPage');
        expect(result.pageInfo).toHaveProperty('startCursor');
        expect(result.pageInfo).toHaveProperty('endCursor');
      });

      test('should apply filters when provided', async () => {
        // Arrange
        const mockBreeds = [
          { id: '1', name: 'Border Collie', categoryId: '1' },
        ];
        mockPrisma.breed.findMany.mockResolvedValue(mockBreeds);
        mockPrisma.breed.count.mockResolvedValue(1);
        
        const filter = {
          nameContains: 'Collie',
          categoryId: '1',
          minPlayfulness: 3,
          maxGroomingRequired: 4,
        };

        // Act
        const result = await breedResolvers.Query.breeds(
          null,
          { filter },
          { prisma: mockPrisma as any }
        );

        // Verify the result is a valid connection
        expect(result).toHaveProperty('edges');
        expect(result).toHaveProperty('pageInfo');

        // Assert
        expect(mockPrisma.breed.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              name: expect.objectContaining({
                contains: 'Collie',
                mode: 'insensitive',
              }),
              categoryId: '1',
              playfulness: expect.objectContaining({
                gte: 3,
              }),
              groomingRequired: expect.objectContaining({
                lte: 4,
              }),
            }),
          })
        );
      });

      test('should apply sorting when provided', async () => {
        // Arrange
        const mockBreeds = [
          { id: '1', name: 'Border Collie', averageWeight: 20 },
          { id: '2', name: 'German Shepherd', averageWeight: 35 },
        ];
        mockPrisma.breed.findMany.mockResolvedValue(mockBreeds);
        mockPrisma.breed.count.mockResolvedValue(2);
        
        const sort = {
          field: BreedSortField.AVERAGE_WEIGHT,
          direction: SortDirection.DESC,
        };

        // Act
        const result = await breedResolvers.Query.breeds(
          null,
          { sort },
          { prisma: mockPrisma as any }
        );

        // Verify the result is a valid connection
        expect(result).toHaveProperty('edges');
        expect(result).toHaveProperty('pageInfo');

        // Assert
        expect(mockPrisma.breed.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            orderBy: { averageWeight: 'desc' },
          })
        );
      });

      test('should apply forward pagination when provided', async () => {
        // Arrange
        const mockBreeds = [
          { id: '2', name: 'German Shepherd' },
        ];
        mockPrisma.breed.findMany.mockResolvedValue(mockBreeds);
        mockPrisma.breed.count.mockResolvedValue(5);
        
        const pagination = {
          first: 1,
          after: Buffer.from('1').toString('base64'),
        };

        // Act
        const result = await breedResolvers.Query.breeds(
          null,
          { pagination },
          { prisma: mockPrisma as any }
        );

        // Verify the result is a valid connection
        expect(result).toHaveProperty('edges');
        expect(result).toHaveProperty('pageInfo');
        expect(result.pageInfo).toHaveProperty('hasNextPage');
        expect(result.pageInfo).toHaveProperty('hasPreviousPage');

        // Assert
        expect(mockPrisma.breed.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            cursor: { id: '1' },
            skip: 1,
            take: 1,
          })
        );
      });

      test('should apply backward pagination when provided', async () => {
        // Arrange
        const mockBreeds = [
          { id: '1', name: 'Border Collie' },
        ];
        mockPrisma.breed.findMany.mockResolvedValue(mockBreeds);
        mockPrisma.breed.count.mockResolvedValue(5);
        
        const pagination = {
          last: 1,
          before: Buffer.from('2').toString('base64'),
        };

        // Act
        const result = await breedResolvers.Query.breeds(
          null,
          { pagination },
          { prisma: mockPrisma as any }
        );

        // Verify the result is a valid connection
        expect(result).toHaveProperty('edges');
        expect(result).toHaveProperty('pageInfo');
        expect(result.pageInfo).toHaveProperty('hasNextPage');
        expect(result.pageInfo).toHaveProperty('hasPreviousPage');

        // Assert
        expect(mockPrisma.breed.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            cursor: { id: '2' },
            skip: 1,
            take: -1,
          })
        );
      });
    });
    
    test('breed should return a single breed by id', async () => {
      // Arrange
      const mockBreed = { id: '1', name: 'Border Collie', categoryId: '1' };
      mockPrisma.breed.findUnique.mockResolvedValue(mockBreed);

      // Act
      const result = await breedResolvers.Query.breed(
        null,
        { id: '1' },
        { prisma: mockPrisma as any }
      );

      // Assert
      expect(mockPrisma.breed.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockBreed);
    });
  });
  
  describe('Mutation', () => {
    test('createBreed should create and return a new breed', async () => {
      // Arrange
      const input = { 
        name: 'Border Collie', 
        categoryId: '1',
        description: 'Smart, hardworking herding dog',
        history: 'Developed in the border country of England and Scotland',
        health: 'Generally healthy, may have eye issues',
        origin: 'United Kingdom',
        funFact: 'Known to be one of the most intelligent dog breeds',
        colors: ['black', 'white'],
        averageHeight: 20,
        averageWeight: 18,
        averageLifeExpectancy: 12,
        exerciseRequired: 5,
        easeOfTraining: 5,
        affection: 4,
        playfulness: 5,
        goodWithChildren: 5,
        goodWithDogs: 4,
        groomingRequired: 3
      };
      const mockBreed = { id: '1', ...input };
      mockPrisma.breed.create.mockResolvedValue(mockBreed);

      // Act
      const result = await breedResolvers.Mutation.createBreed(
        null,
        { input },
        { prisma: mockPrisma as any }
      );

      // Assert
      expect(mockPrisma.breed.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: input.name,
            categoryId: input.categoryId,
          }),
        })
      );
      expect(result).toEqual(mockBreed);
    });
    
    test('updateBreed should update and return an existing breed', async () => {
      // Arrange
      const id = '1';
      const input = { name: 'Border Collie Updated', averageWeight: 20 };
      const mockBreed = { id, ...input, categoryId: '1' };
      mockPrisma.breed.update.mockResolvedValue(mockBreed);

      // Act
      const result = await breedResolvers.Mutation.updateBreed(
        null,
        { id, input },
        { prisma: mockPrisma as any }
      );

      // Assert
      expect(mockPrisma.breed.update).toHaveBeenCalledWith({
        where: { id },
        data: expect.objectContaining({
          name: input.name,
          averageWeight: input.averageWeight,
        }),
      });
      expect(result).toEqual(mockBreed);
    });
    
    test('deleteBreed should delete and return success message', async () => {
      // Arrange
      const id = '1';
      mockPrisma.breed.delete.mockResolvedValue({ id, name: 'Border Collie' });

      // Act
      const result = await breedResolvers.Mutation.deleteBreed(
        null,
        { id },
        { prisma: mockPrisma as any }
      );

      // Assert
      expect(mockPrisma.breed.delete).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual({
        id,
        success: true,
      });
    });
  });
  
  describe('Field Resolvers', () => {
    test('category should return the related category', async () => {
      // Arrange
      const mockCategory = { id: '1', name: 'Herding' };
      (mockLoaders.categoryLoader.load as jest.Mock).mockResolvedValue(mockCategory);

      // Act
      const result = await breedResolvers.Breed.category(
        { categoryId: '1' },
        null,
        { loaders: mockLoaders }
      );

      // Assert
      expect(mockLoaders.categoryLoader.load).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockCategory);
    });
  });
  
  describe('Utility Functions', () => {
    // These tests would be for internal utility functions like buildFilters and applyCursorPagination
    // Since these functions aren't directly exported, we'll test them through the resolver behavior
  });
});
