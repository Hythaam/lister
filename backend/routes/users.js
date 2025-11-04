import { User } from '../entities/user.js';

// Schema definitions
const userSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    email: { type: 'string', format: 'email' },
    name: { type: 'string' },
    activated: { type: 'boolean' },
    roles: { type: 'array', items: { type: 'string' } }
  }
};

const userCreateSchema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: { type: 'string', format: 'email' },
    name: { type: 'string', maxLength: 255 },
    password: { type: 'string', minLength: 6 }
  }
};

const userUpdateSchema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email' },
    name: { type: 'string', maxLength: 255 },
    password: { type: 'string', minLength: 6 },
    activated: { type: 'boolean' },
    roles: { type: 'array', items: { type: 'string' } }
  }
};

const userInviteSchema = {
  type: 'object',
  required: ['email'],
  properties: {
    email: { type: 'string', format: 'email' },
    name: { type: 'string', maxLength: 255 }
  }
};

const errorSchema = {
  type: 'object',
  properties: {
    error: { type: 'string' },
    message: { type: 'string' }
  }
};

// A plugin to encapsulate user routes
export default async function(fastify) {

  const userRepository = fastify.db.getRepository(User);

  // Get all users - requires authentication
  fastify.get('/users', {
    schema: {
      description: 'Get all users',
      tags: ['users'],
      security: [{ basicAuth: [] }],
      response: {
        200: {
          type: 'array',
          items: userSchema
        },
        401: errorSchema,
        403: errorSchema
      }
    },
    preHandler: fastify.auth.authorize(['admin'])
  }, async (request, reply) => {
    fastify.log.info(request.requestContext.getStore(), 'Fetching all users');
    const users = await userRepository.find({
      select: ['id', 'email', 'name', 'activated'] // Don't return password hashes
    }); 
    return users;
  });

  // get user by id - requires authentication
  fastify.get('/users/:id', {
    schema: {
      description: 'Get user by ID',
      tags: ['users'],
      security: [{ basicAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        },
        required: ['id']
      },
      response: {
        200: userSchema,
        401: errorSchema,
        403: errorSchema,
        404: errorSchema
      }
    }
  }, async (request, reply) => {
    const user = await userRepository.findOne({
      where: { id: request.params.id },
      select: ['id', 'email', 'name', 'activated'] // Don't return password hash
    });
    if (!user) {
      reply.status(404).send({ message: 'User not found' });
      return;
    }
    if (request.user.id !== request.params.id) {
      reply.status(403).send({ error: 'You can only access your own profile' });
      return;
    }
    return user;
  });

  // Get current authenticated user details
  fastify.get('/users/me', {
    schema: {
      description: 'Get current authenticated user details',
      tags: ['users'],
      security: [{ basicAuth: [] }],
      response: {
        200: userSchema,
        401: errorSchema
      }
    }
  }, async (request, reply) => {
    const currentUser = request.requestContext.get('user');
    
    if (!currentUser) {
      reply.status(401).send({ error: 'User not authenticated' });
      return;
    }

    // Fetch fresh user data from database
    const user = await userRepository.findOne({
      where: { id: currentUser.id },
      select: ['id', 'email', 'name', 'activated', 'roles'] // Don't return password hash
    });

    if (!user) {
      reply.status(401).send({ error: 'User not found' });
      return;
    }

    return user;
  });

  // Update current authenticated user details
  fastify.put('/users/me', {
    schema: {
      description: 'Update current authenticated user details',
      tags: ['users'],
      security: [{ basicAuth: [] }],
      body: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          name: { type: 'string', maxLength: 255 }
        }
      },
      response: {
        200: userSchema,
        401: errorSchema,
        409: errorSchema
      }
    }
  }, async (request, reply) => {
    const currentUser = request.requestContext.get('user');
    
    if (!currentUser) {
      reply.status(401).send({ error: 'User not authenticated' });
      return;
    }

    const user = await userRepository.findOneBy({ id: currentUser.id });
    if (!user) {
      reply.status(401).send({ error: 'User not found' });
      return;
    }

    const { email, name } = request.body;

    if (email) {
      // Check if email is already taken by another user
      const existingUser = await userRepository.findOne({
        where: { email },
        select: ['id']
      });
      if (existingUser && existingUser.id !== user.id) {
        reply.status(409).send({ error: 'Email already taken' });
        return;
      }
      user.email = email;
    }
    
    if (name !== undefined) {
      user.name = name;
    }
    
    const updatedUser = await userRepository.save(user);
    
    // Return user without password hash
    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      activated: updatedUser.activated,
      roles: updatedUser.roles
    };
  });

  // Change password for current authenticated user
  fastify.post('/users/change-password', {
    schema: {
      description: 'Change password for current authenticated user',
      tags: ['users'],
      security: [{ basicAuth: [] }],
      body: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: { type: 'string' },
          newPassword: { type: 'string', minLength: 6 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        },
        401: errorSchema,
        400: errorSchema
      }
    }
  }, async (request, reply) => {
    const currentUser = request.requestContext.get('user');
    
    if (!currentUser) {
      reply.status(401).send({ error: 'User not authenticated' });
      return;
    }

    const { currentPassword, newPassword } = request.body;

    // Fetch user with password hash
    const user = await userRepository.findOneBy({ id: currentUser.id });
    if (!user) {
      reply.status(401).send({ error: 'User not found' });
      return;
    }

    // Verify current password
    const isCurrentPasswordValid = await fastify.bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      reply.status(400).send({ error: 'Current password is incorrect' });
      return;
    }

    // Update password
    user.passwordHash = await fastify.bcrypt.hash(newPassword);
    await userRepository.save(user);

    return { message: 'Password changed successfully' };
  });

  // create new user - public (registration)
  fastify.post('/users', {
    schema: {
      description: 'Create a new user (registration)',
      tags: ['users'],
      body: userCreateSchema,
      response: {
        201: userSchema,
        400: errorSchema,
        409: errorSchema,
        500: errorSchema
      }
    }
  }, async (request, reply) => {
    const { email, name, password } = request.body;
    
    if (!email || !password) {
      reply.status(400).send({ error: 'Email and password are required' });
      return;
    }

    try {
      // Check if user already exists
      const existingUser = await userRepository.findOneBy({ email });
      if (existingUser) {
        reply.status(409).send({ error: 'User already exists' });
        return;
      }

      const hash = await fastify.bcrypt.hash(password);
      const newUser = userRepository.create({
        email,
        name: name || null,
        passwordHash: hash,
        activated: false, // Default to not activated - users must activate via /activate endpoint
        roles: ['user'] // Default role for new registrations
      });
      const savedUser = await userRepository.save(newUser);
      
      // Return user without password hash
      reply.status(201).send({
        id: savedUser.id,
        email: savedUser.email,
        name: savedUser.name,
        activated: savedUser.activated
      });
    } catch (error) {
      reply.status(500).send({ error: 'Failed to create user' });
    }
  });

  // update user by id - requires authentication (users can only update themselves)
  fastify.put('/users/:id', {
    schema: {
      description: 'Update user by ID',
      tags: ['users'],
      security: [{ basicAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        },
        required: ['id']
      },
      body: userUpdateSchema,
      response: {
        200: userSchema,
        401: errorSchema,
        403: errorSchema,
        404: errorSchema,
        409: errorSchema
      }
    }
  }, async (request, reply) => {
    // Check if user is trying to update their own profile
    if (request.requestContext.get('user').id !== request.params.id) {
      reply.status(403).send({ error: 'You can only update your own profile' });
      return;
    }

    const user = await userRepository.findOneBy({ id: request.params.id });
    if (!user) {
      reply.status(404).send({ message: 'User not found' });
      return;
    }

    const { email, name, password, activated, roles } = request.body;

    if (email) {
      // Check if email is already taken by another user
      const existingUser = await userRepository.findOne({
        where: { email },
        select: ['id']
      });
      if (existingUser && existingUser.id !== user.id) {
        reply.status(409).send({ error: 'Email already taken' });
        return;
      }
      user.email = email;
    }
    
    if (name !== undefined) {
      user.name = name;
    }
    
    if (password) {
      user.passwordHash = await fastify.bcrypt.hash(password);
    }

    if (activated !== undefined) {
      user.activated = activated;
    }

    if (roles) {
      user.roles = roles;
    }
    
    const updatedUser = await userRepository.save(user);
    
    // Return user without password hash
    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      activated: updatedUser.activated,
      roles: updatedUser.roles
    };
  });

  // delete user by id - requires authentication (users can only delete themselves)
  fastify.delete('/users/:id', {
    schema: {
      description: 'Delete user by ID',
      tags: ['users'],
      security: [{ basicAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        },
        required: ['id']
      },
      response: {
        204: { type: 'null' },
        401: errorSchema,
        403: errorSchema,
        404: errorSchema
      }
    },
    preHandler: fastify.auth.authorize(['admin'])
  }, async (request, reply) => {
    // Check if user is trying to delete their own profile
    if (request.requestContext.get('user').id !== request.params.id) {
      reply.status(403).send({ error: 'You can only delete your own profile' });
      return;
    }

    const user = await userRepository.findOneBy({ id: request.params.id });
    if (!user) {
      reply.status(404).send({ message: 'User not found' });
      return;
    }
    await userRepository.remove(user);
    reply.status(204).send();
  });

  // Helper function to send invitation email (mock implementation)
  async function sendInvitationEmail(email, name, tempPassword) {
    // In a real implementation, this would integrate with an email service
    // For now, we'll just log the invitation details
    fastify.log.info(`Invitation email would be sent to: ${email}`);
    fastify.log.info(`Name: ${name || 'Not provided'}`);
    fastify.log.info(`Temporary password: ${tempPassword}`);
    fastify.log.info(`Login URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`);
    
    // TODO: Integrate with actual email service (SendGrid, SES, etc.)
    return true;
  }

  // Invite a user - creates inactive user and sends invitation email
  fastify.post('/users/invite', {
    schema: {
      description: 'Invite a new user by email',
      tags: ['users'],
      security: [{ basicAuth: [] }],
      body: userInviteSchema,
      response: {
        201: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            user: userSchema
          }
        },
        400: errorSchema,
        401: errorSchema,
        409: errorSchema,
        500: errorSchema
      }
    }
  }, async (request, reply) => {
    const { email, name } = request.body;
    
    if (!email) {
      reply.status(400).send({ error: 'Email is required' });
      return;
    }

    try {
      // Check if user already exists
      const existingUser = await userRepository.findOneBy({ email });
      if (existingUser) {
        reply.status(409).send({ error: 'User with this email already exists' });
        return;
      }

      const defaultPassword = 'default';
      const hash = await fastify.bcrypt.hash(defaultPassword);
      
      const newUser = userRepository.create({
        email,
        name: name || null,
        passwordHash: hash,
        activated: false, // User is not activated until they log in and change password
        roles: ['user'] // Default role for invited users
      });
      
      const savedUser = await userRepository.save(newUser);
      
      // Send invitation email
      try {
        await sendInvitationEmail(email, name, defaultPassword);
      } catch (emailError) {
        fastify.log.error(emailError, 'Failed to send invitation email');
        // Don't fail the request if email sending fails
      }
      
      // Return success response
      reply.status(201).send({
        message: 'User invitation sent successfully',
        user: {
          id: savedUser.id,
          email: savedUser.email,
          name: savedUser.name,
          activated: savedUser.activated
        }
      });
    } catch (error) {
      fastify.log.error(error, 'Failed to invite user');
      reply.status(500).send({ error: 'Failed to invite user' });
    }
  });

  // Search users by email for autocomplete - requires authentication
  fastify.get('/users/search', {
    schema: {
      description: 'Search users by email for autocomplete',
      tags: ['users'],
      security: [{ basicAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          email: { type: 'string', minLength: 1 }
        },
        required: ['email']
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              email: { type: 'string', format: 'email' },
              name: { type: 'string' }
            }
          }
        },
        400: errorSchema,
        401: errorSchema,
        500: errorSchema
      }
    }
  }, async (request, reply) => {
    const { email } = request.query;
    
    if (!email) {
      reply.status(400).send({ error: 'Email parameter is required' });
      return;
    }

    try {
      // Search for users with email containing the search term (case insensitive)
      const users = await userRepository
        .createQueryBuilder('user')
        .select(['user.id', 'user.email', 'user.name'])
        .where('LOWER(user.email) LIKE LOWER(:email)', { email: `%${email}%` })
        .andWhere('user.activated = :activated', { activated: true })
        .limit(10) // Limit results for autocomplete
        .getMany();
      
      return users;
    } catch (error) {
      fastify.log.error(error, 'Failed to search users');
      reply.status(500).send({ error: 'Failed to search users' });
    }
  });

  // Activate user account - public endpoint for account activation
  fastify.post('/activate', {
    schema: {
      description: 'Activate user account with name and password',
      tags: ['users'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          name: { type: 'string', maxLength: 255 },
          password: { type: 'string', minLength: 6 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            user: userSchema
          }
        },
        400: errorSchema,
        404: errorSchema,
        409: errorSchema,
        500: errorSchema
      }
    }
  }, async (request, reply) => {
    const { email, name, password } = request.body;
    
    if (!email || !password) {
      reply.status(400).send({ error: 'Email and password are required' });
      return;
    }

    try {
      // Find user by email
      const user = await userRepository.findOneBy({ email });
      if (!user) {
        reply.status(404).send({ error: 'User not found' });
        return;
      }

      // Check if user is already activated
      if (user.activated) {
        reply.status(409).send({ error: 'User account is already activated' });
        return;
      }

      // Update user with new name and password
      if (name !== undefined) {
        user.name = name;
      }
      
      user.passwordHash = await fastify.bcrypt.hash(password);
      user.activated = true;
      
      const updatedUser = await userRepository.save(user);
      
      // Return success response
      reply.status(200).send({
        message: 'Account activated successfully',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          activated: updatedUser.activated
        }
      });
    } catch (error) {
      fastify.log.error(error, 'Failed to activate user');
      reply.status(500).send({ error: 'Failed to activate user' });
    }
  });

};