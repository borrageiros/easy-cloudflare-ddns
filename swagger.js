const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Easy ☁CloudFlare DDNS API',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
        },
      },
    },
    security: [
      {
        apiKeyAuth: [],
      },
    ],
  },
  apis: ['./api/routes/*/*'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
