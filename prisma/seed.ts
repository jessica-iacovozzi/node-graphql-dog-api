import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const seedDataDir = path.join(__dirname, 'seed-data');

// Helper function to read JSON files
function readJsonFile<T>(filePath: string): T | null {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data) as T;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

// Define interfaces for our data structures
interface Category {
  name: string;
  description: string;
}

// Define validation error interface
interface ValidationError {
  field: string;
  message: string;
}

interface Breed {
  name: string;
  commonNames?: string[];
  description: string;
  history: string;
  funFact?: string;
  health: string;
  origin: string;
  colors: string[];
  averageHeight: number;
  averageWeight: number;
  averageLifeExpectancy: number;
  exerciseRequired: number;
  easeOfTraining: number;
  affection: number;
  playfulness: number;
  goodWithChildren: number;
  goodWithDogs: number;
  groomingRequired: number;
  categoryName?: string; // Optional field that may be in breed data to match to category
}

// Helper function to seed categories
async function seedCategories() {
  console.log('🌱 Seeding categories...');
  
  const categoriesFilePath = path.join(seedDataDir, 'categories.json');
  if (!fs.existsSync(categoriesFilePath)) {
    throw new Error(`Categories file not found at ${categoriesFilePath}`);
  }
  
  const categories = readJsonFile<Category[]>(categoriesFilePath);
  if (!categories) {
    throw new Error('Failed to parse categories data');
  }
  
  const categoryMap: Record<string, string> = {};
  
  // Process in batches for better performance
  const batchSize = 10;
  for (let i = 0; i < categories.length; i += batchSize) {
    const batch = categories.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(category => 
        prisma.category.upsert({
          where: { name: category.name },
          update: category,
          create: category
        })
      )
    );
    
    // Store category IDs in map for breed creation
    results.forEach(category => {
      categoryMap[category.name] = category.id;
    });
  }
  
  console.log(`✅ Seeded ${Object.keys(categoryMap).length} categories`);
  return categoryMap;
}

// Validate a single breed against requirements
function validateBreed(breed: Breed): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Required fields validation - all fields except the explicitly optional ones
  const requiredFields = [
    'name', 'description', 'history', 'health', 'origin', 'colors',
    'averageHeight', 'averageWeight', 'averageLifeExpectancy',
    'exerciseRequired', 'easeOfTraining', 'affection', 'playfulness',
    'goodWithChildren', 'goodWithDogs', 'groomingRequired'
  ];
  
  for (const field of requiredFields) {
    if (breed[field as keyof Breed] === undefined || breed[field as keyof Breed] === null) {
      errors.push({
        field,
        message: `Required field '${field}' is missing`
      });
    }
  }
  
  // Name validation
  if (breed.name && (typeof breed.name !== 'string' || breed.name.length < 2)) {
    errors.push({
      field: 'name',
      message: `Name must be a string with at least 2 characters`
    });
  }
  
  // Array field validations
  if (breed.commonNames !== undefined && !Array.isArray(breed.commonNames)) {
    errors.push({
      field: 'commonNames',
      message: 'commonNames must be an array of strings'
    });
  }
  
  if (!Array.isArray(breed.colors)) {
    errors.push({
      field: 'colors',
      message: 'colors must be an array of strings'
    });
  } else if (breed.colors.length === 0) {
    errors.push({
      field: 'colors',
      message: 'colors array must contain at least one color'
    });
  }
  
  // Numeric range validations (where applicable)
  const numericRanges: { [key: string]: [number, number] } = {
    averageHeight: [10, 100], // cm
    averageWeight: [1, 100], // kg
    averageLifeExpectancy: [5, 20], // years
    exerciseRequired: [1, 5], // scale
    easeOfTraining: [1, 5], // scale
    affection: [1, 5], // scale
    playfulness: [1, 5], // scale
    goodWithChildren: [1, 5], // scale
    goodWithDogs: [1, 5], // scale
    groomingRequired: [1, 5] // scale
  };

  for (const [field, [min, max]] of Object.entries(numericRanges)) {
    const value = breed[field as keyof Breed] as number;
    if (typeof value !== 'number') {
      errors.push({
        field,
        message: `Field '${field}' must be a number`
      });
    } else if (value < min || value > max) {
      errors.push({
        field,
        message: `Field '${field}' must be between ${min} and ${max}`
      });
    }
  }
  
  // Text field validations for length
  const maxTextLengths: { [key: string]: number } = {
    description: 1000,
    history: 2000,
    funFact: 500,
    health: 1000,
    origin: 100
  };
  
  for (const [field, maxLength] of Object.entries(maxTextLengths)) {
    // Handle optional fields (funFact) differently
    if (field === 'funFact') {
      const value = breed[field as keyof Breed] as string | undefined;
      if (value !== undefined) {
        if (typeof value !== 'string') {
          errors.push({
            field,
            message: `Field '${field}' must be a string`
          });
        } else if (value.length > maxLength) {
          errors.push({
            field, 
            message: `Field '${field}' exceeds maximum length of ${maxLength} characters`
          });
        }
      }
    } else {
      // Required text fields
      const value = breed[field as keyof Breed] as string;
      if (typeof value !== 'string') {
        errors.push({
          field,
          message: `Field '${field}' must be a string`
        });
      } else if (value.length > maxLength) {
        errors.push({
          field, 
          message: `Field '${field}' exceeds maximum length of ${maxLength} characters`
        });
      } else if (value.trim().length === 0) {
        errors.push({
          field,
          message: `Field '${field}' cannot be empty`
        });
      }
    }
  }
  
  return errors;
}

