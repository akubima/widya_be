import { Response } from 'express';

/**
 * Standard success response structure.
 */
export interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

/**
 * Standard paginated response structure.
 */
export interface PaginatedResponse<T> {
  success: true;
  message: string;
  data: T;
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

/**
 * Standard error response structure.
 */
export interface ErrorResponse {
  success: false;
  message: string;
  errors?: unknown;
}

/**
 * Sends a standardized JSON success response.
 *
 * @param res - Express Response object
 * @param data - Payload data to include in response
 * @param message - Descriptive success message (default: 'Success')
 * @param statusCode - HTTP status code (default: 200)
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200
) => {
  const response: SuccessResponse<T> = { success: true, message, data };
  return res.status(statusCode).json(response);
};

/**
 * Sends a standardized JSON paginated response.
 *
 * @param res - Express Response object
 * @param data - Array or list payload data
 * @param meta - Pagination metadata (page, limit, totalItems, totalPages)
 * @param message - Descriptive success message (default: 'Success')
 */
export const sendPaginated = <T>(
  res: Response,
  data: T,
  meta: { page: number; limit: number; totalItems: number; totalPages: number },
  message = 'Success'
) => {
  const response: PaginatedResponse<T> = { success: true, message, data, meta };
  return res.status(200).json(response);
};

/**
 * Sends a standardized JSON error response.
 *
 * @param res - Express Response object
 * @param message - Descriptive error message
 * @param statusCode - HTTP status code (default: 400)
 * @param errors - Optional detailed error payload (validation errors, stack traces, etc.)
 */
export const sendError = (
  res: Response,
  message: string,
  statusCode = 400,
  errors?: unknown
) => {
  const response: ErrorResponse = { success: false, message };
  if (errors !== undefined) response.errors = errors;
  return res.status(statusCode).json(response);
};
