import { PrismaClient } from '@prisma/client';

// Define TypeScript interfaces for resolver arguments
interface CategoryArgs {
  id: string;
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

// Category resolvers
export const categoryResolvers = {
  Query: {
    categories: async (_: any, __: any, { prisma }: { prisma: PrismaClient }) => {
      return prisma.category.findMany();
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
      { prisma }: { prisma: PrismaClient }
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
      { prisma }: { prisma: PrismaClient }
    ) => {
      return prisma.category.update({
        where: { id },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.description && { description: input.description }),
        },
      });
    },
    deleteCategory: async (
      _: any,
      { id }: CategoryArgs,
      { prisma }: { prisma: PrismaClient }
    ) => {
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
    breeds: async (parent: { id: string }, _: any, { prisma }: { prisma: PrismaClient }) => {
      return prisma.breed.findMany({
        where: { categoryId: parent.id },
      });
    },
  },
};
