import { prisma } from '../config/database';
import { CreateItemInput, UpdateItemInput, GetItemsQuery } from '../schemas/item.schema';
import { Prisma } from '@prisma/client';

export class ItemService {
  /**
   * Create a new item belonging to the authenticated user.
   */
  async create(userId: number, data: CreateItemInput) {
    const item = await prisma.item.create({
      data: {
        name: data.name,
        description: data.description,
        stock: data.stock,
        price: data.price,
        userId,
      },
    });
    return item;
  }

  /**
   * Get all items with search and pagination.
   * Search matches against item name and description (case-insensitive).
   */
  async findAll(query: GetItemsQuery) {
    const { search, page, limit } = query;

    // Build the where clause for search
    const where: Prisma.ItemWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    // Execute count and findMany in parallel for efficiency
    const [totalItems, items] = await Promise.all([
      prisma.item.count({ where }),
      prisma.item.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, username: true },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      items,
      meta: { page, limit, totalItems, totalPages },
    };
  }

  /**
   * Get a single item by ID.
   */
  async findById(id: number) {
    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, username: true },
        },
      },
    });
    if (!item) {
      throw new Error('Item not found');
    }
    return item;
  }

  /**
   * Update an item. Only the owner can update their items.
   */
  async update(id: number, userId: number, data: UpdateItemInput) {
    // Check item existence and ownership
    const existingItem = await prisma.item.findUnique({ where: { id } });
    if (!existingItem) {
      throw new Error('Item not found');
    }
    if (existingItem.userId !== userId) {
      throw new Error('You are not authorized to update this item');
    }

    const updatedItem = await prisma.item.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.stock !== undefined && { stock: data.stock }),
        ...(data.price !== undefined && { price: data.price }),
      },
    });
    return updatedItem;
  }

  /**
   * Delete an item. Only the owner can delete their items.
   */
  async delete(id: number, userId: number) {
    const existingItem = await prisma.item.findUnique({ where: { id } });
    if (!existingItem) {
      throw new Error('Item not found');
    }
    if (existingItem.userId !== userId) {
      throw new Error('You are not authorized to delete this item');
    }

    await prisma.item.delete({ where: { id } });
    return { message: 'Item deleted successfully' };
  }
}

export const itemService = new ItemService();
