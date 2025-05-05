import type { RequestEvent } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '$lib/jwtSecret';
import { unauthorizedResponse } from '$lib/utils/responses';

// Define the JWT payload type
export interface JwtPayload {
  userId?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

// Define the authentication result type
type AuthResult = 
  | { isAuthenticated: true; token: JwtPayload }
  | { isAuthenticated: false; response: Response };

/**
 * Verifies if the request has a valid JWT token
 * @param event - The incoming request event
 * @returns An object with auth status and response if unauthorized
 */
export async function verifyAuth(event: RequestEvent): Promise<AuthResult> {
  // Get the authorization header
  const authHeader = event.request.headers.get('Authorization');
  
  // If no authorization header, return unauthorized
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      isAuthenticated: false,
      response: unauthorizedResponse('No valid token provided')
    };
  }
  
  // Extract the token
  const token = authHeader.split(' ')[1];
  
  // Get the JWT secret
  const jwtSecret: string = getJwtSecret();
  
  try {
    // Verify the token
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    
    // Return authentication success and decoded token
    return {
      isAuthenticated: true,
      token: decoded
    };
  } catch {
    // If verification fails (expired or invalid), return unauthorized
    return {
      isAuthenticated: false,
      response: unauthorizedResponse('Token invalid or expired')
    };
  }
}

/**
 * Middleware to protect routes that require authentication
 * @param event - The request event
 * @param callback - The function to execute if authentication passes
 */
export async function requireAuth(
  event: RequestEvent, 
  callback: (event: RequestEvent, token: JwtPayload) => Promise<Response>
): Promise<Response> {
  const auth = await verifyAuth(event);
  
  if (!auth.isAuthenticated) {
    return auth.response;
  }
  
  return callback(event, auth.token);
} 