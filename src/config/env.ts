import { z } from 'zod';

/**
 * Zod schema for validating application environment variables.
 */
const envSchema = z.object({
  DATABASE_URL: z.string({ required_error: 'DATABASE_URL is required' }),
  JWT_SECRET: z
    .string({ required_error: 'JWT_SECRET is required' })
    .min(10, 'JWT_SECRET must be at least 10 characters'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

/**
 * Parsed and validated environment variables.
 * Throws a ZodError at startup if any required variable is missing or invalid.
 */
export const env = envSchema.parse(process.env);

/**
 * Type definition for validated environment variables.
 */
export type Env = z.infer<typeof envSchema>;
