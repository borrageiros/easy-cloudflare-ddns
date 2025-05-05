import type { RequestHandler } from '@sveltejs/kit';
import { successResponse, errorResponse } from '$lib/utils/responses';
import { registerEndpoint } from '$lib/swagger';
import { verifyCredentials } from '$lib/utils/cloudflare';
import { requireAuth } from '$lib/auth/verifyAuth';

interface Credentials {
  email: string;
  apiKey: string;
}

registerEndpoint({
  path: '/api/cloudflare/verify-credentials',
  method: 'post',
  description: 'Verify CloudFlare credentials',
  tags: ['CloudFlare'],
  security: [{ bearerAuth: [] }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            email: { type: 'string' },
            apiKey: { type: 'string' }
          },
          required: ['email', 'apiKey']
        }
      }
    }
  },
  responses: {
    '200': {
      description: 'Credentials verification result',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' }
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
    },
    '500': {
      description: 'Server error',
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
  return requireAuth(event, async (event) => {
    try {
      const { email, apiKey } = await event.request.json() as Credentials;
      
      if (!email || !apiKey) {
        return errorResponse('Email and API key are required', 400);
      }
      
      const isValid = await verifyCredentials(email, apiKey);
      
      if (isValid) {
        return successResponse({ message: 'Credentials verified successfully', isValid: true });
      } else {
        return errorResponse('Invalid credentials', 401);
      }
    } catch (err) {
      console.error('Error verifying credentials:', err);
      return errorResponse('Failed to verify credentials', 500);
    }
  });
}; 