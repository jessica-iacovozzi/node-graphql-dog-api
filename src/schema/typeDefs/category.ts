import gql from 'graphql-tag';

export const categoryTypeDefs = gql`
  type Category {
    id: ID!
    name: String!
    description: String
    breeds: [Breed!]
    createdAt: String!
    updatedAt: String!
  }

  input CategoryFilter {
    name: String
    nameContains: String
    description: String
    descriptionContains: String
    hasBreeds: Boolean
  }

  enum CategorySortField {
    NAME
    CREATED_AT
    UPDATED_AT
  }

  input CategorySort {
    field: CategorySortField!
    direction: SortDirection
  }

  type CategoryEdge {
    node: Category!
    cursor: String!
  }

  type CategoryConnection {
    edges: [CategoryEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  input CreateCategoryInput {
    name: String!
    description: String
  }

  input UpdateCategoryInput {
    name: String
    description: String
  }

  type DeleteCategoryResponse {
    id: ID!
    success: Boolean!
  }

  extend type Query {
    categories(
      filter: CategoryFilter
      sort: CategorySort
      pagination: PaginationInput
    ): CategoryConnection!
    category(id: ID!): Category
  }

  extend type Mutation {
    createCategory(input: CreateCategoryInput!): Category!
    updateCategory(id: ID!, input: UpdateCategoryInput!): Category!
    deleteCategory(id: ID!): DeleteCategoryResponse!
  }
`;
