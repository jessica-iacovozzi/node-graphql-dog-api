import { categoryResolvers } from './category';
import { breedResolvers } from './breed';

// Define a generic Resolvers type to avoid TypeScript errors with internal types
type Resolvers = {
  Query: Record<string, any>;
  Mutation: Record<string, any>;
  [key: string]: any;
};

// Use type assertion to tell TypeScript this is a valid resolvers object
export const resolvers: Resolvers = {
  Query: {
    ...categoryResolvers.Query,
    ...breedResolvers.Query,
  },
  Mutation: {
    ...categoryResolvers.Mutation,
    ...breedResolvers.Mutation,
  },
  Category: {
    ...categoryResolvers.Category,
  },
  Breed: {
    ...breedResolvers.Breed,
  },
};
