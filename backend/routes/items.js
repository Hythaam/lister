import { Item } from '../entities/item.js';
import { List } from '../entities/list.js';

// Schema definitions
const itemSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    list: { type: 'string', format: 'uuid' },
    title: { type: 'string' },
    description: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  }
};

const itemCreateSchema = {
  type: 'object',
  required: ['title'],
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 255 },
    description: { type: 'string' }
  }
};

const itemUpdateSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 255 },
    description: { type: 'string' }
  }
};

const errorSchema = {
  type: 'object',
  properties: {
    error: { type: 'string' },
    message: { type: 'string' }
  }
};

// A plugin to encapsulate item routes
export default async function(fastify) {

  const itemRepository = fastify.db.getRepository(Item);
  const listRepository = fastify.db.getRepository(List);

  // Helper function to check if user owns the list
  async function checkListOwnership(userId, listId) {
    const list = await listRepository.findOne({
      where: { id: listId, user: userId }
    });
    return list;
  }

  // Get all items for a specific list - requires authentication
  fastify.get('/lists/:listId/items', {
    schema: {
      description: 'Get all items for a specific list',
      tags: ['items'],
      security: [{ basicAuth: [] }],
      params: {
        type: 'object',
        properties: {
          listId: { type: 'string', format: 'uuid' }
        },
        required: ['listId']
      },
      response: {
        200: {
          type: 'array',
          items: itemSchema
        },
        401: errorSchema,
        403: errorSchema,
        404: errorSchema
      }
    }
  }, async (request, reply) => {
    const { listId } = request.params;
    const userId = request.user.id;

    // Check if user owns the list
    const list = await checkListOwnership(userId, listId);
    if (!list) {
      reply.status(404).send({ error: 'List not found or access denied' });
      return;
    }

    const items = await itemRepository.find({
      where: { list: listId },
      order: { createdAt: 'ASC' }
    });
    
    return items;
  });

  // Get a specific item - requires authentication
  fastify.get('/lists/:listId/items/:itemId', {
    schema: {
      description: 'Get a specific item by ID',
      tags: ['items'],
      security: [{ basicAuth: [] }],
      params: {
        type: 'object',
        properties: {
          listId: { type: 'string', format: 'uuid' },
          itemId: { type: 'string', format: 'uuid' }
        },
        required: ['listId', 'itemId']
      },
      response: {
        200: itemSchema,
        401: errorSchema,
        403: errorSchema,
        404: errorSchema
      }
    }
  }, async (request, reply) => {
    const { listId, itemId } = request.params;
    const userId = request.user.id;

    // Check if user owns the list
    const list = await checkListOwnership(userId, listId);
    if (!list) {
      reply.status(404).send({ error: 'List not found or access denied' });
      return;
    }

    const item = await itemRepository.findOne({
      where: { id: itemId, list: listId }
    });

    if (!item) {
      reply.status(404).send({ error: 'Item not found' });
      return;
    }

    return item;
  });

  // Create a new item in a list - requires authentication
  fastify.post('/lists/:listId/items', {
    schema: {
      description: 'Create a new item in a list',
      tags: ['items'],
      security: [{ basicAuth: [] }],
      params: {
        type: 'object',
        properties: {
          listId: { type: 'string', format: 'uuid' }
        },
        required: ['listId']
      },
      body: itemCreateSchema,
      response: {
        201: itemSchema,
        400: errorSchema,
        401: errorSchema,
        403: errorSchema,
        404: errorSchema,
        500: errorSchema
      }
    }
  }, async (request, reply) => {
    const { listId } = request.params;
    const { title, description } = request.body;
    const userId = request.user.id;

    // Check if user owns the list
    const list = await checkListOwnership(userId, listId);
    if (!list) {
      reply.status(404).send({ error: 'List not found or access denied' });
      return;
    }

    try {
      const newItem = itemRepository.create({
        list: listId,
        title,
        description: description || null
      });
      
      const savedItem = await itemRepository.save(newItem);
      reply.status(201).send(savedItem);
    } catch (error) {
      fastify.log.error(error, 'Failed to create item');
      reply.status(500).send({ error: 'Failed to create item' });
    }
  });

  // Update an existing item - requires authentication
  fastify.put('/lists/:listId/items/:itemId', {
    schema: {
      description: 'Update an existing item',
      tags: ['items'],
      security: [{ basicAuth: [] }],
      params: {
        type: 'object',
        properties: {
          listId: { type: 'string', format: 'uuid' },
          itemId: { type: 'string', format: 'uuid' }
        },
        required: ['listId', 'itemId']
      },
      body: itemUpdateSchema,
      response: {
        200: itemSchema,
        400: errorSchema,
        401: errorSchema,
        403: errorSchema,
        404: errorSchema,
        500: errorSchema
      }
    }
  }, async (request, reply) => {
    const { listId, itemId } = request.params;
    const { title, description } = request.body;
    const userId = request.user.id;

    // Check if user owns the list
    const list = await checkListOwnership(userId, listId);
    if (!list) {
      reply.status(404).send({ error: 'List not found or access denied' });
      return;
    }

    try {
      const item = await itemRepository.findOne({
        where: { id: itemId, list: listId }
      });

      if (!item) {
        reply.status(404).send({ error: 'Item not found' });
        return;
      }

      // Update only provided fields
      if (title !== undefined) item.title = title;
      if (description !== undefined) item.description = description;

      const updatedItem = await itemRepository.save(item);
      return updatedItem;
    } catch (error) {
      fastify.log.error(error, 'Failed to update item');
      reply.status(500).send({ error: 'Failed to update item' });
    }
  });

  // Delete an item - requires authentication
  fastify.delete('/lists/:listId/items/:itemId', {
    schema: {
      description: 'Delete an item',
      tags: ['items'],
      security: [{ basicAuth: [] }],
      params: {
        type: 'object',
        properties: {
          listId: { type: 'string', format: 'uuid' },
          itemId: { type: 'string', format: 'uuid' }
        },
        required: ['listId', 'itemId']
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
    const { listId, itemId } = request.params;
    const userId = request.user.id;

    // Check if user owns the list
    const list = await checkListOwnership(userId, listId);
    if (!list) {
      reply.status(404).send({ error: 'List not found or access denied' });
      return;
    }

    try {
      const item = await itemRepository.findOne({
        where: { id: itemId, list: listId }
      });

      if (!item) {
        reply.status(404).send({ error: 'Item not found' });
        return;
      }

      await itemRepository.remove(item);
      reply.status(204).send();
    } catch (error) {
      fastify.log.error(error, 'Failed to delete item');
      reply.status(500).send({ error: 'Failed to delete item' });
    }
  });
}