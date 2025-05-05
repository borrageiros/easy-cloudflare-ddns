import type { RequestHandler } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { env } from '$env/dynamic/private';
import { getJwtSecret } from '$lib/jwtSecret';
import { successResponse, unauthorizedResponse } from '$lib/utils/responses';
import { registerEndpoint } from '$lib/swagger';

interface LoginRequest {
  password: string;
  rememberSession?: boolean;
}

interface TokenPayload {
  authenticated: boolean;
}

registerEndpoint({
  path: '/api/login',
  method: 'post',
  description: 'Authenticate user with password',
  tags: ['Auth'],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            password: { type: 'string' },
            rememberSession: { type: 'boolean' }
          },
          required: ['password']
        }
      }
    }
  },
  responses: {
    '200': {
      description: 'Successful login',
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
      description: 'Unauthorized - incorrect password',
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
  const { password, rememberSession = false } = await request.json() as LoginRequest;
  
  // Check if the password matches the environment variable
  if (password === env.PASSWORD) {
    // Get the persistent JWT secret
    const jwtSecret: string = getJwtSecret();
    
    // Create a JWT token with the persistent secret
    // If rememberSession is true, don't set an expiration date
    const tokenOptions = rememberSession 
      ? {} 
      : { expiresIn: '24h' };
    
    const token: string = jwt.sign(
      { authenticated: true } as TokenPayload,
      jwtSecret,
      tokenOptions
    );
    
    return successResponse({
      success: true,
      token
    });
  }
  
  // If the password does not match, return an error
  return unauthorizedResponse('Incorrect password', { success: false });
} 