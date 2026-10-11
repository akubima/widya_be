import { Request, Response, NextFunction } from 'express';
import { itemService } from '../services/item.service';
import { sendSuccess, sendPaginated, sendError } from '../utils/response.util';

export class ItemController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const item = await itemService.create(userId, req.body);
      sendSuccess(res, item, 'Item created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, page = 1, limit = 10 } = req.query;
      const result = await itemService.findAll({
        search: search as string | undefined,
        page: Number(page),
        limit: Number(limit),
      });
      sendPaginated(res, result.items, result.meta, 'Items retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(String(req.params.id));
      const item = await itemService.findById(id);
      sendSuccess(res, item, 'Item retrieved successfully');
    } catch (error) {
      if (error instanceof Error && error.message === 'Item not found') {
        sendError(res, error.message, 404);
        return;
      }
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(String(req.params.id));
      const userId = req.user!.userId;
      const item = await itemService.update(id, userId, req.body);
      sendSuccess(res, item, 'Item updated successfully');
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Item not found') {
          sendError(res, error.message, 404);
          return;
        }
        if (error.message.includes('not authorized')) {
          sendError(res, error.message, 403);
          return;
        }
      }
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(String(req.params.id));
      const userId = req.user!.userId;
      const result = await itemService.delete(id, userId);
      sendSuccess(res, result, 'Item deleted successfully');
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Item not found') {
          sendError(res, error.message, 404);
          return;
        }
        if (error.message.includes('not authorized')) {
          sendError(res, error.message, 403);
          return;
        }
      }
      next(error);
    }
  }
}

export const itemController = new ItemController();
