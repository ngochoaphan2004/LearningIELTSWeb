const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'IELTS Learning API',
      version: '1.0.0',
      description: 'API documentation for the IELTS Learning Network',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/*.js'], // Quét tất cả file js trong thư mục routes để tìm OpenAPI annotation
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs,
};
