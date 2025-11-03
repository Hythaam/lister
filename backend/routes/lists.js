import { List } from '../entities/list.js';

// Schema definitions
const listSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    user: { type: 'string', format: 'uuid' },
    title: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  }
};

const listCreateSchema = {
  type: 'object',
  required: ['title'],
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 255 }
  }
};

const listUpdateSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 255 }
  }
};

const errorSchema = {
  type: 'object',
  properties: {
    error: { type: 'string' },
    message: { type: 'string' }
  }
};

// A plugin to encapsulate list routes
export default async function(fastify) {

  const listRepository = fastify.db.getRepository(List);

  // Get all lists for the authenticated user
  fastify.get('/lists', {
    schema: {
      description: 'Get all lists for the authenticated user',
      tags: ['lists'],
      security: [{ basicAuth: [] }],
      response: {
        200: {
          type: 'array',
          items: listSchema
        },
        401: errorSchema,
        500: errorSchema
      }
    }
  }, async (request, reply) => {
    const userId = request.user.id;

    try {
      const lists = await listRepository.find({
        where: { user: userId },
        order: { createdAt: 'DESC' }
      });
      
      return lists;
    } catch (error) {
      fastify.log.error(error, 'Failed to fetch lists');
      reply.status(500).send({ error: 'Failed to fetch lists' });
    }
  });

  // Get a specific list by ID - requires authentication and ownership
  fastify.get('/lists/:id', {
    schema: {
      description: 'Get a specific list by ID',
      tags: ['lists'],
      security: [{ basicAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        },
        required: ['id']
      },
      response: {
        200: listSchema,
        401: errorSchema,
        403: errorSchema,
        404: errorSchema,
        500: errorSchema
      }
    }
  }, async (request, reply) => {
    const { id } = request.params;
    const userId = request.user.id;

    try {
      const list = await listRepository.findOne({
        where: { id, user: userId }
      });

      if (!list) {
        reply.status(404).send({ error: 'List not found or access denied' });
        return;
      }

      return list;
    } catch (error) {
      fastify.log.error(error, 'Failed to fetch list');
      reply.status(500).send({ error: 'Failed to fetch list' });
    }
  });

  // Create a new list - requires authentication
  fastify.post('/lists', {
    schema: {
      description: 'Create a new list',
      tags: ['lists'],
      security: [{ basicAuth: [] }],
      body: listCreateSchema,
      response: {
        201: listSchema,
        400: errorSchema,
        401: errorSchema,
        500: errorSchema
      }
    }
  }, async (request, reply) => {
    const { title } = request.body;
    const userId = request.user.id;

    if (!title || title.trim().length === 0) {
      reply.status(400).send({ error: 'Title is required and cannot be empty' });
      return;
    }

    try {
      const newList = listRepository.create({
        title: title.trim(),
        user: userId
      });
      
      const savedList = await listRepository.save(newList);
      reply.status(201).send(savedList);
    } catch (error) {
      fastify.log.error(error, 'Failed to create list');
      reply.status(500).send({ error: 'Failed to create list' });
    }
  });

  // Update an existing list - requires authentication and ownership
  fastify.put('/lists/:id', {
    schema: {
      description: 'Update an existing list',
      tags: ['lists'],
      security: [{ basicAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        },
        required: ['id']
      },
      body: listUpdateSchema,
      response: {
        200: listSchema,
        400: errorSchema,
        401: errorSchema,
        403: errorSchema,
        404: errorSchema,
        500: errorSchema
      }
    }
  }, async (request, reply) => {
    const { id } = request.params;
    const { title } = request.body;
    const userId = request.user.id;

    if (!title || title.trim().length === 0) {
      reply.status(400).send({ error: 'Title is required and cannot be empty' });
      return;
    }

    try {
      const list = await listRepository.findOne({
        where: { id, user: userId }
      });

      if (!list) {
        reply.status(404).send({ error: 'List not found or access denied' });
        return;
      }

      list.title = title.trim();
      const updatedList = await listRepository.save(list);
      return updatedList;
    } catch (error) {
      fastify.log.error(error, 'Failed to update list');
      reply.status(500).send({ error: 'Failed to update list' });
    }
  });

  // Delete a list - requires authentication and ownership
  fastify.delete('/lists/:id', {
    schema: {
      description: 'Delete a list',
      tags: ['lists'],
      security: [{ basicAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        },
        required: ['id']
      },
      response: {
        204: {},
        401: errorSchema,
        403: errorSchema,
        404: errorSchema,
        500: errorSchema
      }
    }
  }, async (request, reply) => {
    const { id } = request.params;
    const userId = request.user.id;

    try {
      const list = await listRepository.findOne({
        where: { id, user: userId }
      });

      if (!list) {
        reply.status(404).send({ error: 'List not found or access denied' });
        return;
      }

      await listRepository.remove(list);
      reply.status(204).send();
    } catch (error) {
      fastify.log.error(error, 'Failed to delete list');
      reply.status(500).send({ error: 'Failed to delete list' });
    }
  });
}