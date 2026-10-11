import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/token.util';
import { sendError } from '../utils/response.util';

/**
 * Middleware to protect routes that require authentication.
 * Extracts and verifies the JWT from the Authorization header.
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'Access denied. No token provided.', 401);
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    sendError(res, 'Invalid or expired token.', 401);
    return;
  }
};
