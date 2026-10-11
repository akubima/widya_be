import { JwtPayload } from 'jsonwebtoken';

/**
 * Type declaration merging for Express Request.
 * Extends Express.Request with optional authenticated user payload.
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        email: string;
      };
    }
  }
}

export {};
