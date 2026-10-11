import { Router } from 'express';
import { itemController } from '../controllers/item.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createItemSchema,
  updateItemSchema,
  deleteItemSchema,
  getItemsSchema,
} from '../schemas/item.schema';

const router = Router();

// All item routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/items:
 *   post:
 *     summary: Create a new item
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - stock
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 example: Laptop ASUS
 *               description:
 *                 type: string
 *                 example: Laptop gaming 16GB RAM
 *               stock:
 *                 type: integer
 *                 minimum: 0
 *                 example: 10
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 example: 15000000
 *     responses:
 *       201:
 *         description: Item created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', validate(createItemSchema), itemController.create);

/**
 * @swagger
 * /api/items:
 *   get:
 *     summary: Get all items with search and pagination
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by item name or description
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page (max 100)
 *     responses:
 *       200:
 *         description: Items retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', validate(getItemsSchema), itemController.findAll);

/**
 * @swagger
 * /api/items/{id}:
 *   get:
 *     summary: Get a single item by ID
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item retrieved successfully
 *       404:
 *         description: Item not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', itemController.findById);

/**
 * @swagger
 * /api/items/{id}:
 *   put:
 *     summary: Update an item
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               stock:
 *                 type: integer
 *                 minimum: 0
 *               price:
 *                 type: number
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Item updated successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Not authorized to update this item
 *       404:
 *         description: Item not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', validate(updateItemSchema), itemController.update);

/**
 * @swagger
 * /api/items/{id}:
 *   delete:
 *     summary: Delete an item
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item deleted successfully
 *       403:
 *         description: Not authorized to delete this item
 *       404:
 *         description: Item not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', validate(deleteItemSchema), itemController.delete);

export default router;
