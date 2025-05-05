import type { RequestHandler } from '@sveltejs/kit';
import { getZones } from '$lib/db/fileDb';
import { successResponse, errorResponse } from '$lib/utils/responses';
import { registerEndpoint } from '$lib/swagger';
import { requireAuth } from '$lib/auth/verifyAuth';

registerEndpoint({
  path: '/api/zones/get',
  method: 'get',
  description: 'Get all zones',
  tags: ['Zones'],
  security: [{ bearerAuth: [] }],
  responses: {
    '200': {
      description: 'Zones retrieved successfully',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  zones: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        status: { type: 'string' },
                        paused: { type: 'boolean' },
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
      const zones = await getZones();
      return successResponse({ zones });
    } catch (err) {
      console.error('Error getting zones:', err);
      return errorResponse('Failed to retrieve zones', 500);
    }
  });
}; 