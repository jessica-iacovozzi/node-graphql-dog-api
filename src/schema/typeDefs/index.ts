import gql from 'graphql-tag';
import { categoryTypeDefs } from './category';
import { breedTypeDefs } from './breed';

// Base schema with empty Query and Mutation types that will be extended
const baseTypeDefs = gql`
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

export const typeDefs = [baseTypeDefs, categoryTypeDefs, breedTypeDefs];
