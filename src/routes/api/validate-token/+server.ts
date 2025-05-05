import type { RequestHandler } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '$lib/jwtSecret';
import { successResponse, unauthorizedResponse } from '$lib/utils/responses';
import { registerEndpoint } from '$lib/swagger';

registerEndpoint({
  path: '/api/validate-token',
  method: 'get',
  description: 'Validate JWT token',
  tags: ['Auth'],
  security: [{ bearerAuth: [] }],
  responses: {
    '200': {
      description: 'Token is valid',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              valid: { type: 'boolean' }
            }
          }
        }
      }
    },
    '401': {
      description: 'Token is invalid or missing',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              valid: { type: 'boolean' },
              error: { type: 'string' }
            }
          }
        }
      }
    }
  }
});

export const GET: RequestHandler = async ({ request }) => {
  // Get the authorization header
  const authHeader = request.headers.get('Authorization');
  
  // If no authorization header, return unauthorized
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return unauthorizedResponse('No valid token provided', { valid: false });
  }
  
  // Extract the token
  const token = authHeader.split(' ')[1];
  
  // Get the JWT secret
  const jwtSecret: string = getJwtSecret();
  
  try {
    // Verify the token
    jwt.verify(token, jwtSecret);
    
    // If verification passes, return success
    return successResponse({ valid: true });
  } catch {
    // If verification fails (expired or invalid), return unauthorized
    return unauthorizedResponse('Token invalid or expired', { valid: false });
  }
} 