import type { RequestHandler } from '@sveltejs/kit';
import { updateUserConfig } from '$lib/db/fileDb';
import { successResponse, errorResponse } from '$lib/utils/responses';
import { registerEndpoint } from '$lib/swagger';
import { requireAuth } from '$lib/auth/verifyAuth';
import { initializeInterval } from '$lib/utils/interval';

interface UpdateConfigRequest {
  email?: string;
  apiKey?: string;
  checkInterval?: number;
}

registerEndpoint({
  path: '/api/config/update',
  method: 'post',
  description: 'Update user configuration',
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
          }
        }
      }
    }
  },
  responses: {
    '200': {
      description: 'User configuration updated successfully',
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

export const POST: RequestHandler = async (event) => {
  return requireAuth(event, async (event) => {
    try {
      const body = await event.request.json() as UpdateConfigRequest;
      const updates: UpdateConfigRequest & { lastIp?: string } = { ...body };
      
      if (Object.keys(updates).length === 0) {
        return successResponse({ message: 'No updates provided' });
      }
      
      const config = await updateUserConfig(updates);
      
      if (updates.checkInterval) {
        await initializeInterval();
      }
      return successResponse({ data: config });
    } catch (err) {
      console.error('Error updating user config:', err);
      return errorResponse('Failed to update user configuration', 500);
    }
  });
}; 