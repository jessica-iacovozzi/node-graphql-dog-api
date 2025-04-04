import { categoryResolvers } from '../../../src/schema/resolvers/category';
import { DataLoaders } from '../../../src/utils/dataLoaders';
import { CategorySortField, SortDirection } from '../../types';

// Mock Prisma client
const mockPrisma = {
  category: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  breed: {
    findMany: jest.fn(),
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

describe('Category Resolvers', () => {
  describe('Query', () => {
    describe('categories', () => {
      test('should return all categories with default pagination', async () => {
        // Arrange
        const mockCategories = [
          { id: '1', name: 'Herding', description: 'Herding dogs' },
          { id: '2', name: 'Toy', description: 'Toy dogs' },
        ];
        const mockTotalCount = 2;
        mockPrisma.category.findMany.mockResolvedValue(mockCategories);
        mockPrisma.category.count.mockResolvedValue(mockTotalCount);

        // Act
        const result = await categoryResolvers.Query.categories(
          null,
          {},
          { prisma: mockPrisma as any }
        );

        // Assert
        expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
          where: {},
          orderBy: { name: 'asc' },
          cursor: undefined,
          skip: undefined,
          take: 10,
          include: {
            _count: {
              select: { breeds: true }
            }
          }
        });
        expect(mockPrisma.category.count).toHaveBeenCalledWith({ where: {} });
        
        // Check connection structure
        expect(result).toHaveProperty('edges');
        expect(result).toHaveProperty('pageInfo');
        expect(result).toHaveProperty('totalCount', mockTotalCount);
        
        // Check edges
        expect(result.edges).toHaveLength(2);
        expect(result.edges[0].node).toEqual(mockCategories[0]);
        expect(result.edges[0].cursor).toBeTruthy();
        
        // Check pageInfo
        expect(result.pageInfo).toHaveProperty('hasNextPage');
        expect(result.pageInfo).toHaveProperty('hasPreviousPage');
        expect(result.pageInfo).toHaveProperty('startCursor');
        expect(result.pageInfo).toHaveProperty('endCursor');
      });

      test('should apply filters when provided', async () => {
        // Arrange
        const mockCategories = [
          { id: '1', name: 'Herding', description: 'Herding dogs' },
        ];
        mockPrisma.category.findMany.mockResolvedValue(mockCategories);
        mockPrisma.category.count.mockResolvedValue(1);
        
        const filter = {
          nameContains: 'Herd',
          descriptionContains: 'dogs',
          hasBreeds: true,
        };

        // Act
        await categoryResolvers.Query.categories(
          null,
          { filter },
          { prisma: mockPrisma as any }
        );
        
        // Assert
        expect(mockPrisma.category.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              name: expect.objectContaining({
                contains: 'Herd',
                mode: 'insensitive',
              }),
              description: expect.objectContaining({
                contains: 'dogs',
                mode: 'insensitive',
              }),
              breeds: { some: {} },
            }),
          })
        );
      });

      test('should apply sorting when provided', async () => {
        // Arrange
        const mockCategories = [
          { id: '1', name: 'Herding', description: 'Herding dogs' },
          { id: '2', name: 'Toy', description: 'Toy dogs' },
        ];
        mockPrisma.category.findMany.mockResolvedValue(mockCategories);
        mockPrisma.category.count.mockResolvedValue(2);
        
        const sort = {
          field: CategorySortField.NAME,
          direction: SortDirection.DESC,
        };

        // Act
        await categoryResolvers.Query.categories(
          null,
          { sort },
          { prisma: mockPrisma as any }
        );
        
        // Assert
        expect(mockPrisma.category.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            orderBy: { name: 'desc' },
          })
        );
      });

      test('should apply forward pagination when provided', async () => {
        // Arrange
        const mockCategories = [
          { id: '2', name: 'Toy', description: 'Toy dogs' },
        ];
        mockPrisma.category.findMany.mockResolvedValue(mockCategories);
        mockPrisma.category.count.mockResolvedValue(5);
        
        const pagination = {
          first: 1,
          after: Buffer.from('1').toString('base64'),
        };

        // Act
        await categoryResolvers.Query.categories(
          null,
          { pagination },
          { prisma: mockPrisma as any }
        );
        
        // Assert
        expect(mockPrisma.category.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            cursor: { id: '1' },
            skip: 1,
            take: 1,
          })
        );
      });
    });
    
    test('category should return a single category by id', async () => {
      // Arrange
      const mockCategory = { id: '1', name: 'Herding', description: 'Herding dogs' };
      mockPrisma.category.findUnique.mockResolvedValue(mockCategory);

      // Act
      const result = await categoryResolvers.Query.category(
        null,
        { id: '1' },
        { prisma: mockPrisma as any }
      );

      // Assert
      expect(mockPrisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockCategory);
    });
  });

  describe('Mutation', () => {
    test('createCategory should create and return a new category', async () => {
      // Arrange
      const input = { name: 'Working', description: 'Working dogs' };
      const mockCategory = { id: '3', ...input };
      mockPrisma.category.create.mockResolvedValue(mockCategory);

      // Act
      const result = await categoryResolvers.Mutation.createCategory(
        null,
        { input },
        { prisma: mockPrisma as any }
      );

      // Assert
      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: input,
      });
      expect(result).toEqual(mockCategory);
    });
    
    test('updateCategory should update and return a category', async () => {
      // Arrange
      const id = '1';
      const input = { name: 'Herding Updated', description: 'Updated description' };
      const mockCategory = { id, ...input };
      mockPrisma.category.update.mockResolvedValue(mockCategory);

      // Act
      const result = await categoryResolvers.Mutation.updateCategory(
        null,
        { id, input },
        { prisma: mockPrisma as any }
      );

      // Assert
      expect(mockPrisma.category.update).toHaveBeenCalledWith({
        where: { id },
        data: input,
      });
      expect(result).toEqual(mockCategory);
    });
    
    test('deleteCategory should delete and return success message', async () => {
      // Arrange
      const id = '1';
      mockPrisma.category.delete.mockResolvedValue({ id, name: 'Herding' });

      // Act
      const result = await categoryResolvers.Mutation.deleteCategory(
        null,
        { id },
        { prisma: mockPrisma as any }
      );

      // Assert
      expect(mockPrisma.category.delete).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual({
        id,
        success: true,
      });
    });
  });

  describe('Field Resolvers', () => {
    test('breeds should return all breeds for a category using the DataLoader', async () => {
      // Arrange
      const mockBreeds = [
        { id: '1', name: 'Border Collie', categoryId: '1' },
        { id: '2', name: 'German Shepherd', categoryId: '1' },
      ];
      (mockLoaders.breedsByCategoryLoader.load as jest.Mock).mockResolvedValue(mockBreeds);

      // Act
      const result = await categoryResolvers.Category.breeds(
        { id: '1' },
        {},
        { loaders: mockLoaders }
      );

      // Assert
      expect(mockLoaders.breedsByCategoryLoader.load).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockBreeds);
    });
  });
});

