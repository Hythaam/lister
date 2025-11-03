import { User } from '../entities/user.js';

// A plugin to encapsulate user routes
export default async function(fastify) {

  const userRepository = fastify.db.getRepository(User);

  // Get all users - requires authentication
  fastify.get('/users', {
    preHandler: fastify.auth.authorize(['admin'])
  }, async (request, reply) => {
    fastify.log.info(request.requestContext.getStore(), 'Fetching all users');
    const users = await userRepository.find({
      select: ['id', 'email'] // Don't return password hashes
    }); 
    return users;
  });

  // get user by id - requires authentication
  fastify.get('/users/:id', {
  }, async (request, reply) => {
    const user = await userRepository.findOne({
      where: { id: request.params.id },
      select: ['id', 'email'] // Don't return password hash
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

  // create new user - public (registration)
  fastify.post('/users', async (request, reply) => {
    const { email, password } = request.body;
    
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
        passwordHash: hash,
        roles: ['admin'] // Default role
      });
      const savedUser = await userRepository.save(newUser);
      
      // Return user without password hash
      reply.status(201).send({
        id: savedUser.id,
        email: savedUser.email
      });
    } catch (error) {
      reply.status(500).send({ error: 'Failed to create user' });
    }
  });

  // update user by id - requires authentication (users can only update themselves)
  fastify.put('/users/:id', {
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

    const { email, password, roles } = request.body;

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
    
    if (password) {
      user.passwordHash = await fastify.bcrypt.hash(password);
    }

    if (roles) {
      user.roles = roles;
    }
    
    const updatedUser = await userRepository.save(user);
    
    // Return user without password hash
    return {
      id: updatedUser.id,
      email: updatedUser.email,
      roles: updatedUser.roles
    };
  });

  // delete user by id - requires authentication (users can only delete themselves)
  fastify.delete('/users/:id', {
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

};