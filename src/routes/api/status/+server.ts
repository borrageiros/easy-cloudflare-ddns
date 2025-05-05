import type { RequestHandler } from '@sveltejs/kit';
import { successResponse, errorResponse } from '$lib/utils/responses';
import { registerEndpoint } from '$lib/swagger';
import { requireAuth } from '$lib/auth/verifyAuth';
import { getIntervalStatus } from '$lib/utils/interval';
import { countZones, countRecords } from '$lib/db/fileDb';

function parseTime(seconds: number): string {
  return new Date(seconds * 1000).toISOString().slice(11, 19);
}

registerEndpoint({
  path: '/status',
  description: 'Get the status of the server',
  method: 'get',
  tags: ['Application'],
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              externalIp: { type: 'string' },
              lastIp: { type: 'string' },
              nextCheck: { type: 'number' },
              timeParsed: { type: 'string' },
              zonesCount: { type: 'number' },
              recordsCount: { type: 'number' }
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
      const intervalStatusResponse = await getIntervalStatus();
      return successResponse({
        lastIp: intervalStatusResponse.lastIp,
        externalIp: intervalStatusResponse.externalIp,
        nextCheck: intervalStatusResponse.nextCheck,
        isIntervalPaused: intervalStatusResponse.isPaused,
        timeParsed: parseTime(intervalStatusResponse.nextCheck),
        zonesCount: await countZones(),
        recordsCount: await countRecords()
      });
    } catch (err) {
      console.error('Error getting records:', err);
      return errorResponse('Failed to retrieve records', 500);
    }
  });
}; 