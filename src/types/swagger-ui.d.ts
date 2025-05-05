declare module 'swagger-ui' {
  interface SwaggerUIOptions {
    dom_id: string;
    url: string;
    deepLinking?: boolean;
    presets?: unknown[];
    [key: string]: unknown;
  }
  
  interface SwaggerUIPresets {
    apis: unknown;
    [key: string]: unknown;
  }
  
  interface SwaggerUIInstance {
    (options: SwaggerUIOptions): void;
    presets: SwaggerUIPresets;
  }
  
  const SwaggerUI: SwaggerUIInstance;
  
  export default SwaggerUI;
} 