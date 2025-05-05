import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { generateOpenApiSpec } from '$lib/swagger';

export const GET: RequestHandler = async () => {
  const openApiSpec = generateOpenApiSpec();
  return json(openApiSpec);
} 