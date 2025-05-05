import type { RequestHandler } from '@sveltejs/kit';
import { updateRecord } from '$lib/db/fileDb';
import { successResponse, errorResponse, notFoundResponse } from '$lib/utils/responses';
import { registerEndpoint } from '$lib/swagger';
import { requireAuth } from '$lib/auth/verifyAuth';

interface RecordUpdateRequest {
  name?: string;
  type?: string;
  content?: string;
  ttl?: number;
  proxied?: boolean;
}

registerEndpoint({
  path: '/api/records/{id}/update',
  method: 'put',
  description: 'Update DNS record by ID',
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
            proxied: { type: 'boolean' }
          }
        }
      }
    }
  },
  responses: {
    '200': {
      description: 'Record updated successfully',
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
      description: 'Bad request - no fields to update',
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
    '404': {
      description: 'Record not found',
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

export const PUT: RequestHandler = async (event) => {
  return requireAuth(event, async () => {
    try {
      const id = event.params.id;
      
      if (!id) {
        return notFoundResponse('Record ID is required');
      }
      
      const body = await event.request.json() as RecordUpdateRequest;
      
      // Check if at least one field is provided for update
      if (Object.keys(body).length === 0) {
        return errorResponse('No fields provided for update', 400);
      }
      
      const updatedRecord = await updateRecord(id, body);
      
      if (!updatedRecord) {
        return notFoundResponse('Record not found');
      }
      
      return successResponse({ record: updatedRecord });
    } catch (err) {
      console.error('Error updating record:', err);
      return errorResponse('Failed to update record', 500);
    }
  });
}; 