export interface SwaggerEndpoint {
  path: string;
  description: string;
  tags?: string[];
  method: 'get' | 'post' | 'put' | 'delete';
  requestBody?: {
    required: boolean;
    content: {
      'application/json': {
        schema: {
          type: string;
          properties: Record<string, unknown>;
          required?: string[];
        };
      };
    };
  };
  responses: Record<
    string,
    {
      description: string;
      content?: {
        'application/json': {
          schema: {
            type: string;
            properties: Record<string, unknown>;
          };
        };
      };
    }
  >;
  security?: Array<Record<string, string[]>>;
}

// Define the interface for HTTP methods and their configurations
export interface PathMethodConfig {
  description: string;
  tags?: string[];
  responses: Record<
    string,
    {
      description: string;
      content?: {
        'application/json': {
          schema: {
            type: string;
            properties: Record<string, unknown>;
          };
        };
      };
    }
  >;
  requestBody?: {
    required: boolean;
    content: {
      'application/json': {
        schema: {
          type: string;
          properties: Record<string, unknown>;
          required?: string[];
        };
      };
    };
  };
  security?: Array<Record<string, string[]>>;
}

export interface SwaggerConfig {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  paths: Record<string, Record<string, PathMethodConfig>>;
  components?: {
    securitySchemes?: Record<
      string,
      {
        type: string;
        scheme?: string;
        bearerFormat?: string;
        in?: string;
        name?: string;
      }
    >;
    schemas?: Record<string, unknown>;
  };
  tags?: Array<{name: string; description?: string}>;
}

const baseConfig: SwaggerConfig = {
  openapi: '3.0.0',
  info: {
    title: 'CloudFlare DDNS API',
    version: '1.0.0',
    description: 'API for CloudFlare DDNS service'
  },
  paths: {},
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  tags: []
};

export const endpoints: SwaggerEndpoint[] = [];

export function registerEndpoint(endpoint: SwaggerEndpoint) {
  endpoints.push(endpoint);
}

export function generateOpenApiSpec(): SwaggerConfig {
  const config = { ...baseConfig };
  const uniqueTags = new Set<string>();
  
  for (const endpoint of endpoints) {
    if (!config.paths[endpoint.path]) {
      config.paths[endpoint.path] = {};
    }
    
    const methodConfig: PathMethodConfig = {
      description: endpoint.description,
      responses: endpoint.responses
    };
    
    if (endpoint.requestBody) {
      methodConfig.requestBody = endpoint.requestBody;
    }
    
    if (endpoint.security) {
      methodConfig.security = endpoint.security;
    }
    
    if (endpoint.tags) {
      methodConfig.tags = endpoint.tags;
      // Collect unique tags
      endpoint.tags.forEach(tag => uniqueTags.add(tag));
    }
    
    (config.paths[endpoint.path] as Record<string, PathMethodConfig>)[endpoint.method] = methodConfig;
  }
  
  // Generate unique tags for documentation
  config.tags = Array.from(uniqueTags).map(tag => ({
    name: tag
  }));
  
  return config;
} 