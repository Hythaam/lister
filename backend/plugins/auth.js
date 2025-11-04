import fp from 'fastify-plugin';
import { User } from '../entities/user.js';

export const Roles = [
  'admin',
  'user'
];

export default fp(async function(fastify) {
  // Register basic auth plugin
  await fastify.register(import('@fastify/basic-auth'), {
    validate: async function(username, password, req, reply) {
      try {
        if (username === 'admin') {
          return;
        }
        // Find user by email
        const user = await fastify.db.getRepository(User).findOneBy({ email: username });
        
        if (!user) {
          return new Error('User not found');
        }
        
        // Verify password
        const isPasswordValid = await fastify.bcrypt.compare(password, user.passwordHash);
        
        if (!isPasswordValid) {
          return new Error('Invalid password');
        }
        
        // Store user in request for later use
        req.requestContext.set('user', {
          id: user.id,
          email: user.email,
          roles: user.roles || []
        });

      } catch (error) {
        return new Error('Authentication failed');
      }
    },
    authenticate: true
  });

  // Decorate fastify with auth methods
  fastify.decorate('auth', {
    // Basic auth handler for routes
    basic: async function(request, reply) {
      try {
        await fastify.basicAuth(request, reply);
      } catch (err) {
        reply.code(401).send({ error: 'Authentication required' });
      }
    },
    injectUser: async function(request, reply) {
      const user = await fastify.db.getRepository(User).findOneBy({ id: request.user.id });
    },
    authorize: function(roles) {
      const requiredSet = new Set(roles);
      return async (request, reply) => {
        const userRoleSet = new Set(request.requestContext.get('user').roles);
        if (!request.requestContext.get('user')) {
          reply.code(401).send({ error: 'Authentication required' });
          return;
        }
        if (!requiredSet.isSubsetOf(userRoleSet)) {
          reply.code(403).send({ error: 'Forbidden' });
          return;
        }
      }
    }
  });
});