// TypeScript definitions for GraphQL enums used in tests

export enum BreedSortField {
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
  CATEGORY_ID = 'categoryId'
}

export enum CategorySortField {
  NAME = 'name',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt'
}

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}
