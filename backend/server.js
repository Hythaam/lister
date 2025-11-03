import fastify from 'fastify';
import fs from 'fs/promises';
import path from 'path';
const server = fastify({
  logger: true
});

// Register Swagger plugin
server.register(await import('./plugins/swagger.js'));

server.register(await import('@fastify/cors'), { origin: true });
server.register(await import('@fastify/helmet'));
server.register((await import('@fastify/request-context')).fastifyRequestContext); // For per-request context
server.register(await import('fastify-bcrypt')); // Password hashing plugin

server.register(await import('./plugins/db.js')); // Database plugin
server.register(await import('./plugins/auth.js')); // Auth plugin with basic auth support

// Health check route
server.get('/health', {
  schema: {
    description: 'Health check endpoint',
    tags: ['health'],
    response: {
      200: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' }
        }
      }
    }
  }
}, async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// API routes
server.register( async function (server) {
    server.addHook('preHandler', server.basicAuth);
    server.register(await import('./routes/users.js'));
    server.register(await import('./routes/lists.js'));
    server.register(await import('./routes/items.js'));
    server.register(await import('./routes/comments.js'));
    server.register(await import('./routes/groups.js'));
  },
  { prefix: '/api' }
);

// Start the server
const start = async () => {
  try {
    const port = process.env.PORT || 3000;
    const host = process.env.HOST || '0.0.0.0';

    await server.listen({ port, host });
    console.log(`🚀 Server running at http://localhost:${port}`);
    
    // Save OpenAPI spec to file
    try {
      const spec = server.swagger();
      const specPath = path.join(process.cwd(), '..', 'docs', 'backend-openapi.json');
      
      // Ensure docs directory exists
      await fs.mkdir(path.dirname(specPath), { recursive: true });
      
      // Write the OpenAPI spec to file
      await fs.writeFile(specPath, JSON.stringify(spec, null, 2), 'utf8');
      console.log(`📄 OpenAPI spec saved to ${specPath}`);
    } catch (specError) {
      console.error('Failed to save OpenAPI spec:', specError);
    }
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  await server.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  await server.close();
  process.exit(0);
});

start();