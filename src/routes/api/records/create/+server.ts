import type { RequestHandler } from '@sveltejs/kit';
import { createRecord } from '$lib/db/fileDb';
import { successResponse, errorResponse, badRequestResponse } from '$lib/utils/responses';
import { registerEndpoint } from '$lib/swagger';
import { requireAuth } from '$lib/auth/verifyAuth';

interface RecordRequest {
  id: string;
  name: string;
  type: string;
  content: string;
  ttl: number;
  proxied: boolean;
  zoneId: string;
}

registerEndpoint({
  path: '/api/records/create',
  method: 'post',
  description: 'Create DNS record',
  tags: ['Records'],
  security: [{ bearerAuth: [] }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            type: { type: 'string' },
            content: { type: 'string' },
            ttl: { type: 'number' },
            proxied: { type: 'boolean' },
            zoneId: { type: 'string' }
          },
          required: ['name', 'type', 'content', 'zoneId']
        }
      }
    }
  },
  responses: {
    '200': {
      description: 'Record created successfully',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  record: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      type: { type: 'string' },
                      content: { type: 'string' },
                      ttl: { type: 'number' },
                      proxied: { type: 'boolean' },
                      zoneId: { type: 'string' },
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
      const body = await event.request.json() as RecordRequest;
      
      if (!body.name || !body.type || !body.content || !body.zoneId) {
        return badRequestResponse('Name, type, content and zoneId are required');
      }
      
      const record = await createRecord({
        id: body.id,
        name: body.name,
        type: body.type,
        content: body.content,
        ttl: body.ttl || 1,
        proxied: body.proxied || false,
        zoneId: body.zoneId
      });
      
      return successResponse({ record });
    } catch (err) {
      console.error('Error creating record:', err);
      return errorResponse('Failed to create record', 500);
    }
  });
}; 