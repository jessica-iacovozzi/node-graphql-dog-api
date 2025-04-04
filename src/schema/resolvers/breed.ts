import { PrismaClient } from '@prisma/client';

// TypeScript interfaces for resolver arguments
interface BreedArgs {
  id: string;
}

interface PaginationInput {
  first?: number;
  after?: string;
  last?: number;
  before?: string;
}

interface BreedFilter {
  name?: string;
  origin?: string;
  categoryId?: string;
  minAverageHeight?: number;
  maxAverageHeight?: number;
  minAverageWeight?: number;
  maxAverageWeight?: number;
  minAverageLifeExpectancy?: number;
  maxAverageLifeExpectancy?: number;
  minExerciseRequired?: number;
  maxExerciseRequired?: number;
}

enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

enum BreedSortField {
  NAME = 'name',
  AVERAGE_HEIGHT = 'averageHeight',
  AVERAGE_WEIGHT = 'averageWeight',
  AVERAGE_LIFE_EXPECTANCY = 'averageLifeExpectancy',
  EXERCISE_REQUIRED = 'exerciseRequired',
}

interface BreedSort {
  field: BreedSortField;
  direction?: SortDirection;
}

interface BreedQueryArgs {
  filter?: BreedFilter;
  sort?: BreedSort;
  pagination?: PaginationInput;
}

interface CreateBreedInput {
  name: string;
  commonNames?: string[];
  description?: string;
  history?: string;
  funFact?: string;
  health?: string;
  origin?: string;
  colors?: string[];
  averageHeight?: number;
  averageWeight?: number;
  averageLifeExpectancy?: number;
  exerciseRequired?: number;
  easeOfTraining?: number;
  affection?: number;
  playfulness?: number;
  goodWithChildren?: number;
  goodWithDogs?: number;
  groomingRequired?: number;
  categoryId: string;
}

interface UpdateBreedInput {
  name?: string;
  commonNames?: string[];
  description?: string;
  history?: string;
  funFact?: string;
  health?: string;
  origin?: string;
  colors?: string[];
  averageHeight?: number;
  averageWeight?: number;
  averageLifeExpectancy?: number;
  exerciseRequired?: number;
  easeOfTraining?: number;
  affection?: number;
  playfulness?: number;
  goodWithChildren?: number;
  goodWithDogs?: number;
  groomingRequired?: number;
  categoryId?: string;
}

interface BreedMutationArgs {
  id: string;
  input: UpdateBreedInput;
}

interface CreateBreedArgs {
  input: CreateBreedInput;
}

// Helper function to build prisma filters from GraphQL filter input
/**
 * Builds Prisma-compatible filter objects from GraphQL input filters
 * @param filter - GraphQL filter input
 * @returns Prisma where clause object
 */
const buildFilters = (filter?: BreedFilter) => {
  if (!filter) return {};

  const filters: Record<string, any> = {}; // More specific than plain 'any'
  
  if (filter.name) {
    filters.name = {
      contains: filter.name,
      mode: 'insensitive',
    };
  }
  
  if (filter.origin) {
    filters.origin = {
      contains: filter.origin,
      mode: 'insensitive',
    };
  }
  
  if (filter.categoryId) {
    filters.categoryId = filter.categoryId;
  }
  
  // Handle numeric range filters
  if (filter.minAverageHeight || filter.maxAverageHeight) {
    filters.averageHeight = {};
    if (filter.minAverageHeight) {
      filters.averageHeight.gte = filter.minAverageHeight;
    }
    if (filter.maxAverageHeight) {
      filters.averageHeight.lte = filter.maxAverageHeight;
    }
  }
  
  if (filter.minAverageWeight || filter.maxAverageWeight) {
    filters.averageWeight = {};
    if (filter.minAverageWeight) {
      filters.averageWeight.gte = filter.minAverageWeight;
    }
    if (filter.maxAverageWeight) {
      filters.averageWeight.lte = filter.maxAverageWeight;
    }
  }
  
  if (filter.minAverageLifeExpectancy || filter.maxAverageLifeExpectancy) {
    filters.averageLifeExpectancy = {};
    if (filter.minAverageLifeExpectancy) {
      filters.averageLifeExpectancy.gte = filter.minAverageLifeExpectancy;
    }
    if (filter.maxAverageLifeExpectancy) {
      filters.averageLifeExpectancy.lte = filter.maxAverageLifeExpectancy;
    }
  }
  
  if (filter.minExerciseRequired || filter.maxExerciseRequired) {
    filters.exerciseRequired = {};
    if (filter.minExerciseRequired) {
      filters.exerciseRequired.gte = filter.minExerciseRequired;
    }
    if (filter.maxExerciseRequired) {
      filters.exerciseRequired.lte = filter.maxExerciseRequired;
    }
  }
  
  return filters;
};

/**
 * Implements cursor-based pagination following the GraphQL Connection pattern
 * @param items - Array of data items to paginate
 * @param pagination - GraphQL pagination input with cursor-based options
 * @returns Connection object with edges, pageInfo, and totalCount
 */
