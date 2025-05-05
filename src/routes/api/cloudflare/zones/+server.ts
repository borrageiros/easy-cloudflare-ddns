import type { RequestHandler } from '@sveltejs/kit';
import { successResponse, errorResponse } from '$lib/utils/responses';
import { registerEndpoint } from '$lib/swagger';
import { getZones } from '$lib/utils/cloudflare';
import { requireAuth } from '$lib/auth/verifyAuth';

registerEndpoint({
  path: '/api/cloudflare/zones',
  method: 'get',
  description: 'Get CloudFlare zones',
  tags: ['CloudFlare'],
  security: [{ bearerAuth: [] }],
  responses: {
    '200': {
      description: 'CloudFlare zones retrieved successfully',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'array',
                items: {
                  type: 'object'
                }
              }
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

export const GET: RequestHandler = async (event) => {
  return requireAuth(event, async () => {
    try {
      const zones = await getZones();
      return successResponse({ data: zones });
    } catch (err) {
      console.error('Error getting CloudFlare zones:', err);
      return errorResponse(err instanceof Error ? err.message : 'Failed to get CloudFlare zones', 500);
    }
  });
}; 