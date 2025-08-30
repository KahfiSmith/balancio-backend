import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// Allow either MONGODB_URI or DATABASE_URL and fallback appropriately
const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),

  // Database
  MONGODB_URI: z.string().optional(),
  DATABASE_URL: z.string().optional(),

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
  // Cloudflare Images (Optional)
  CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
  CLOUDFLARE_API_TOKEN: z.string().optional(),

  // Frontend
  FRONTEND_URL: z.string().default('http://localhost:3000'),

  // Security
  BCRYPT_ROUNDS: z.coerce.number().default(12),

  // API Keys (Optional)
  ENCRYPTION_KEY: z.string().optional(),
  WEBHOOK_SECRET: z.string().optional(),
}).superRefine((data, ctx) => {
  // Ensure at least one of the DB URLs is provided
  if (!data.MONGODB_URI && !data.DATABASE_URL) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Either MONGODB_URI or DATABASE_URL must be provided',
      path: ['MONGODB_URI'],
    });
  }
});

const parseConfig = () => {
  try {
    const parsed = configSchema.parse(process.env);

    // Fallback MONGODB_URI to DATABASE_URL if not provided (for Mongoose)
    const MONGODB_URI = parsed.MONGODB_URI ?? parsed.DATABASE_URL;

    // Prisma expects DATABASE_URL in process.env at runtime; we don't mutate it here.
    // We only ensure our config has a usable Mongo URI for mongoose.
    return {
      ...parsed,
      MONGODB_URI: MONGODB_URI as string,
    } as typeof parsed & { MONGODB_URI: string };
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
