import { categoryResolvers } from '../../../src/schema/resolvers/category';

// Mock Prisma client
const mockPrisma = {
  category: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  breed: {
    findMany: jest.fn(),
  },
};

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

describe('Category Resolvers', () => {
  describe('Query', () => {
    test('categories should return all categories', async () => {
      // Arrange
      const mockCategories = [
        { id: '1', name: 'Herding', description: 'Herding dogs' },
        { id: '2', name: 'Toy', description: 'Toy dogs' },
      ];
      mockPrisma.category.findMany.mockResolvedValue(mockCategories);

      // Act
      const result = await categoryResolvers.Query.categories(
        null,
        {},
        { prisma: mockPrisma as any }
      );

      // Assert
      expect(mockPrisma.category.findMany).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockCategories);
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
  });

  describe('Category', () => {
    test('breeds should return all breeds for a category', async () => {
      // Arrange
      const mockBreeds = [
        { id: '1', name: 'Border Collie', categoryId: '1' },
        { id: '2', name: 'German Shepherd', categoryId: '1' },
      ];
      mockPrisma.breed.findMany.mockResolvedValue(mockBreeds);

      // Act
      const result = await categoryResolvers.Category.breeds(
        { id: '1' },
        {},
        { prisma: mockPrisma as any }
      );

      // Assert
      expect(mockPrisma.breed.findMany).toHaveBeenCalledWith({
        where: { categoryId: '1' },
      });
      expect(result).toEqual(mockBreeds);
    });
  });
});
