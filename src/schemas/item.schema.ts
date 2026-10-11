import { z } from 'zod';

export const createItemSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Item name is required' })
      .min(1, 'Item name cannot be empty')
      .max(255, 'Item name must be at most 255 characters'),
    description: z.string().max(1000, 'Description must be at most 1000 characters').optional(),
    stock: z.number({ required_error: 'Stock is required' })
      .int('Stock must be an integer')
      .min(0, 'Stock cannot be negative'),
    price: z.number({ required_error: 'Price is required' })
      .min(0, 'Price cannot be negative'),
  }),
});

export const updateItemSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive('Item ID must be a positive integer'),
  }),
  body: z.object({
    name: z.string()
      .min(1, 'Item name cannot be empty')
      .max(255, 'Item name must be at most 255 characters')
      .optional(),
    description: z.string().max(1000, 'Description must be at most 1000 characters').optional(),
    stock: z.number()
      .int('Stock must be an integer')
      .min(0, 'Stock cannot be negative')
      .optional(),
    price: z.number()
      .min(0, 'Price cannot be negative')
      .optional(),
  }),
});

export const deleteItemSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive('Item ID must be a positive integer'),
  }),
});

export const getItemsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
  }),
});

export type CreateItemInput = z.infer<typeof createItemSchema>['body'];
export type UpdateItemInput = z.infer<typeof updateItemSchema>['body'];
export type GetItemsQuery = z.infer<typeof getItemsSchema>['query'];