const applyCursorPagination = <T extends { id: string }>(
  items: T[],
  pagination?: PaginationInput
) => {
  // Create cursor for each item
  const allEdges = items.map(item => ({
    node: item,
    cursor: Buffer.from(`cursor:${item.id}`).toString('base64'),
  }));
  
  let edges = allEdges;
  
  // Apply pagination if provided
  if (pagination) {
    // Handle 'after' cursor pagination
    if (pagination.after) {
      const cursorIndex = allEdges.findIndex(edge => edge.cursor === pagination.after);
      if (cursorIndex >= 0) {
        edges = allEdges.slice(cursorIndex + 1);
      }
    }
    
    // Handle 'before' cursor pagination
    if (pagination.before) {
      const cursorIndex = allEdges.findIndex(edge => edge.cursor === pagination.before);
      if (cursorIndex >= 0) {
        edges = allEdges.slice(0, cursorIndex);
      }
    }
    
    // Apply 'first' limit
    if (pagination.first) {
      edges = edges.slice(0, pagination.first);
    }
    
    // Apply 'last' limit
    if (pagination.last) {
      edges = edges.slice(-pagination.last);
    }
  }
  
  // Determine start and end cursors
  const startCursor = edges.length > 0 ? edges[0].cursor : null;
  const endCursor = edges.length > 0 ? edges[edges.length - 1].cursor : null;
  
  // Determine if there are more pages
  const hasNextPage = pagination?.first ? edges.length === pagination.first : false;
  const hasPreviousPage = pagination?.last ? edges.length === pagination.last : false;
  
  // Return a properly typed Connection result
  return {
    edges,
    pageInfo: {
      startCursor,
      endCursor,
      hasNextPage,
      hasPreviousPage,
    },
    totalCount: items.length, // Total count of all items before pagination
  };
};

// Breed resolvers
export const breedResolvers = {
  Query: {
    breeds: async (
      _: any,
      { filter, sort, pagination }: BreedQueryArgs,
      { prisma }: { prisma: PrismaClient }
    ) => {
      const where = buildFilters(filter);
      
      // Apply sorting
      let orderBy = {};
      if (sort) {
        orderBy = {
          [sort.field]: sort.direction || 'asc',
        };
      }
      
      // This is a simplified implementation of pagination
      // In a production app, you'd want to implement proper cursor-based pagination
      const breeds = await prisma.breed.findMany({
        where,
        orderBy,
        take: pagination?.first || 10,
      });
      
      return applyCursorPagination(breeds, pagination);
    },
    
    breed: async (_: any, { id }: BreedArgs, { prisma }: { prisma: PrismaClient }) => {
      return prisma.breed.findUnique({
        where: { id },
      });
    },
  },
  
  Mutation: {
    createBreed: async (
      _: any,
      { input }: CreateBreedArgs,
      { prisma }: { prisma: PrismaClient }
    ) => {
      return prisma.breed.create({
        data: {
          name: input.name,
          commonNames: input.commonNames || [],
          description: input.description,
          history: input.history,
          funFact: input.funFact,
          health: input.health,
          origin: input.origin,
          colors: input.colors || [],
          averageHeight: input.averageHeight,
          averageWeight: input.averageWeight,
          averageLifeExpectancy: input.averageLifeExpectancy,
          exerciseRequired: input.exerciseRequired,
          easeOfTraining: input.easeOfTraining,
          affection: input.affection,
          playfulness: input.playfulness,
          goodWithChildren: input.goodWithChildren,
          goodWithDogs: input.goodWithDogs,
          groomingRequired: input.groomingRequired,
          categoryId: input.categoryId,
        },
      });
    },
    
    updateBreed: async (
      _: any,
      { id, input }: BreedMutationArgs,
      { prisma }: { prisma: PrismaClient }
    ) => {
      return prisma.breed.update({
        where: { id },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.commonNames && { commonNames: input.commonNames }),
          ...(input.description !== undefined && { description: input.description }),
          ...(input.history !== undefined && { history: input.history }),
          ...(input.funFact !== undefined && { funFact: input.funFact }),
          ...(input.health !== undefined && { health: input.health }),
          ...(input.origin !== undefined && { origin: input.origin }),
          ...(input.colors && { colors: input.colors }),
          ...(input.averageHeight !== undefined && { averageHeight: input.averageHeight }),
          ...(input.averageWeight !== undefined && { averageWeight: input.averageWeight }),
          ...(input.averageLifeExpectancy !== undefined && { averageLifeExpectancy: input.averageLifeExpectancy }),
          ...(input.exerciseRequired !== undefined && { exerciseRequired: input.exerciseRequired }),
          ...(input.easeOfTraining !== undefined && { easeOfTraining: input.easeOfTraining }),
          ...(input.affection !== undefined && { affection: input.affection }),
          ...(input.playfulness !== undefined && { playfulness: input.playfulness }),
          ...(input.goodWithChildren !== undefined && { goodWithChildren: input.goodWithChildren }),
          ...(input.goodWithDogs !== undefined && { goodWithDogs: input.goodWithDogs }),
          ...(input.groomingRequired !== undefined && { groomingRequired: input.groomingRequired }),
          ...(input.categoryId && { categoryId: input.categoryId }),
        },
      });
    },
    
    deleteBreed: async (
      _: any,
      { id }: BreedArgs,
      { prisma }: { prisma: PrismaClient }
    ) => {
      await prisma.breed.delete({
        where: { id },
      });
      
      return {
        id,
        success: true,
      };
    },
  },
  
  Breed: {
    category: async (parent: { categoryId: string }, _: any, { prisma }: { prisma: PrismaClient }) => {
      return prisma.category.findUnique({
        where: { id: parent.categoryId },
      });
    },
  },
};
