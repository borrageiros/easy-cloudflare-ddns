import type { RequestHandler } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '$lib/jwtSecret';
import { successResponse, unauthorizedResponse } from '$lib/utils/responses';
import { registerEndpoint } from '$lib/swagger';

interface GenerateTokenRequest {
  rememberSession?: boolean;
}

interface TokenPayload {
  authenticated: boolean;
}

registerEndpoint({
  path: '/api/generate-token',
  method: 'post',
  description: 'Generate a new token using an existing token',
  tags: ['Auth'],
  security: [{ bearerAuth: [] }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            rememberSession: { type: 'boolean' }
          }
        }
      }
    }
  },
  responses: {
    '200': {
      description: 'Token generated successfully',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              token: { type: 'string' }
            }
          }
        }
      }
    },
    '401': {
      description: 'Unauthorized - invalid or expired token',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' }
            }
          }
        }
      }
    }
  }
});

export const POST: RequestHandler = async ({ request }) => {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return unauthorizedResponse('No valid token provided', { success: false });
  }
  
  const token = authHeader.split(' ')[1];
  const jwtSecret: string = getJwtSecret();
  
  try {
    jwt.verify(token, jwtSecret);
    
    const { rememberSession = false } = await request.json() as GenerateTokenRequest;
    
    const tokenOptions = rememberSession 
      ? {} 
      : { expiresIn: '24h' };
    
    const newToken: string = jwt.sign(
      { authenticated: true } as TokenPayload,
      jwtSecret,
      tokenOptions
    );
    
    return successResponse({
      success: true,
      token: newToken
    });
  } catch {
    return unauthorizedResponse('Token invalid or expired', { success: false });
  }
} 