import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Inventory Management API',
      version: '1.0.0',
      description: 'RESTful API for a simple Inventory Management System built with Express, TypeScript, Prisma, and PostgreSQL.',
      contact: {
        name: 'Developer',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Items', description: 'Item CRUD endpoints' },
    ],
  },
  apis: [
    process.env.NODE_ENV === 'production'
      ? './dist/routes/*.js'
      : './src/routes/*.ts',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
