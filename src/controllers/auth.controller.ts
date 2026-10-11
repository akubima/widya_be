import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response.util';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body);
      sendSuccess(res, result, 'User registered successfully', 201);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('already')) {
          sendError(res, error.message, 409);
          return;
        }
      }
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body);
      sendSuccess(res, result, 'Login successful');
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Invalid')) {
          sendError(res, error.message, 401);
          return;
        }
      }
      next(error);
    }
  }
}

export const authController = new AuthController();
