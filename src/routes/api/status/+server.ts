import type { RequestHandler } from '@sveltejs/kit';
import { successResponse, errorResponse } from '$lib/utils/responses';
import { registerEndpoint } from '$lib/swagger';
import { requireAuth } from '$lib/auth/verifyAuth';
import { getIntervalStatus } from '$lib/utils/interval';
import { countZones, countRecords } from '$lib/db/fileDb';

function parseTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
}

registerEndpoint({
  path: '/api/status',
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
        data: {
          lastIp: intervalStatusResponse.lastIp,
          externalIp: intervalStatusResponse.externalIp,
          nextCheck: intervalStatusResponse.nextCheck,
          isIntervalPaused: intervalStatusResponse.isPaused,
          timeParsed: parseTime(intervalStatusResponse.nextCheck),
          zonesCount: await countZones(),
          recordsCount: await countRecords()
        }
      });
    } catch (err) {
      console.error('Error getting records:', err);
      return errorResponse('Failed to retrieve records', 500);
    }
  });
}; 