// Helper function to seed breeds for a specific category
async function seedBreeds(breeds: Breed[], categoryName: string, categoryId: string) {
  console.log(`🌱 Seeding ${breeds.length} ${categoryName} breeds...`);
  
  // Track validation issues
  const validationIssues: { breed: string; errors: ValidationError[] }[] = [];
  const validBreeds: Breed[] = [];
  
  // Validate all breeds first
  for (const breed of breeds) {
    const errors = validateBreed(breed);
    if (errors.length > 0) {
      validationIssues.push({
        breed: breed.name || 'Unknown breed',
        errors
      });
    } else {
      validBreeds.push(breed);
    }
  }
  
  // Report validation issues if any
  if (validationIssues.length > 0) {
    console.warn(`⚠️ Found ${validationIssues.length} breeds with validation issues:`);
    validationIssues.forEach(({ breed, errors }) => {
      console.warn(`  - ${breed}:`);
      errors.forEach(err => console.warn(`    * ${err.field}: ${err.message}`))
    });
    
    if (validBreeds.length === 0) {
      console.error(`❌ No valid breeds to seed for category ${categoryName}!`);
      return;
    }
    
    console.log(`ℹ️ Proceeding with ${validBreeds.length} valid breeds out of ${breeds.length} total.`);
  }
  
  // Process in batches for better performance
  const batchSize = 50;
  
  for (let i = 0; i < validBreeds.length; i += batchSize) {
    const batch = validBreeds.slice(i, i + batchSize);
    await Promise.all(
      batch.map(breed => {
        // Create a copy of the breed object and remove the categoryName property
        const { categoryName, ...breedData } = breed;
        
        return prisma.breed.upsert({
          where: {
            name: breed.name
          },
          update: {
            ...breedData,
            categoryId
          },
          create: {
            ...breedData,
            categoryId
          }
        });
      })
    );
    console.log(`  ✓ Processed ${Math.min(i + batchSize, validBreeds.length)}/${validBreeds.length} ${categoryName} breeds`);
  }
}

async function main() {
  try {
    // Clean up existing data (optional - be careful in production)
    console.log('🧹 Cleaning up existing data...');
    await prisma.breed.deleteMany({});
    await prisma.category.deleteMany({});
    
    // Seed categories and get categoryMap
    const categoryMap = await seedCategories();
    
    // Get all breed JSON files
    const breedFiles = fs.readdirSync(seedDataDir)
      .filter(file => file.endsWith('.json') && file !== 'categories.json');
    
    console.log(`Found ${breedFiles.length} breed category files`);
    
    // Process each breed file
    let totalBreeds = 0;
    for (const file of breedFiles) {
      const breeds = readJsonFile<Breed[]>(path.join(seedDataDir, file));
      if (!breeds || !Array.isArray(breeds)) {
        console.warn(`⚠️ Skipping file ${file}: Not a valid breed array`);
        continue;
      }
      
      // Extract category name from filename (e.g., 'working.json' -> 'Working')
      const categoryName = path.basename(file, '.json')
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      // Find matching category
      let categoryId: string | null = null;
      for (const [name, id] of Object.entries(categoryMap)) {
        // Case insensitive match
        if (name.toLowerCase() === categoryName.toLowerCase()) {
          categoryId = id;
          break;
        }
      }
      
      if (categoryId) {
        await seedBreeds(breeds, categoryName, categoryId);
        totalBreeds += breeds.length;
      } else {
        console.warn(`⚠️ Category '${categoryName}' not found for file ${file}, looking for exact match...`);
        
        // Try to extract category from the breed data
        if (breeds.length > 0 && breeds[0].categoryName) {
          const breedCategoryName = breeds[0].categoryName;
          const matchedCategoryId: string | undefined = categoryMap[breedCategoryName];
          
          if (matchedCategoryId) {
            console.log(`📂 Found category from breed data: ${breedCategoryName}`);
            await seedBreeds(breeds, breedCategoryName, matchedCategoryId);
            totalBreeds += breeds.length;
          } else {
            console.warn(`⚠️ Category '${breedCategoryName}' from breed data not found, skipping ${breeds.length} breeds`);
          }
        } else {
          console.warn(`⚠️ No category found for ${file}, skipping ${breeds.length} breeds`);
        }
      }
    }
    
    console.log('✨ Database seeding completed successfully!');
    console.log(`📊 Total categories: ${Object.keys(categoryMap).length}`);
    console.log(`📊 Total breeds: ${totalBreeds}`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }

}

main()
  .catch((e: Error) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
