import { z } from 'zod';

const ratingSchema = z.number().int().min(1).max(5);

const breedBaseSchema = {
  name: z.string().min(2).max(100),
  commonNames: z.array(z.string()).optional(),
  description: z.string().min(10),
  history: z.string().min(10),
  funFact: z.string().optional(),
  health: z.string().min(10),
  origin: z.string().min(2),
  colors: z.array(z.string()),
  averageHeight: z.number().positive(),
  averageWeight: z.number().positive(),
  averageLifeExpectancy: z.number().positive(),
  exerciseRequired: ratingSchema,
  easeOfTraining: ratingSchema,
  affection: ratingSchema,
  playfulness: ratingSchema,
  goodWithChildren: ratingSchema,
  goodWithDogs: ratingSchema,
  groomingRequired: ratingSchema,
  categoryId: z.string().uuid()
};

export const createBreedSchema = z.object({
  ...breedBaseSchema,
});

export const updateBreedSchema = z.object({
  ...Object.entries(breedBaseSchema).reduce((acc, [key, schema]) => {
    acc[key] = schema.optional();
    return acc;
  }, {} as Record<string, z.ZodType<any>>)
}).refine(data => {
  return Object.keys(data).length > 0;
}, { message: "At least one field must be provided for update" });

export const breedFilterSchema = z.object({
  name: z.string().optional(),
  nameContains: z.string().optional(),
  descriptionContains: z.string().optional(),
  historyContains: z.string().optional(),
  originContains: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
  colors: z.array(z.string()).optional(),
  minAverageHeight: z.number().optional(),
  maxAverageHeight: z.number().optional(),
  minAverageWeight: z.number().optional(),
  maxAverageWeight: z.number().optional(),
  minAverageLifeExpectancy: z.number().optional(),
  maxAverageLifeExpectancy: z.number().optional(),
  minExerciseRequired: z.number().optional(),
  maxExerciseRequired: z.number().optional(),
  minEaseOfTraining: z.number().optional(),
  maxEaseOfTraining: z.number().optional(),
  minAffection: z.number().optional(),
  maxAffection: z.number().optional(),
  minPlayfulness: z.number().optional(),
  maxPlayfulness: z.number().optional(),
  minGoodWithChildren: z.number().optional(),
  maxGoodWithChildren: z.number().optional(),
  minGoodWithDogs: z.number().optional(),
  maxGoodWithDogs: z.number().optional(),
  minGroomingRequired: z.number().optional(),
  maxGroomingRequired: z.number().optional(),
});