import { createLoaders } from '../../src/utils/dataLoaders';
import { PrismaClient } from '@prisma/client';

// Mock Prisma client
const mockPrisma = {
  category: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  breed: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
};

describe('DataLoaders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('categoryLoader', () => {
    test('should batch and load categories by id', async () => {
      // Arrange
      const mockCategories = [
        { id: '1', name: 'Herding' },
        { id: '2', name: 'Toy' },
      ];
      mockPrisma.category.findMany.mockResolvedValue(mockCategories);
      
      const loaders = createLoaders(mockPrisma as unknown as PrismaClient);
      
      // Act
      const loadPromises = ['1', '2'].map(id => loaders.categoryLoader.load(id));
      const results = await Promise.all(loadPromises);
      
      // Assert
      expect(mockPrisma.category.findMany).toHaveBeenCalledTimes(1);
      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['1', '2'] } },
      });
      expect(results).toEqual(mockCategories);
    });
    
    test('should return null for non-existent category', async () => {
      // Arrange
      const mockCategories = [{ id: '1', name: 'Herding' }];
      mockPrisma.category.findMany.mockResolvedValue(mockCategories);
      
      const loaders = createLoaders(mockPrisma as unknown as PrismaClient);
      
      // Act
      const loadPromises = ['1', '2'].map(id => loaders.categoryLoader.load(id));
      const results = await Promise.all(loadPromises);
      
      // Assert
      expect(results).toEqual([mockCategories[0], null]);
    });
  });

  describe('breedLoader', () => {
    test('should batch and load breeds by id', async () => {
      // Arrange
      const mockBreeds = [
        { id: '1', name: 'Border Collie', categoryId: '1' },
        { id: '2', name: 'German Shepherd', categoryId: '1' },
      ];
      mockPrisma.breed.findMany.mockResolvedValue(mockBreeds);
      
      const loaders = createLoaders(mockPrisma as unknown as PrismaClient);
      
      // Act
      const loadPromises = ['1', '2'].map(id => loaders.breedLoader.load(id));
      const results = await Promise.all(loadPromises);
      
      // Assert
      expect(mockPrisma.breed.findMany).toHaveBeenCalledTimes(1);
      expect(mockPrisma.breed.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['1', '2'] } },
      });
      expect(results).toEqual(mockBreeds);
    });
    
    test('should return null for non-existent breed', async () => {
      // Arrange
      const mockBreeds = [{ id: '1', name: 'Border Collie', categoryId: '1' }];
      mockPrisma.breed.findMany.mockResolvedValue(mockBreeds);
      
      const loaders = createLoaders(mockPrisma as unknown as PrismaClient);
      
      // Act
      const loadPromises = ['1', '3'].map(id => loaders.breedLoader.load(id));
      const results = await Promise.all(loadPromises);
      
      // Assert
      expect(results).toEqual([mockBreeds[0], null]);
    });
  });

  describe('breedsByCategoryLoader', () => {
    test('should load breeds by category id', async () => {
      // Arrange
      const categoryId = '1';
      const mockBreeds = [
        { id: '1', name: 'Border Collie', categoryId },
        { id: '2', name: 'German Shepherd', categoryId },
      ];
      mockPrisma.breed.findMany.mockResolvedValue(mockBreeds);
      
      const loaders = createLoaders(mockPrisma as unknown as PrismaClient);
      
      // Act
      const result = await loaders.breedsByCategoryLoader.load(categoryId);
      
      // Assert
      expect(mockPrisma.breed.findMany).toHaveBeenCalledWith({
        where: { 
          categoryId: { 
            in: [categoryId] 
          } 
        },
      });
      expect(result).toEqual(mockBreeds);
    });
    
    test('should return empty array for category with no breeds', async () => {
      // Arrange
      const categoryId = '3';
      mockPrisma.breed.findMany.mockResolvedValue([]);
      
      const loaders = createLoaders(mockPrisma as unknown as PrismaClient);
      
      // Act
      const result = await loaders.breedsByCategoryLoader.load(categoryId);
      
      // Assert
      expect(result).toEqual([]);
    });
    
    test('should batch multiple category requests', async () => {
      // Arrange
      const mockBreedsCategory1 = [
        { id: '1', name: 'Border Collie', categoryId: '1' },
        { id: '2', name: 'German Shepherd', categoryId: '1' },
      ];
      const mockBreedsCategory2 = [
        { id: '3', name: 'Poodle', categoryId: '2' },
      ];
      
      // Since DataLoader batches requests, we only need to mock a single call
      // that returns all breeds for both categories
      mockPrisma.breed.findMany.mockResolvedValueOnce([...mockBreedsCategory1, ...mockBreedsCategory2]);
      
      const loaders = createLoaders(mockPrisma as unknown as PrismaClient);
      
      // Act
      const results = await Promise.all([
        loaders.breedsByCategoryLoader.load('1'),
        loaders.breedsByCategoryLoader.load('2'),
      ]);
      
      // Assert
      expect(mockPrisma.breed.findMany).toHaveBeenCalledTimes(1);
      expect(results[0]).toEqual(mockBreedsCategory1);
      expect(results[1]).toEqual(mockBreedsCategory2);
    });
  });
});
