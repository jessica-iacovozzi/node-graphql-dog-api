import DataLoader from 'dataloader';
import { PrismaClient } from '@prisma/client';

// Define Prisma-generated model types to use in DataLoaders
type Breed = {
  id: string;
  name: string;
  commonNames: string[] | null;
  description: string;
  history: string;
  funFact: string | null;
  health: string;
  origin: string;
  colors: string[];
  averageHeight: number;
  averageWeight: number;
  averageLifeExpectancy: number;
  exerciseRequired: number;
  easeOfTraining: number;
  affection: number;
  playfulness: number;
  goodWithChildren: number;
  goodWithDogs: number;
  groomingRequired: number;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
};

type Category = {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Factory function to create all data loaders used in the application
 * @param prisma - Prisma client instance to use for database queries
 * @returns Object containing all data loaders
 */
export const createLoaders = (prisma: PrismaClient) => {
  /**
   * DataLoader for loading categories by ID
   * Batches multiple category requests to prevent N+1 query problems
   */
  const categoryLoader = new DataLoader<string, Category | null>(async (ids: readonly string[]) => {
    const categories = await prisma.category.findMany({
      where: {
        id: {
          in: [...ids],
        },
      },
    });

    // Make sure the returned categories are in the same order as the ids
    return ids.map(id => categories.find((category: Category) => category.id === id) || null);
  });

  /**
   * DataLoader for loading breeds by category ID
   * Batches multiple breed requests to prevent N+1 query problems when fetching breeds for categories
   */
  const breedsByCategoryLoader = new DataLoader<string, Breed[]>(async (categoryIds: readonly string[]) => {
    const breeds = await prisma.breed.findMany({
      where: {
        categoryId: {
          in: [...categoryIds],
        },
      },
    });

    // Group breeds by categoryId
    const breedsByCategory = categoryIds.map(categoryId => 
      breeds.filter((breed: Breed) => breed.categoryId === categoryId)
    );

    return breedsByCategory;
  });

  /**
   * DataLoader for loading breeds by ID
   * Batches multiple breed requests to prevent N+1 query problems
   */
  const breedLoader = new DataLoader<string, Breed | null>(async (ids: readonly string[]) => {
    const breeds = await prisma.breed.findMany({
      where: {
        id: {
          in: [...ids],
        },
      },
    });

    // Make sure the returned breeds are in the same order as the ids
    return ids.map(id => breeds.find((breed: Breed) => breed.id === id) || null);
  });

  return {
    categoryLoader,
    breedsByCategoryLoader,
    breedLoader,
  };
};

// Define types for the context with data loaders
export interface DataLoaders {
  categoryLoader: DataLoader<string, Category | null>;
  breedsByCategoryLoader: DataLoader<string, Breed[]>;
  breedLoader: DataLoader<string, Breed | null>;
}

export interface Context {
  prisma: PrismaClient;
  loaders: DataLoaders;
}
