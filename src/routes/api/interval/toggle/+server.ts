import type { RequestHandler } from '@sveltejs/kit';
import { successResponse, errorResponse } from '$lib/utils/responses';
import { registerEndpoint } from '$lib/swagger';
import { requireAuth } from '$lib/auth/verifyAuth';
import { pauseInterval, resumeInterval, getIntervalStatus, getSecondsUntilnextCheck } from '$lib/utils/interval';

registerEndpoint({
  path: '/api/interval/toggle',
  description: 'Toggle interval status between paused and running',
  method: 'post',
  tags: ['Application'],
  security: [{ bearerAuth: [] }],
  responses: {
    '200': {
      description: 'Interval status toggled successfully',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  paused: { type: 'boolean' },
                  nextCheck: { type: 'number' }
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
    }
  }
});

export const POST: RequestHandler = async (event) => {
  return requireAuth(event, async () => {
    try {
      const intervalStatus = await getIntervalStatus();
      let success = false;
      
      if (intervalStatus.isPaused) {
        success = resumeInterval();
      } else {
        success = pauseInterval();
      }
      
      if (success) {
        return successResponse({
          paused: !intervalStatus.isPaused,
          nextCheck: getSecondsUntilnextCheck()
        });
      } else {
        return errorResponse('Failed to toggle interval status', 500);
      }
    } catch (err) {
      console.error('Error toggling interval status:', err);
      return errorResponse('Failed to toggle interval status', 500);
    }
  });
}; 