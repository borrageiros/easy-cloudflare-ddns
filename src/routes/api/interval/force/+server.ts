import type { RequestHandler } from '@sveltejs/kit';
import { successResponse, errorResponse } from '$lib/utils/responses';
import { registerEndpoint } from '$lib/swagger';
import { requireAuth } from '$lib/auth/verifyAuth';
import { forceExecution } from '$lib/utils/interval';

registerEndpoint({
  path: '/api/interval/force',
  description: 'Force the interval to execute',
  method: 'post',
  tags: ['Application'],
  responses: {
    200: { 
      description: 'Interval forced execution successful',
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
    }
  }
});

export const POST: RequestHandler = async (event) => {
  return requireAuth(event, async () => {
    try {
      const success = forceExecution();
      if (success) {
        return successResponse({
          success: true,
          message: 'Interval forced execution'
        });
      } else {
        return errorResponse('Failed to force interval execution', 500);
      }
    } catch (err) {
      console.error('Error forcing interval execution:', err);
      return errorResponse('Failed to force interval execution', 500);
    }
  });
}; 