import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.util';

/**
 * Global error handler middleware.
 * Must be registered LAST in the Express middleware chain.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('[Error]', err.message);

  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  sendError(res, err.message || 'Internal Server Error', 500);
};

/**
 * 404 Not Found handler for undefined routes.
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, `Route ${req.method} ${req.originalUrl} not found`, 404);
};
