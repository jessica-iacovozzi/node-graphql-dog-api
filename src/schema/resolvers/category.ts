import { PrismaClient } from '@prisma/client';

// Define TypeScript interfaces for resolver arguments
interface CategoryArgs {
  id: string;
}

interface PaginationInput {
  first?: number;
  after?: string;
  last?: number;
  before?: string;
}

interface CategoryFilter {
  name?: string;
  nameContains?: string;
  description?: string;
  descriptionContains?: string;
  hasBreeds?: boolean;
}

enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

enum CategorySortField {
  NAME = 'name',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

interface CategorySort {
  field: CategorySortField;
  direction?: SortDirection;
}

interface CategoryQueryArgs {
  filter?: CategoryFilter;
  sort?: CategorySort;
  pagination?: PaginationInput;
}

interface CreateCategoryInput {
  name: string;
  description?: string;
}

interface UpdateCategoryInput {
  name?: string;
  description?: string;
}

interface CategoryMutationArgs {
  id: string;
  input: UpdateCategoryInput;
}

interface CreateCategoryArgs {
  input: CreateCategoryInput;
}

/**
 * Builds Prisma-compatible filter objects from GraphQL input filters
 * @param filter - GraphQL filter input
 * @returns Prisma where clause object
 */
const buildFilters = (filter?: CategoryFilter) => {
  if (!filter) return {};

  const filters: Record<string, any> = {};

  if (filter.name) {
    filters.name = filter.name;
  }

  if (filter.nameContains) {
    filters.name = {
      contains: filter.nameContains,
      mode: 'insensitive',
    };
  }

  if (filter.description) {
    filters.description = filter.description;
  }

  if (filter.descriptionContains) {
    filters.description = {
      contains: filter.descriptionContains,
      mode: 'insensitive',
    };
  }

  if (filter.hasBreeds !== undefined) {
    filters.breeds = filter.hasBreeds
      ? {
          some: {},
        }
      : {
          none: {},
        };
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
  pagination?: PaginationInput,
) => {
  // Create a base connection object with all items
  let edges = items.map(item => ({
    node: item,
    cursor: Buffer.from(item.id).toString('base64'),
  }));

  let hasNextPage = false;
  let hasPreviousPage = false;

  // Apply forward pagination (first/after)
  if (pagination?.after) {
    const afterId = Buffer.from(pagination.after, 'base64').toString('utf-8');
    const afterIndex = edges.findIndex(
      edge => Buffer.from(edge.cursor, 'base64').toString('utf-8') === afterId,
    );

    if (afterIndex >= 0) {
      edges = edges.slice(afterIndex + 1);
      hasPreviousPage = true;
    }
  }

  // Apply backward pagination (last/before)
  if (pagination?.before) {
    const beforeId = Buffer.from(pagination.before, 'base64').toString('utf-8');
    const beforeIndex = edges.findIndex(
      edge => Buffer.from(edge.cursor, 'base64').toString('utf-8') === beforeId,
    );

    if (beforeIndex >= 0) {
      edges = edges.slice(0, beforeIndex);
      hasNextPage = true;
    }
  }

  // Apply limit based on first/last
  if (pagination?.first) {
    if (edges.length > pagination.first) {
      edges = edges.slice(0, pagination.first);
      hasNextPage = true;
    }
  } else if (pagination?.last) {
    if (edges.length > pagination.last) {
      edges = edges.slice(edges.length - pagination.last);
      hasPreviousPage = true;
    }
  }

  const startCursor = edges.length > 0 ? edges[0].cursor : null;
  const endCursor = edges.length > 0 ? edges[edges.length - 1].cursor : null;

  const hasNextPageFinal = pagination?.first ? edges.length === pagination.first : false;
  const hasPreviousPageFinal = pagination?.last ? edges.length === pagination.last : false;

  return {
    edges,
    pageInfo: {
      hasNextPage: hasNextPage || hasNextPageFinal,
      hasPreviousPage: hasPreviousPage || hasPreviousPageFinal,
      startCursor,
      endCursor,
    },
    totalCount: items.length,
  };
};

// Category resolvers
export const categoryResolvers = {
  Query: {
    categories: async (
      _: any,
      { filter, sort, pagination }: CategoryQueryArgs,
      { prisma }: { prisma: PrismaClient },
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
      const totalCount = await prisma.category.count({ where });

      // Fetch categories with pagination
      const categories = await prisma.category.findMany({
        where,
        orderBy,
        cursor,
        skip,
        take,
        include: {
          _count: {
            select: { breeds: true },
          },
        },
      });

      // If we're paginating backwards, we need to reverse the results
      const orderedCategories = take < 0 ? categories.reverse() : categories;

      // Apply cursor pagination and return the connection object
      return {
        ...applyCursorPagination(orderedCategories, pagination),
        totalCount,
      };
    },
    category: async (_: any, { id }: CategoryArgs, { prisma }: { prisma: PrismaClient }) => {
      return prisma.category.findUnique({
        where: { id },
      });
    },
  },
  Mutation: {
    createCategory: async (
      _: any,
      { input }: CreateCategoryArgs,
      { prisma }: { prisma: PrismaClient },
    ) => {
      return prisma.category.create({
        data: {
          name: input.name,
          description: input.description,
        },
      });
    },
    updateCategory: async (
      _: any,
      { id, input }: CategoryMutationArgs,
      { prisma }: { prisma: PrismaClient },
    ) => {
      return prisma.category.update({
        where: { id },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.description && { description: input.description }),
        },
      });
    },
    deleteCategory: async (_: any, { id }: CategoryArgs, { prisma }: { prisma: PrismaClient }) => {
      await prisma.category.delete({
        where: { id },
      });

      return {
        id,
        success: true,
      };
    },
  },
  Category: {
    breeds: async (parent: { id: string }, _: any, { loaders }: { loaders: any }) => {
      return loaders.breedsByCategoryLoader.load(parent.id);
    },
  },
};
