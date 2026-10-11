import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' })
      .email('Invalid email format'),
    username: z.string({ required_error: 'Username is required' })
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username must be at most 30 characters'),
    password: z.string({ required_error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' })
      .email('Invalid email format'),
    password: z.string({ required_error: 'Password is required' }),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
