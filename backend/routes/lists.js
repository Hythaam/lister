import { List } from '../entities/list.js';
import { Group } from '../entities/group.js';
import { User } from '../entities/user.js';

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
  const groupRepository = fastify.db.getRepository(Group);
  const userRepository = fastify.db.getRepository(User);

  // Helper function to check if user has access to a list
  async function checkListAccess(userId, listId) {
    // First check if user owns the list
    const ownedList = await listRepository.findOne({
      where: { id: listId, user: userId }
    });
    
    if (ownedList) {
      return { list: ownedList, isOwner: true };
    }

    // Check if list is shared with any groups the user belongs to
    const list = await listRepository
      .createQueryBuilder('list')
      .leftJoinAndSelect('list.sharedWithGroups', 'group')
      .leftJoinAndSelect('group.members', 'member')
      .where('list.id = :listId', { listId })
      .andWhere('(group.createdBy = :userId OR member.id = :userId)', { userId })
      .getOne();

    if (list && list.sharedWithGroups && list.sharedWithGroups.length > 0) {
      return { list, isOwner: false };
    }

    return null;
  }

  // Get all lists for the authenticated user
  fastify.get('/lists', {
    schema: {
      description: 'Get all lists accessible to the user (owned + shared)',
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
      // Get lists owned by the user
      const ownedLists = await listRepository.find({
        where: { user: userId },
        order: { createdAt: 'DESC' }
      });

      // Get lists shared with groups the user belongs to
      const sharedLists = await listRepository
        .createQueryBuilder('list')
        .leftJoinAndSelect('list.sharedWithGroups', 'group')
        .leftJoinAndSelect('group.members', 'member')
        .where('list.user != :userId', { userId }) // Exclude own lists
        .andWhere('(group.createdBy = :userId OR member.id = :userId)', { userId })
        .orderBy('list.createdAt', 'DESC')
        .getMany();

      // Combine and deduplicate lists
      const allLists = [...ownedLists];
      
      // Add shared lists that aren't already in the owned lists
      for (const sharedList of sharedLists) {
        if (!allLists.find(list => list.id === sharedList.id)) {
          allLists.push(sharedList);
        }
      }

      // Sort combined list by creation date (newest first)
      allLists.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      return allLists;
    } catch (error) {
      fastify.log.error(error, 'Failed to fetch lists');
      reply.status(500).send({ error: 'Failed to fetch lists' });
    }
  });

  // Get a specific list by ID - requires authentication and access (ownership or group membership)
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
      const accessResult = await checkListAccess(userId, id);

      if (!accessResult) {
        reply.status(404).send({ error: 'List not found or access denied' });
        return;
      }

      return accessResult.list;
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
      // Check user list creation limit (100 lists max)
      const userListCount = await listRepository.count({
        where: { user: userId }
      });

      if (userListCount >= 100) {
        reply.status(400).send({ error: 'You have reached the maximum limit of 100 lists' });
        return;
      }

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

  // Share a list with groups - requires list ownership
  fastify.post('/lists/:id/share', {
    schema: {
      description: 'Share a list with groups',
      tags: ['lists'],
      security: [{ basicAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        required: ['groupIds'],
        properties: {
          groupIds: {
            type: 'array',
            items: { type: 'string', format: 'uuid' }
          }
        }
      },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } },
        400: errorSchema,
        401: errorSchema,
        403: errorSchema,
        404: errorSchema,
        500: errorSchema
      }
    }
  }, async (request, reply) => {
    const { id } = request.params;
    const { groupIds } = request.body;
    const userId = request.user.id;

    try {
      // Check if user owns the list
      const list = await listRepository.findOne({
        where: { id, user: userId },
        relations: ['sharedWithGroups']
      });

      if (!list) {
        reply.status(404).send({ error: 'List not found or access denied' });
        return;
      }

      // Check list sharing limit (100 groups max)
      const currentSharedGroupCount = list.sharedWithGroups ? list.sharedWithGroups.length : 0;
      if (currentSharedGroupCount + groupIds.length > 100) {
        reply.status(400).send({ error: 'List cannot be shared with more than 100 groups total' });
        return;
      }

      // Verify all groups exist and user is a member
      const groups = [];
      for (const groupId of groupIds) {
        const group = await groupRepository
          .createQueryBuilder('group')
          .leftJoinAndSelect('group.members', 'member')
          .where('group.id = :groupId', { groupId })
          .getOne();

        if (!group) {
          reply.status(404).send({ error: `Group ${groupId} not found` });
          return;
        }

        // Check if user is creator or member of the group
        const isMember = group.members?.some(member => member.id === userId) || group.createdBy === userId;
        if (!isMember) {
          reply.status(403).send({ error: `You are not a member of group ${groupId}` });
          return;
        }

        groups.push(group);
      }

      // Add groups to list's shared groups (avoid duplicates)
      if (!list.sharedWithGroups) {
        list.sharedWithGroups = [];
      }

      for (const group of groups) {
        const isAlreadyShared = list.sharedWithGroups.some(sharedGroup => sharedGroup.id === group.id);
        if (!isAlreadyShared) {
          list.sharedWithGroups.push(group);
        }
      }

      await listRepository.save(list);
      reply.status(200).send({ message: 'List shared successfully' });
    } catch (error) {
      fastify.log.error(error, 'Failed to share list');
      reply.status(500).send({ error: 'Failed to share list' });
    }
  });

  // Unshare a list from a specific group - requires list ownership
  fastify.delete('/lists/:id/share/:groupId', {
    schema: {
      description: 'Unshare a list from a specific group',
      tags: ['lists'],
      security: [{ basicAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          groupId: { type: 'string', format: 'uuid' }
        },
        required: ['id', 'groupId']
      },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } },
        401: errorSchema,
        403: errorSchema,
        404: errorSchema,
        500: errorSchema
      }
    }
  }, async (request, reply) => {
    const { id, groupId } = request.params;
    const userId = request.user.id;

    try {
      // Check if user owns the list
      const list = await listRepository.findOne({
        where: { id, user: userId },
        relations: ['sharedWithGroups']
      });

      if (!list) {
        reply.status(404).send({ error: 'List not found or access denied' });
        return;
      }

      // Remove the group from shared groups
      if (list.sharedWithGroups) {
        const initialLength = list.sharedWithGroups.length;
        list.sharedWithGroups = list.sharedWithGroups.filter(group => group.id !== groupId);
        
        if (list.sharedWithGroups.length === initialLength) {
          reply.status(404).send({ error: 'List is not shared with this group' });
          return;
        }
      } else {
        reply.status(404).send({ error: 'List is not shared with this group' });
        return;
      }

      await listRepository.save(list);
      reply.status(200).send({ message: 'List unshared successfully' });
    } catch (error) {
      fastify.log.error(error, 'Failed to unshare list');
      reply.status(500).send({ error: 'Failed to unshare list' });
    }
  });

  // Get groups that a list is shared with - requires list ownership
  fastify.get('/lists/:id/shared-groups', {
    schema: {
      description: 'Get groups that a list is shared with',
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
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              description: { type: 'string' }
            }
          }
        },
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
      // Check if user owns the list
      const list = await listRepository.findOne({
        where: { id, user: userId },
        relations: ['sharedWithGroups']
      });

      if (!list) {
        reply.status(404).send({ error: 'List not found or access denied' });
        return;
      }

      const sharedGroups = list.sharedWithGroups || [];
      return sharedGroups.map(group => ({
        id: group.id,
        name: group.name,
        description: group.description
      }));
    } catch (error) {
      fastify.log.error(error, 'Failed to get shared groups');
      reply.status(500).send({ error: 'Failed to get shared groups' });
    }
  });
}