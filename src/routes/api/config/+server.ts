import type { RequestHandler } from '@sveltejs/kit';
import { getUserConfig } from '$lib/db/fileDb';
import { successResponse, errorResponse } from '$lib/utils/responses';
import { registerEndpoint } from '$lib/swagger';
import { requireAuth } from '$lib/auth/verifyAuth';

registerEndpoint({
  path: '/api/config',
  method: 'get',
  description: 'Get user configuration',
  tags: ['Config'],
  security: [{ bearerAuth: [] }],
  responses: {
    '200': {
      description: 'User configuration retrieved successfully',
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

export const GET: RequestHandler = async (event) => {
  return requireAuth(event, async () => {
    try {
      const config = await getUserConfig();
      return successResponse({ data: config });
    } catch (err) {
      console.error('Error getting user config:', err);
      return errorResponse('Failed to get user configuration', 500);
    }
  });
}; 