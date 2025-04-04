import gql from 'graphql-tag';

export const breedTypeDefs = gql`
  type Breed {
    id: ID!
    name: String!
    commonNames: [String!]
    description: String!
    history: String!
    funFact: String
    health: String!
    origin: String!
    colors: [String!]!
    averageHeight: Float!
    averageWeight: Float!
    averageLifeExpectancy: Float!
    exerciseRequired: Int!
    easeOfTraining: Int!
    affection: Int!
    playfulness: Int!
    goodWithChildren: Int!
    goodWithDogs: Int!
    groomingRequired: Int!
    category: Category!
    createdAt: String!
    updatedAt: String!
  }

  input BreedFilter {
    name: String
    nameContains: String
    descriptionContains: String
    historyContains: String
    originContains: String
    categoryId: ID
    categoryIds: [ID!]
    colors: [String!]
    minAverageHeight: Float
    maxAverageHeight: Float
    minAverageWeight: Float
    maxAverageWeight: Float
    minAverageLifeExpectancy: Float
    maxAverageLifeExpectancy: Float
    minExerciseRequired: Int
    maxExerciseRequired: Int
    minEaseOfTraining: Int
    maxEaseOfTraining: Int
    minAffection: Int
    maxAffection: Int
    minPlayfulness: Int
    maxPlayfulness: Int
    minGoodWithChildren: Int
    maxGoodWithChildren: Int
    minGoodWithDogs: Int
    maxGoodWithDogs: Int
    minGroomingRequired: Int
    maxGroomingRequired: Int
  }

  enum BreedSortField {
    NAME
    AVERAGE_HEIGHT
    AVERAGE_WEIGHT
    AVERAGE_LIFE_EXPECTANCY
    EXERCISE_REQUIRED
    EASE_OF_TRAINING
    AFFECTION
    PLAYFULNESS
    GOOD_WITH_CHILDREN
    GOOD_WITH_DOGS
    GROOMING_REQUIRED
    CATEGORY_ID
  }

  enum SortDirection {
    ASC
    DESC
  }

  input BreedSort {
    field: BreedSortField!
    direction: SortDirection
  }

  input PaginationInput {
    first: Int
    after: String
    last: Int
    before: String
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  type BreedEdge {
    node: Breed!
    cursor: String!
  }

  type BreedConnection {
    edges: [BreedEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  input CreateBreedInput {
    name: String!
    commonNames: [String!]
    description: String!
    history: String!
    funFact: String
    health: String!
    origin: String!
    colors: [String!]
    averageHeight: Float!
    averageWeight: Float!
    averageLifeExpectancy: Float!
    exerciseRequired: Int!
    easeOfTraining: Int!
    affection: Int!
    playfulness: Int!
    goodWithChildren: Int!
    goodWithDogs: Int!
    groomingRequired: Int!
    categoryId: ID!
  }

  input UpdateBreedInput {
    name: String
    commonNames: [String!]
    description: String
    history: String
    funFact: String
    health: String
    origin: String
    colors: [String!]
    averageHeight: Float
    averageWeight: Float
    averageLifeExpectancy: Float
    exerciseRequired: Int
    easeOfTraining: Int
    affection: Int
    playfulness: Int
    goodWithChildren: Int
    goodWithDogs: Int
    groomingRequired: Int
    categoryId: ID
  }

  type DeleteBreedResponse {
    id: ID!
    success: Boolean!
  }

  extend type Query {
    breeds(
      filter: BreedFilter
      sort: BreedSort
      pagination: PaginationInput
    ): BreedConnection!
    breed(id: ID!): Breed
  }

  extend type Mutation {
    createBreed(input: CreateBreedInput!): Breed!
    updateBreed(id: ID!, input: UpdateBreedInput!): Breed!
    deleteBreed(id: ID!): DeleteBreedResponse!
  }
`;
