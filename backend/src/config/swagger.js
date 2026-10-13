const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'School Management System (SMS) API',
    version: '1.0.0',
    description: 'Enterprise REST API documentation for the School Management System based on the school_data database.',
    contact: {
      name: 'St. Lawrence School IT Team',
      email: 'admin@stlawrence.edu'
    }
  },
  servers: [
    {
      url: 'http://localhost:5000/api',
      description: 'Local Development Server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ]
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.js', './src/controllers/*.js']
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
