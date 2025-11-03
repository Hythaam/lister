import { ItemComment } from '../entities/itemComment.js';
import { Item } from '../entities/item.js';
import { List } from '../entities/list.js';
import { Group } from '../entities/group.js';
import { User } from '../entities/user.js';

// Schema definitions
const commentSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    item: { type: 'string', format: 'uuid' },
    sourceUser: { type: 'string', format: 'uuid' },
    authorName: { type: 'string' },
    authorEmail: { type: 'string', format: 'email' },
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
  const groupRepository = fastify.db.getRepository(Group);
  const userRepository = fastify.db.getRepository(User);

  // Helper function to check comment access according to the requirements
  // Users can see/add comments on shared lists but NOT on lists they own
  async function checkCommentAccess(userId, listId, itemId) {
    // First, check if the list exists and get its owner
    const list = await listRepository.findOne({
      where: { id: listId }
    });
    
    if (!list) {
      return null;
    }

    // Rule: List owners cannot see comments on their own lists
    if (list.user === userId) {
      return { canAccess: false, reason: 'List owners cannot see comments on their own lists' };
    }

    // Check if list is shared with any groups the user belongs to
    const sharedList = await listRepository
      .createQueryBuilder('list')
      .leftJoinAndSelect('list.sharedWithGroups', 'group')
      .leftJoinAndSelect('group.members', 'member')
      .where('list.id = :listId', { listId })
      .andWhere('(group.createdBy = :userId OR member.id = :userId)', { userId })
      .getOne();

    if (!sharedList || !sharedList.sharedWithGroups || sharedList.sharedWithGroups.length === 0) {
      return { canAccess: false, reason: 'List is not shared with any groups you belong to' };
    }

    // Check if the item exists in this list
    const item = await itemRepository.findOne({
      where: { id: itemId, list: listId }
    });

    if (!item) {
      return null;
    }

    return { canAccess: true, list, item };
  }

  // Get all comments for a specific item - requires authentication and proper access
  fastify.get('/lists/:listId/items/:itemId/comments', {
    schema: {
      description: 'Get all comments for a specific item (not available for list owners)',
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

    // Check comment access according to requirements
    const accessResult = await checkCommentAccess(userId, listId, itemId);
    if (!accessResult) {
      reply.status(404).send({ error: 'Item not found or access denied' });
      return;
    }

    if (!accessResult.canAccess) {
      reply.status(403).send({ error: accessResult.reason });
      return;
    }

    const comments = await commentRepository.find({
      where: { item: itemId },
      relations: ['sourceUser'],
      order: { createdAt: 'ASC' }
    });
    
    // Transform comments to include author information
    const commentsWithAuthor = comments.map(comment => ({
      id: comment.id,
      item: comment.item,
      sourceUser: comment.sourceUser.id,
      authorName: comment.sourceUser.name,
      authorEmail: comment.sourceUser.email,
      text: comment.text,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt
    }));
    
    return commentsWithAuthor;
  });

  // Get a specific comment - requires authentication and proper access
  fastify.get('/lists/:listId/items/:itemId/comments/:commentId', {
    schema: {
      description: 'Get a specific comment by ID (not available for list owners)',
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

    // Check comment access according to requirements
    const accessResult = await checkCommentAccess(userId, listId, itemId);
    if (!accessResult) {
      reply.status(404).send({ error: 'Item not found or access denied' });
      return;
    }

    if (!accessResult.canAccess) {
      reply.status(403).send({ error: accessResult.reason });
      return;
    }

    const comment = await commentRepository.findOne({
      where: { id: commentId, item: itemId },
      relations: ['sourceUser']
    });

    if (!comment) {
      reply.status(404).send({ error: 'Comment not found' });
      return;
    }

    // Transform comment to include author information
    const commentWithAuthor = {
      id: comment.id,
      item: comment.item,
      sourceUser: comment.sourceUser.id,
      authorName: comment.sourceUser.name,
      authorEmail: comment.sourceUser.email,
      text: comment.text,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt
    };

    return commentWithAuthor;
  });

  // Create a new comment on an item - requires authentication and proper access
  fastify.post('/lists/:listId/items/:itemId/comments', {
    schema: {
      description: 'Create a new comment on an item (not available for list owners)',
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

    // Check comment access according to requirements
    const accessResult = await checkCommentAccess(userId, listId, itemId);
    if (!accessResult) {
      reply.status(404).send({ error: 'Item not found or access denied' });
      return;
    }

    if (!accessResult.canAccess) {
      reply.status(403).send({ error: accessResult.reason });
      return;
    }

    if (!text || text.trim().length === 0) {
      reply.status(400).send({ error: 'Comment text is required and cannot be empty' });
      return;
    }

    try {
      // Check comment limit per item (100 comments max)
      const commentCount = await commentRepository.count({
        where: { item: itemId }
      });

      if (commentCount >= 100) {
        reply.status(400).send({ error: 'Item has reached the maximum limit of 100 comments' });
        return;
      }

      const newComment = commentRepository.create({
        item: itemId,
        sourceUser: userId,
        text: text.trim()
      });
      
      const savedComment = await commentRepository.save(newComment);
      
      // Fetch the saved comment with author information
      const commentWithAuthor = await commentRepository.findOne({
        where: { id: savedComment.id },
        relations: ['sourceUser']
      });
      
      // Transform comment to include author information
      const response = {
        id: commentWithAuthor.id,
        item: commentWithAuthor.item,
        sourceUser: commentWithAuthor.sourceUser.id,
        authorName: commentWithAuthor.sourceUser.name,
        authorEmail: commentWithAuthor.sourceUser.email,
        text: commentWithAuthor.text,
        createdAt: commentWithAuthor.createdAt,
        updatedAt: commentWithAuthor.updatedAt
      };
      
      reply.status(201).send(response);
    } catch (error) {
      fastify.log.error(error, 'Failed to create comment');
      reply.status(500).send({ error: 'Failed to create comment' });
    }
  });

  // Update an existing comment - requires authentication, proper access, and ownership
  fastify.put('/lists/:listId/items/:itemId/comments/:commentId', {
    schema: {
      description: 'Update an existing comment (not available for list owners)',
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

    // Check comment access according to requirements
    const accessResult = await checkCommentAccess(userId, listId, itemId);
    if (!accessResult) {
      reply.status(404).send({ error: 'Item not found or access denied' });
      return;
    }

    if (!accessResult.canAccess) {
      reply.status(403).send({ error: accessResult.reason });
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

  // Delete a comment - requires authentication, proper access, and ownership
  fastify.delete('/lists/:listId/items/:itemId/comments/:commentId', {
    schema: {
      description: 'Delete a comment (not available for list owners)',
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

    // Check comment access according to requirements
    const accessResult = await checkCommentAccess(userId, listId, itemId);
    if (!accessResult) {
      reply.status(404).send({ error: 'Item not found or access denied' });
      return;
    }

    if (!accessResult.canAccess) {
      reply.status(403).send({ error: accessResult.reason });
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