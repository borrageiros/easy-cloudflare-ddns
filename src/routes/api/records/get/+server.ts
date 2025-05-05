import type { RequestHandler } from '@sveltejs/kit';
import { getRecords } from '$lib/db/fileDb';
import { successResponse, errorResponse } from '$lib/utils/responses';
import { registerEndpoint } from '$lib/swagger';
import { requireAuth } from '$lib/auth/verifyAuth';

registerEndpoint({
  path: '/api/records/get',
  method: 'get',
  description: 'Get all DNS records',
  tags: ['Records'],
  security: [{ bearerAuth: [] }],
  responses: {
    '200': {
      description: 'Records retrieved successfully',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  records: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        type: { type: 'string' },
                        content: { type: 'string' },
                        ttl: { type: 'number' },
                        proxied: { type: 'boolean' },
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
      const records = await getRecords();
      return successResponse({ records });
    } catch (err) {
      console.error('Error getting records:', err);
      return errorResponse('Failed to retrieve records', 500);
    }
  });
}; 