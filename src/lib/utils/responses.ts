import { json } from '@sveltejs/kit';

/**
 * Common response types
 */
export interface ApiResponseData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/**
 * Generates a success response
 * @param data The data to return
 */
export function successResponse(data: Record<string, unknown>) {
  return json({
    success: true,
    ...data
  });
}

/**
 * Generates an error response
 * @param message Error message
 * @param status HTTP status code
 * @param additionalData Additional data to include in the response
 */
export function errorResponse(message: string, status = 500) {
  return json(
    {
      success: false,
      error: message
    },
    { status }
  );
}

/**
 * Generates a 401 Unauthorized response
 * @param message Custom error message
 * @param additionalData Additional data to include in the response
 */
export function unauthorizedResponse(message: string, data: Record<string, unknown> = {}) {
  return json(
    {
      success: false,
      error: message,
      ...data
    },
    { status: 401 }
  );
}

/**
 * Generates a 404 Not Found response
 * @param message Custom error message
 * @param additionalData Additional data to include in the response
 */
export function notFoundResponse(message: string = 'Resource not found') {
  return errorResponse(message, 404);
}

/**
 * Generates a 403 Forbidden response
 * @param message Custom error message
 * @param additionalData Additional data to include in the response
 */
export function forbiddenResponse(message: string = 'Access forbidden') {
  return errorResponse(message, 403);
}

/**
 * Generates a 500 Internal Server Error response
 * @param message Custom error message
 * @param additionalData Additional data to include in the response
 */
export function serverErrorResponse(message: string = 'Internal server error') {
  return errorResponse(message, 500);
}

/**
 * Generates a 400 Bad Request response
 * @param message Custom error message
 * @param additionalData Additional data to include in the response
 */
export function badRequestResponse(message: string, data: Record<string, unknown> = {}) {
  return json(
    {
      success: false,
      error: message,
      ...data
    },
    { status: 400 }
  );
}
