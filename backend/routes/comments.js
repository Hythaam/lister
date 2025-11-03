import { ItemComment } from '../entities/itemComment.js';
import { Item } from '../entities/item.js';
import { List } from '../entities/list.js';

// Schema definitions
const commentSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    item: { type: 'string', format: 'uuid' },
    sourceUser: { type: 'string', format: 'uuid' },
    text: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  }
};

const commentCreateSchema = {
  type: 'object',
  required: ['text'],
  properties: {
    text: { type: 'string', minLength: 1, maxLength: 5000 }
  }
};

const commentUpdateSchema = {
  type: 'object',
  properties: {
    text: { type: 'string', minLength: 1, maxLength: 5000 }
  }
};

const errorSchema = {
  type: 'object',
  properties: {
    error: { type: 'string' },
    message: { type: 'string' }
  }
};

// A plugin to encapsulate comment routes
export default async function(fastify) {

  const commentRepository = fastify.db.getRepository(ItemComment);
  const itemRepository = fastify.db.getRepository(Item);
  const listRepository = fastify.db.getRepository(List);

  // Helper function to check if user has access to the item (owns the list)
  async function checkItemAccess(userId, listId, itemId) {
    const list = await listRepository.findOne({
      where: { id: listId, user: userId }
    });
    
    if (!list) {
      return null;
    }

    const item = await itemRepository.findOne({
      where: { id: itemId, list: listId }
    });

    return item;
  }

  // Get all comments for a specific item - requires authentication
  fastify.get('/lists/:listId/items/:itemId/comments', {
    schema: {
      description: 'Get all comments for a specific item',
      tags: ['comments'],
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
        200: {
          type: 'array',
          items: commentSchema
        },
        401: errorSchema,
        403: errorSchema,
        404: errorSchema
      }
    }
  }, async (request, reply) => {
    const { listId, itemId } = request.params;
    const userId = request.user.id;

    // Check if user has access to the item
    const item = await checkItemAccess(userId, listId, itemId);
    if (!item) {
      reply.status(404).send({ error: 'Item not found or access denied' });
      return;
    }

    const comments = await commentRepository.find({
      where: { item: itemId },
      order: { createdAt: 'ASC' }
    });
    
    return comments;
  });

  // Get a specific comment - requires authentication
  fastify.get('/lists/:listId/items/:itemId/comments/:commentId', {
    schema: {
      description: 'Get a specific comment by ID',
      tags: ['comments'],
      security: [{ basicAuth: [] }],
      params: {
        type: 'object',
        properties: {
          listId: { type: 'string', format: 'uuid' },
          itemId: { type: 'string', format: 'uuid' },
          commentId: { type: 'string', format: 'uuid' }
        },
        required: ['listId', 'itemId', 'commentId']
      },
      response: {
        200: commentSchema,
        401: errorSchema,
        403: errorSchema,
        404: errorSchema
      }
    }
  }, async (request, reply) => {
    const { listId, itemId, commentId } = request.params;
    const userId = request.user.id;

    // Check if user has access to the item
    const item = await checkItemAccess(userId, listId, itemId);
    if (!item) {
      reply.status(404).send({ error: 'Item not found or access denied' });
      return;
    }

    const comment = await commentRepository.findOne({
      where: { id: commentId, item: itemId }
    });

    if (!comment) {
      reply.status(404).send({ error: 'Comment not found' });
      return;
    }

    return comment;
  });

  // Create a new comment on an item - requires authentication
  fastify.post('/lists/:listId/items/:itemId/comments', {
    schema: {
      description: 'Create a new comment on an item',
      tags: ['comments'],
      security: [{ basicAuth: [] }],
      params: {
        type: 'object',
        properties: {
          listId: { type: 'string', format: 'uuid' },
          itemId: { type: 'string', format: 'uuid' }
        },
        required: ['listId', 'itemId']
      },
      body: commentCreateSchema,
      response: {
        201: commentSchema,
        400: errorSchema,
        401: errorSchema,
        403: errorSchema,
        404: errorSchema,
        500: errorSchema
      }
    }
  }, async (request, reply) => {
    const { listId, itemId } = request.params;
    const { text } = request.body;
    const userId = request.user.id;

    // Check if user has access to the item
    const item = await checkItemAccess(userId, listId, itemId);
    if (!item) {
      reply.status(404).send({ error: 'Item not found or access denied' });
      return;
    }

    if (!text || text.trim().length === 0) {
      reply.status(400).send({ error: 'Comment text is required and cannot be empty' });
      return;
    }

    try {
      const newComment = commentRepository.create({
        item: itemId,
        sourceUser: userId,
        text: text.trim()
      });
      
      const savedComment = await commentRepository.save(newComment);
      reply.status(201).send(savedComment);
    } catch (error) {
      fastify.log.error(error, 'Failed to create comment');
      reply.status(500).send({ error: 'Failed to create comment' });
    }
  });

  // Update an existing comment - requires authentication and ownership
  fastify.put('/lists/:listId/items/:itemId/comments/:commentId', {
    schema: {
      description: 'Update an existing comment',
      tags: ['comments'],
      security: [{ basicAuth: [] }],
      params: {
        type: 'object',
        properties: {
          listId: { type: 'string', format: 'uuid' },
          itemId: { type: 'string', format: 'uuid' },
          commentId: { type: 'string', format: 'uuid' }
        },
        required: ['listId', 'itemId', 'commentId']
      },
      body: commentUpdateSchema,
      response: {
        200: commentSchema,
        400: errorSchema,
        401: errorSchema,
        403: errorSchema,
        404: errorSchema,
        500: errorSchema
      }
    }
  }, async (request, reply) => {
    const { listId, itemId, commentId } = request.params;
    const { text } = request.body;
    const userId = request.user.id;

    // Check if user has access to the item
    const item = await checkItemAccess(userId, listId, itemId);
    if (!item) {
      reply.status(404).send({ error: 'Item not found or access denied' });
      return;
    }

    if (!text || text.trim().length === 0) {
      reply.status(400).send({ error: 'Comment text is required and cannot be empty' });
      return;
    }

    try {
      const comment = await commentRepository.findOne({
        where: { id: commentId, item: itemId }
      });

      if (!comment) {
        reply.status(404).send({ error: 'Comment not found' });
        return;
      }

      // Check if the user owns the comment
      if (comment.sourceUser !== userId) {
        reply.status(403).send({ error: 'You can only edit your own comments' });
        return;
      }

      comment.text = text.trim();
      const updatedComment = await commentRepository.save(comment);
      return updatedComment;
    } catch (error) {
      fastify.log.error(error, 'Failed to update comment');
      reply.status(500).send({ error: 'Failed to update comment' });
    }
  });

  // Delete a comment - requires authentication and ownership
  fastify.delete('/lists/:listId/items/:itemId/comments/:commentId', {
    schema: {
      description: 'Delete a comment',
      tags: ['comments'],
      security: [{ basicAuth: [] }],
      params: {
        type: 'object',
        properties: {
          listId: { type: 'string', format: 'uuid' },
          itemId: { type: 'string', format: 'uuid' },
          commentId: { type: 'string', format: 'uuid' }
        },
        required: ['listId', 'itemId', 'commentId']
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
    const { listId, itemId, commentId } = request.params;
    const userId = request.user.id;

    // Check if user has access to the item
    const item = await checkItemAccess(userId, listId, itemId);
    if (!item) {
      reply.status(404).send({ error: 'Item not found or access denied' });
      return;
    }

    try {
      const comment = await commentRepository.findOne({
        where: { id: commentId, item: itemId }
      });

      if (!comment) {
        reply.status(404).send({ error: 'Comment not found' });
        return;
      }

      // Check if the user owns the comment
      if (comment.sourceUser !== userId) {
        reply.status(403).send({ error: 'You can only delete your own comments' });
        return;
      }

      await commentRepository.remove(comment);
      reply.status(204).send();
    } catch (error) {
      fastify.log.error(error, 'Failed to delete comment');
      reply.status(500).send({ error: 'Failed to delete comment' });
    }
  });
}