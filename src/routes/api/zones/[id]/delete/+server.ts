import type { RequestHandler } from '@sveltejs/kit';
import { deleteZone, getRecords } from '$lib/db/fileDb';
import { successResponse, errorResponse, notFoundResponse } from '$lib/utils/responses';
import { registerEndpoint } from '$lib/swagger';
import { requireAuth } from '$lib/auth/verifyAuth';

registerEndpoint({
  path: '/api/zones/{id}/delete',
  method: 'delete',
  description: 'Delete zone by ID',
  tags: ['Zones'],
  security: [{ bearerAuth: [] }],
  responses: {
    '200': {
      description: 'Zone deleted successfully',
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
    '400': {
      description: 'Bad request - Zone has associated records',
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
      description: 'Zone not found',
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
        return notFoundResponse('Zone ID is required');
      }
      
      // Check if there are records associated with this zone
      const records = await getRecords();
      const hasAssociatedRecords = records.some(record => record.zoneId === id);
      
      if (hasAssociatedRecords) {
        return errorResponse('Cannot delete a zone with associated records. Delete the records first.', 400);
      }
      
      const deleted = await deleteZone(id);
      
      if (!deleted) {
        return notFoundResponse('Zone not found');
      }
      
      return successResponse({ message: 'Zone deleted successfully' });
    } catch (err) {
      console.error('Error deleting zone:', err);
      return errorResponse('Failed to delete zone', 500);
    }
  });
}; 