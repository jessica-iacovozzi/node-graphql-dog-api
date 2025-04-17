import { createBreedSchema, updateBreedSchema } from '../../src/validation/schemas/breed';

describe('Breed Validation', () => {
  describe('Create Breed Validation', () => {
    it('should validate valid input', () => {
      const validInput = {
        name: 'Golden Retriever',
        description: 'A friendly family dog',
        history: 'Originated in Scotland in the mid-19th century',
        health: 'Generally healthy but prone to hip dysplasia',
        origin: 'Scotland',
        colors: ['Golden', 'Light Golden', 'Dark Golden'],
        averageHeight: 22.5,
        averageWeight: 65,
        averageLifeExpectancy: 12,
        exerciseRequired: 4,
        easeOfTraining: 5,
        affection: 5,
        playfulness: 5,
        goodWithChildren: 5,
        goodWithDogs: 5,
        groomingRequired: 3,
        categoryId: '123e4567-e89b-12d3-a456-426614174000'
      };
      
      const result = createBreedSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
    
    it('should reject invalid rating values', () => {
      const invalidInput = {
        name: 'Golden Retriever',
        description: 'A friendly family dog',
        history: 'Originated in Scotland in the mid-19th century',
        health: 'Generally healthy but prone to hip dysplasia',
        origin: 'Scotland',
        colors: ['Golden', 'Light Golden', 'Dark Golden'],
        averageHeight: 22.5,
        averageWeight: 65,
        averageLifeExpectancy: 12,
        exerciseRequired: 6, // Invalid: above max of 5
        easeOfTraining: 5,
        affection: 5,
        playfulness: 5,
        goodWithChildren: 5,
        goodWithDogs: 5,
        groomingRequired: 3,
        categoryId: '123e4567-e89b-12d3-a456-426614174000'
      };
      
      const result = createBreedSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe('Update Breed Validation', () => {
    it('should validate valid input', () => {
      const validInput = {
        name: 'Golden Retriever',
        description: 'A friendly family dog',
        history: 'Originated in Scotland in the mid-19th century',
        health: 'Generally healthy but prone to hip dysplasia',
        origin: 'Scotland',
        colors: ['Golden', 'Light Golden', 'Dark Golden'],
        averageHeight: 22.5,
        averageWeight: 65,
        averageLifeExpectancy: 12,
        exerciseRequired: 4,
        easeOfTraining: 5,
        affection: 5,
        playfulness: 5,
        goodWithChildren: 5,
        goodWithDogs: 5,
        groomingRequired: 3,
        categoryId: '123e4567-e89b-12d3-a456-426614174000'
      };
      
      const result = updateBreedSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
    
    it('should reject invalid rating values', () => {
      const invalidInput = {
        name: 'Golden Retriever',
        description: 'A friendly family dog',
        history: 'Originated in Scotland in the mid-19th century',
        health: 'Generally healthy but prone to hip dysplasia',
        origin: 'Scotland',
        colors: ['Golden', 'Light Golden', 'Dark Golden'],
        averageHeight: 22.5,
        averageWeight: 65,
        averageLifeExpectancy: 12,
        exerciseRequired: 6, // Invalid: above max of 5
        easeOfTraining: 5,
        affection: 5,
        playfulness: 5,
        goodWithChildren: 5,
        goodWithDogs: 5,
        groomingRequired: 3,
        categoryId: '123e4567-e89b-12d3-a456-426614174000'
      };
      
      const result = updateBreedSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });
});