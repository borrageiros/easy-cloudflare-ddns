import type { RequestHandler } from '@sveltejs/kit';
import { createUserConfig } from '$lib/db/fileDb';
import { successResponse, errorResponse, badRequestResponse } from '$lib/utils/responses';
import { registerEndpoint } from '$lib/swagger';
import { requireAuth } from '$lib/auth/verifyAuth';

interface ConfigRequest {
  email: string;
  apiKey: string;
  checkInterval?: number;
}

registerEndpoint({
  path: '/api/config/create',
  method: 'post',
  description: 'Create user configuration',
  tags: ['Config'],
  security: [{ bearerAuth: [] }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            email: { type: 'string' },
            apiKey: { type: 'string' },
            checkInterval: { type: 'number' }
          },
          required: ['email', 'apiKey']
        }
      }
    }
  },
  responses: {
    '200': {
      description: 'User configuration created successfully',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  config: {
                    type: 'object',
                    properties: {
                      email: { type: 'string' },
                      apiKey: { type: 'string' },
                      checkInterval: { type: 'number' },
                      lastIp: { type: 'string' },
                      createdAt: { type: 'string' },
                      updatedAt: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '400': {
      description: 'Bad request - missing required fields',
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
    '401': {
      description: 'Unauthorized - invalid or missing token',
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
      const body = await event.request.json() as ConfigRequest;
      
      if (!body.email || !body.apiKey) {
        return badRequestResponse('Email and API key are required');
      }
      
      const clientIp = event.getClientAddress();
      
      const config = await createUserConfig({
        email: body.email,
        apiKey: body.apiKey,
        checkInterval: body.checkInterval,
        lastIp: clientIp
      });
      
      return successResponse({ data: config });
    } catch (err) {
      console.error('Error creating user config:', err);
      return errorResponse('Failed to create user configuration', 500);
    }
  });
}; 