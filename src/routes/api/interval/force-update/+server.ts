import type { RequestHandler } from '@sveltejs/kit';
import { successResponse, errorResponse } from '$lib/utils/responses';
import { registerEndpoint } from '$lib/swagger';
import { requireAuth } from '$lib/auth/verifyAuth';
import { forceCloudflareUpdate } from '$lib/utils/interval';

registerEndpoint({
  path: '/api/interval/force-update',
  description: 'Force update all DNS records to Cloudflare with current IP',
  method: 'post',
  tags: ['Application'],
  security: [{ bearerAuth: [] }],
  responses: {
    200: { 
      description: 'Cloudflare update forced successfully',
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
    500: {
      description: 'Failed to force Cloudflare update',
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
      const success = await forceCloudflareUpdate();
      if (success) {
        return successResponse({
          success: true,
          message: 'All DNS records updated to Cloudflare successfully'
        });
      } else {
        return errorResponse('Failed to force Cloudflare update. No records found or update failed.', 500);
      }
    } catch (err) {
      console.error('Error forcing Cloudflare update:', err);
      return errorResponse('Failed to force Cloudflare update', 500);
    }
  });
};

