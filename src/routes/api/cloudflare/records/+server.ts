import type { RequestHandler } from '@sveltejs/kit';
import { successResponse, errorResponse, badRequestResponse } from '$lib/utils/responses';
import { registerEndpoint } from '$lib/swagger';
import { getRecords } from '$lib/utils/cloudflare';
import { requireAuth } from '$lib/auth/verifyAuth';

registerEndpoint({
  path: '/api/cloudflare/records',
  method: 'get',
  description: 'Get DNS records for a zone. Requires zoneId query parameter.',
  tags: ['CloudFlare'],
  security: [{ bearerAuth: [] }],
  responses: {
    '200': {
      description: 'DNS records retrieved successfully',
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
    '400': {
      description: 'Bad request - missing required parameters',
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
  return requireAuth(event, async (event) => {
    try {
      const zoneId = event.url.searchParams.get('zoneId');
      
      if (!zoneId) {
        return badRequestResponse('Zone ID is required');
      }
      
      const records = await getRecords(zoneId);
      return successResponse({ data: records });
    } catch (err) {
      console.error('Error getting DNS records:', err);
      return errorResponse(err instanceof Error ? err.message : 'Failed to get DNS records', 500);
    }
  });
}; 