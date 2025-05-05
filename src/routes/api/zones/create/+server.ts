import type { RequestHandler } from '@sveltejs/kit';
import { createZone } from '$lib/db/fileDb';
import { successResponse, errorResponse, badRequestResponse } from '$lib/utils/responses';
import { registerEndpoint } from '$lib/swagger';
import { requireAuth } from '$lib/auth/verifyAuth';

interface ZoneRequest {
  id: string;
  name: string;
}

registerEndpoint({
  path: '/api/zones/create',
  method: 'post',
  description: 'Create zone',
  tags: ['Zones'],
  security: [{ bearerAuth: [] }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            status: { type: 'string' },
            paused: { type: 'boolean' }
          },
          required: ['name', 'status']
        }
      }
    }
  },
  responses: {
    '200': {
      description: 'Zone created successfully',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  zone: {
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
    },
    '400': {
      description: 'Bad request - missing required fields',
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
      const body = await event.request.json() as ZoneRequest;
      
      if (!body.id || !body.name) {
        return badRequestResponse('ID and Name are required');
      }
      
      const zone = await createZone({
        id: body.id,
        name: body.name
      });
      
      return successResponse({ zone });
    } catch (err) {
      console.error('Error creating zone:', err);
      return errorResponse('Failed to create zone', 500);
    }
  });
}; 