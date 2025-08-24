import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  
  // Database
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required for Prisma'),
  
  // JWT
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  JWT_EXPIRES_IN: z.string().default('1h'),
  JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  // Email (Optional for development)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  
  // File Upload (Optional for development)
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  
  // Frontend
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  
  // Security
  BCRYPT_ROUNDS: z.coerce.number().default(12),
  
  // API Keys (Optional)
  ENCRYPTION_KEY: z.string().optional(),
  WEBHOOK_SECRET: z.string().optional(),
});

const parseConfig = () => {
  try {
    return configSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      error.issues.forEach((err: z.ZodIssue) => {
        const path = err.path.length > 0 ? err.path.join('.') : 'root';
        console.error(`${path}: ${err.message}`);
      });
    } else {
      console.error('❌ Configuration error:', error);
    }
    process.exit(1);
  }
};

export const config = parseConfig();