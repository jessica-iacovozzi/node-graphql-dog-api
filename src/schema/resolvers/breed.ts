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
  nameContains?: string;
  descriptionContains?: string;
  historyContains?: string;
  originContains?: string;
  categoryId?: string;
  categoryIds?: string[];
  colors?: string[];
  minAverageHeight?: number;
  maxAverageHeight?: number;
  minAverageWeight?: number;
  maxAverageWeight?: number;
  minAverageLifeExpectancy?: number;
  maxAverageLifeExpectancy?: number;
  minExerciseRequired?: number;
  maxExerciseRequired?: number;
  minEaseOfTraining?: number;
  maxEaseOfTraining?: number;
  minAffection?: number;
  maxAffection?: number;
  minPlayfulness?: number;
  maxPlayfulness?: number;
  minGoodWithChildren?: number;
  maxGoodWithChildren?: number;
  minGoodWithDogs?: number;
  maxGoodWithDogs?: number;
  minGroomingRequired?: number;
  maxGroomingRequired?: number;
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
  EASE_OF_TRAINING = 'easeOfTraining',
  AFFECTION = 'affection',
  PLAYFULNESS = 'playfulness',
  GOOD_WITH_CHILDREN = 'goodWithChildren',
  GOOD_WITH_DOGS = 'goodWithDogs',
  GROOMING_REQUIRED = 'groomingRequired',
  CATEGORY_ID = 'categoryId',
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

/**
 * Builds Prisma-compatible filter objects from GraphQL input filters
 * @param filter - GraphQL filter input
 * @returns Prisma where clause object
 */
const buildFilters = (filter?: BreedFilter) => {
  if (!filter) return {};

  const filters: Record<string, any> = {};
  
  // Text filters with different search modes
  if (filter.name) {
    filters.name = filter.name;
  }
  
  if (filter.nameContains) {
    filters.name = {
      contains: filter.nameContains,
      mode: 'insensitive',
    };
  }

  if (filter.descriptionContains) {
    filters.description = {
      contains: filter.descriptionContains,
      mode: 'insensitive',
    };
  }

  if (filter.historyContains) {
    filters.history = {
      contains: filter.historyContains,
      mode: 'insensitive',
    };
  }
  
  if (filter.originContains) {
    filters.origin = {
      contains: filter.originContains,
      mode: 'insensitive',
    };
  }
  
  // Category filters - both single ID and array of IDs
  if (filter.categoryId) {
    filters.categoryId = filter.categoryId;
  }

  if (filter.categoryIds && filter.categoryIds.length > 0) {
    filters.categoryId = { in: filter.categoryIds };
  }

  // Handle colors array filtering
  if (filter.colors && filter.colors.length > 0) {
    filters.colors = {
      hasSome: filter.colors
    };
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

  if (filter.minEaseOfTraining || filter.maxEaseOfTraining) {
    filters.easeOfTraining = {};
    if (filter.minEaseOfTraining) {
      filters.easeOfTraining.gte = filter.minEaseOfTraining;
    }
    if (filter.maxEaseOfTraining) {
      filters.easeOfTraining.lte = filter.maxEaseOfTraining;
    }
  }

  if (filter.minAffection || filter.maxAffection) {
    filters.affection = {};
    if (filter.minAffection) {
      filters.affection.gte = filter.minAffection;
    }
    if (filter.maxAffection) {
      filters.affection.lte = filter.maxAffection;
    }
  }

  if (filter.minPlayfulness || filter.maxPlayfulness) {
    filters.playfulness = {};
    if (filter.minPlayfulness) {
      filters.playfulness.gte = filter.minPlayfulness;
    }
    if (filter.maxPlayfulness) {
      filters.playfulness.lte = filter.maxPlayfulness;
    }
  }

  if (filter.minGoodWithChildren || filter.maxGoodWithChildren) {
    filters.goodWithChildren = {};
    if (filter.minGoodWithChildren) {
      filters.goodWithChildren.gte = filter.minGoodWithChildren;
    }
    if (filter.maxGoodWithChildren) {
      filters.goodWithChildren.lte = filter.maxGoodWithChildren;
    }
  }

  if (filter.minGoodWithDogs || filter.maxGoodWithDogs) {
    filters.goodWithDogs = {};
    if (filter.minGoodWithDogs) {
      filters.goodWithDogs.gte = filter.minGoodWithDogs;
    }
    if (filter.maxGoodWithDogs) {
      filters.goodWithDogs.lte = filter.maxGoodWithDogs;
    }
  }

  if (filter.minGroomingRequired || filter.maxGroomingRequired) {
    filters.groomingRequired = {};
    if (filter.minGroomingRequired) {
      filters.groomingRequired.gte = filter.minGroomingRequired;
    }
    if (filter.maxGroomingRequired) {
      filters.groomingRequired.lte = filter.maxGroomingRequired;
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
  
  const startCursor = edges.length > 0 ? edges[0].cursor : null;
  const endCursor = edges.length > 0 ? edges[edges.length - 1].cursor : null;
  
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

export const breedResolvers = {
  Query: {
    breeds: async (
      _: any,
      { filter, sort, pagination }: BreedQueryArgs,
      { prisma }: { prisma: PrismaClient }
    ) => {
      const where = buildFilters(filter);
      
      // Default sort by name if none provided
      let orderBy: Record<string, string> = { name: 'asc' };
      if (sort) {
        orderBy = {
          [sort.field]: sort.direction || 'asc',
        };
      }

      // Decode cursor for pagination if provided
      let cursor;
      let skip;
      let take = pagination?.first || 10;
      
      if (pagination?.after) {
        const decodedCursor = Buffer.from(pagination.after, 'base64').toString('utf-8');
        cursor = { id: decodedCursor };
        skip = 1; // Skip the cursor item
      } else if (pagination?.before) {
        const decodedCursor = Buffer.from(pagination.before, 'base64').toString('utf-8');
        cursor = { id: decodedCursor };
        // When paginating backwards, we need a negative take
        take = -(pagination?.last || 10);
        skip = 1; // Skip the cursor item
      }
      
      // Fetch total count for pagination info
      const totalCount = await prisma.breed.count({ where });
      
      // Fetch breeds with pagination
      const breeds = await prisma.breed.findMany({
        where,
        orderBy,
        cursor,
        skip,
        take,
      });
      
      // If we're paginating backwards, we need to reverse the results
      const orderedBreeds = take < 0 ? breeds.reverse() : breeds;
      
      // Apply cursor pagination and return the connection object
      return {
        ...applyCursorPagination(orderedBreeds, pagination),
        totalCount,
      };
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
    category: async (parent: { categoryId: string }, _: any, { loaders }: { loaders: any }) => {
      return loaders.categoryLoader.load(parent.categoryId);
    },
  },
};
