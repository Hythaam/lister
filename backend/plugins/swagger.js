import fp from 'fastify-plugin';

/**
 * Swagger Plugin
 * 
 * This plugin encapsulates the Swagger (OpenAPI) documentation setup for the Lister API.
 * It registers both the core Swagger plugin and the Swagger UI for interactive documentation.
 * 
 * Features:
 * - API specification generation
 * - Interactive documentation UI at /docs
 * - Environment-aware configuration
 * - Basic authentication support
 */
async function swaggerPlugin(fastify, opts) {
  // Register Swagger
  await fastify.register(import('@fastify/swagger'), {
    swagger: {
      info: {
        title: 'Lister API',
        description: 'API documentation for the Lister application',
        version: '1.0.0'
      },
      externalDocs: {
        url: 'https://swagger.io',
        description: 'Find more info here'
      },
      host: process.env.SWAGGER_HOST || `localhost:${process.env.PORT || 3000}`,
      schemes: ['http', 'https'],
      consumes: ['application/json'],
      produces: ['application/json'],
      securityDefinitions: {
        basicAuth: {
          type: 'basic'
        }
      }
    }
  });

  // Register Swagger UI
  await fastify.register(import('@fastify/swagger-ui'), {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false
    },
    uiHooks: {
      onRequest: function (request, reply, next) { next() },
      preHandler: function (request, reply, next) { next() }
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject, request, reply) => { return swaggerObject },
    transformSpecificationClone: true
  });
}

export default fp(swaggerPlugin, {
  name: 'swagger'
});