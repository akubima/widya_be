import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

/**
 * Payload encoded inside the JWT authentication token.
 */
export interface TokenPayload {
  userId: number;
  email: string;
}

/**
 * Generates a signed JWT token for the specified user payload.
 *
 * @param payload - Authenticated user payload containing userId and email
 * @returns Encrypted JWT token string
 */
export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  });
};

/**
 * Verifies and decodes a JWT token.
 *
 * @param token - Bearer or raw JWT string to verify
 * @returns Decoded TokenPayload containing userId and email
 * @throws JsonWebTokenError or TokenExpiredError if invalid or expired
 */
export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
};
