import type { RequestHandler } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '$lib/jwtSecret';
import { errorResponse, successResponse } from '$lib/utils/responses';
import { registerEndpoint } from '$lib/swagger';
import { requireAuth } from '$lib/auth/verifyAuth';

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

export const POST: RequestHandler = async (event) => {
  return requireAuth(event, async () => {
    try {
      const authHeader = event.request.headers.get('Authorization');      
      const token = authHeader?.split(' ')[1];
      const jwtSecret: string = getJwtSecret();
      jwt.verify(token, jwtSecret);
    
      let rememberSession = false;
      const requestBody = await event.request.json() as GenerateTokenRequest;
      rememberSession = requestBody?.rememberSession ?? false;
      
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
    } catch (err) {
      console.error('Error generating token:', err);
      return errorResponse('Error generating token', 500);
    }
  });
} 