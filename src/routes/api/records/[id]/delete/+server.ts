import type { RequestHandler } from '@sveltejs/kit';
import { deleteRecord } from '$lib/db/fileDb';
import { successResponse, errorResponse, notFoundResponse } from '$lib/utils/responses';
import { registerEndpoint } from '$lib/swagger';
import { requireAuth } from '$lib/auth/verifyAuth';

registerEndpoint({
  path: '/api/records/{id}/delete',
  method: 'delete',
  description: 'Delete DNS record by ID',
  tags: ['Records'],
  security: [{ bearerAuth: [] }],
  responses: {
    '200': {
      description: 'Record deleted successfully',
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

export const DELETE: RequestHandler = async (event) => {
  return requireAuth(event, async () => {
    try {
      const id = event.params.id;
      
      if (!id) {
        return notFoundResponse('Record ID is required');
      }
      
      const deleted = await deleteRecord(id);
      
      if (!deleted) {
        return notFoundResponse('Record not found');
      }
      
      return successResponse({ message: 'Record deleted successfully' });
    } catch (err) {
      console.error('Error deleting record:', err);
      return errorResponse('Failed to delete record', 500);
    }
  });
}; 