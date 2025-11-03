import { Group } from '../entities/group.js';
import { User } from '../entities/user.js';
import { List } from '../entities/list.js';

// Schema definitions
const groupSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    description: { type: 'string' },
    createdBy: { type: 'string', format: 'uuid' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  }
};

const groupCreateSchema = {
  type: 'object',
  required: ['name'],
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 255 },
    description: { type: 'string', maxLength: 1000 }
  }
};

const groupUpdateSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 255 },
    description: { type: 'string', maxLength: 1000 }
  }
};

const memberSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    email: { type: 'string', format: 'email' }
  }
};

const addMemberSchema = {
  type: 'object',
  required: ['userId'],
  properties: {
    userId: { type: 'string', format: 'uuid' }
  }
};

const shareListSchema = {
  type: 'object',
  required: ['listId'],
  properties: {
    listId: { type: 'string', format: 'uuid' }
  }
};

const errorSchema = {
  type: 'object',
  properties: {
    error: { type: 'string' },
    message: { type: 'string' }
  }
};

// A plugin to encapsulate group routes
export default async function(fastify) {

  const groupRepository = fastify.db.getRepository(Group);
  const userRepository = fastify.db.getRepository(User);
  const listRepository = fastify.db.getRepository(List);

  // Get all groups for the authenticated user (groups they belong to or created)
  fastify.get('/groups', {
    schema: {
      description: 'Get all groups for the authenticated user',
      tags: ['groups'],
      security: [{ basicAuth: [] }],
      response: {
        200: {
          type: 'array',
          items: groupSchema
        },
        401: errorSchema,
        500: errorSchema
      }
    }
  }, async (request, reply) => {
    const userId = request.user.id;

    try {
      const groups = await groupRepository
        .createQueryBuilder('group')
        .leftJoinAndSelect('group.members', 'member')
        .where('group.createdBy = :userId', { userId })
        .orWhere('member.id = :userId', { userId })
        .orderBy('group.createdAt', 'DESC')
        .getMany();
      
      return groups;
    } catch (error) {
      fastify.log.error(error, 'Failed to fetch groups');
      reply.status(500).send({ error: 'Failed to fetch groups' });
    }
  });

  // Get a specific group by ID - requires authentication and membership
  fastify.get('/groups/:id', {
    schema: {
      description: 'Get a specific group by ID',
      tags: ['groups'],
      security: [{ basicAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        },
        required: ['id']
      },
      response: {
        200: groupSchema,
        401: errorSchema,
        403: errorSchema,
        404: errorSchema,
        500: errorSchema
      }
    }
  }, async (request, reply) => {
    const userId = request.user.id;
    const groupId = request.params.id;

    try {
      const group = await groupRepository
        .createQueryBuilder('group')
        .leftJoinAndSelect('group.members', 'member')
        .where('group.id = :groupId', { groupId })
        .getOne();

      if (!group) {
        reply.status(404).send({ error: 'Group not found' });
        return;
      }

      // Check if user is creator or member
      const isMember = group.members?.some(member => member.id === userId) || group.createdBy === userId;
      if (!isMember) {
        reply.status(403).send({ error: 'You are not a member of this group' });
        return;
      }

      return group;
    } catch (error) {
      fastify.log.error(error, 'Failed to fetch group');
      reply.status(500).send({ error: 'Failed to fetch group' });
    }
  });

  // Create a new group
  fastify.post('/groups', {
    schema: {
      description: 'Create a new group',
      tags: ['groups'],
      security: [{ basicAuth: [] }],
      body: groupCreateSchema,
      response: {
        201: groupSchema,
        400: errorSchema,
        401: errorSchema,
        500: errorSchema
      }
    }
  }, async (request, reply) => {
    const userId = request.user.id;
    const { name, description } = request.body;

    try {
      const group = groupRepository.create({
        name,
        description,
        createdBy: userId
      });

      const savedGroup = await groupRepository.save(group);
      reply.status(201).send(savedGroup);
    } catch (error) {
      fastify.log.error(error, 'Failed to create group');
      reply.status(500).send({ error: 'Failed to create group' });
    }
  });

  // Update a group - only creator can update
  fastify.put('/groups/:id', {
    schema: {
      description: 'Update a group',
      tags: ['groups'],
      security: [{ basicAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        },
        required: ['id']
      },
      body: groupUpdateSchema,
      response: {
        200: groupSchema,
        401: errorSchema,
        403: errorSchema,
        404: errorSchema,
        500: errorSchema
      }
    }
  }, async (request, reply) => {
    const userId = request.user.id;
    const groupId = request.params.id;
    const updates = request.body;

    try {
      const group = await groupRepository.findOne({ where: { id: groupId } });
      
      if (!group) {
        reply.status(404).send({ error: 'Group not found' });
        return;
      }

      if (group.createdBy !== userId) {
        reply.status(403).send({ error: 'Only the group creator can update this group' });
        return;
      }

      Object.assign(group, updates);
      const updatedGroup = await groupRepository.save(group);
      
      return updatedGroup;
    } catch (error) {
      fastify.log.error(error, 'Failed to update group');
      reply.status(500).send({ error: 'Failed to update group' });
    }
  });

  // Delete a group - only creator can delete
  fastify.delete('/groups/:id', {
    schema: {
      description: 'Delete a group',
      tags: ['groups'],
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
        404: errorSchema,
        500: errorSchema
      }
    }
  }, async (request, reply) => {
    const userId = request.user.id;
    const groupId = request.params.id;

    try {
      const group = await groupRepository.findOne({ where: { id: groupId } });
      
      if (!group) {
        reply.status(404).send({ error: 'Group not found' });
        return;
      }

      if (group.createdBy !== userId) {
        reply.status(403).send({ error: 'Only the group creator can delete this group' });
        return;
      }

      await groupRepository.remove(group);
      reply.status(204).send();
    } catch (error) {
      fastify.log.error(error, 'Failed to delete group');
      reply.status(500).send({ error: 'Failed to delete group' });
    }
  });

  // Get group members
  fastify.get('/groups/:id/members', {
    schema: {
      description: 'Get all members of a group',
      tags: ['groups'],
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
          items: memberSchema
        },
        401: errorSchema,
        403: errorSchema,
        404: errorSchema,
        500: errorSchema
      }
    }
  }, async (request, reply) => {
    const userId = request.user.id;
    const groupId = request.params.id;

    try {
      const group = await groupRepository
        .createQueryBuilder('group')
        .leftJoinAndSelect('group.members', 'member')
        .where('group.id = :groupId', { groupId })
        .getOne();

      if (!group) {
        reply.status(404).send({ error: 'Group not found' });
        return;
      }

      // Check if user is creator or member
      const isMember = group.members?.some(member => member.id === userId) || group.createdBy === userId;
      if (!isMember) {
        reply.status(403).send({ error: 'You are not a member of this group' });
        return;
      }

      return group.members || [];
    } catch (error) {
      fastify.log.error(error, 'Failed to fetch group members');
      reply.status(500).send({ error: 'Failed to fetch group members' });
    }
  });

  // Add a member to a group - only creator can add members
  fastify.post('/groups/:id/members', {
    schema: {
      description: 'Add a member to a group',
      tags: ['groups'],
      security: [{ basicAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        },
        required: ['id']
      },
      body: addMemberSchema,
      response: {
        201: { type: 'object', properties: { message: { type: 'string' } } },
        400: errorSchema,
        401: errorSchema,
        403: errorSchema,
        404: errorSchema,
        500: errorSchema
      }
    }
  }, async (request, reply) => {
    const userId = request.user.id;
    const groupId = request.params.id;
    const { userId: newMemberId } = request.body;

    try {
      const group = await groupRepository
        .createQueryBuilder('group')
        .leftJoinAndSelect('group.members', 'member')
        .where('group.id = :groupId', { groupId })
        .getOne();

      if (!group) {
        reply.status(404).send({ error: 'Group not found' });
        return;
      }

      if (group.createdBy !== userId) {
        reply.status(403).send({ error: 'Only the group creator can add members' });
        return;
      }

      const userToAdd = await userRepository.findOne({ where: { id: newMemberId } });
      if (!userToAdd) {
        reply.status(404).send({ error: 'User not found' });
        return;
      }

      // Check if user is already a member
      const isAlreadyMember = group.members?.some(member => member.id === newMemberId);
      if (isAlreadyMember) {
        reply.status(400).send({ error: 'User is already a member of this group' });
        return;
      }

      if (!group.members) {
        group.members = [];
      }
      group.members.push(userToAdd);
      await groupRepository.save(group);

      reply.status(201).send({ message: 'Member added successfully' });
    } catch (error) {
      fastify.log.error(error, 'Failed to add member to group');
      reply.status(500).send({ error: 'Failed to add member to group' });
    }
  });

  // Remove a member from a group - creator can remove anyone, members can remove themselves
  fastify.delete('/groups/:id/members/:userId', {
    schema: {
      description: 'Remove a member from a group',
      tags: ['groups'],
      security: [{ basicAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' }
        },
        required: ['id', 'userId']
      },
      response: {
        204: { type: 'null' },
        401: errorSchema,
        403: errorSchema,
        404: errorSchema,
        500: errorSchema
      }
    }
  }, async (request, reply) => {
    const currentUserId = request.user.id;
    const groupId = request.params.id;
    const userIdToRemove = request.params.userId;

    try {
      const group = await groupRepository
        .createQueryBuilder('group')
        .leftJoinAndSelect('group.members', 'member')
        .where('group.id = :groupId', { groupId })
        .getOne();

      if (!group) {
        reply.status(404).send({ error: 'Group not found' });
        return;
      }

      // Check permissions: creator can remove anyone, members can only remove themselves
      if (group.createdBy !== currentUserId && currentUserId !== userIdToRemove) {
        reply.status(403).send({ error: 'You can only remove yourself or be the group creator' });
        return;
      }

      const memberToRemove = group.members?.find(member => member.id === userIdToRemove);
      if (!memberToRemove) {
        reply.status(404).send({ error: 'User is not a member of this group' });
        return;
      }

      group.members = group.members.filter(member => member.id !== userIdToRemove);
      await groupRepository.save(group);

      reply.status(204).send();
    } catch (error) {
      fastify.log.error(error, 'Failed to remove member from group');
      reply.status(500).send({ error: 'Failed to remove member from group' });
    }
  });

  // Share a list with a group - only list owner can share
  fastify.post('/groups/:id/shared-lists', {
    schema: {
      description: 'Share a list with a group',
      tags: ['groups'],
      security: [{ basicAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        },
        required: ['id']
      },
      body: shareListSchema,
      response: {
        201: { type: 'object', properties: { message: { type: 'string' } } },
        400: errorSchema,
        401: errorSchema,
        403: errorSchema,
        404: errorSchema,
        500: errorSchema
      }
    }
  }, async (request, reply) => {
    const userId = request.user.id;
    const groupId = request.params.id;
    const { listId } = request.body;

    try {
      const group = await groupRepository
        .createQueryBuilder('group')
        .leftJoinAndSelect('group.members', 'member')
        .leftJoinAndSelect('group.sharedLists', 'sharedList')
        .where('group.id = :groupId', { groupId })
        .getOne();

      if (!group) {
        reply.status(404).send({ error: 'Group not found' });
        return;
      }

      // Check if user is creator or member
      const isMember = group.members?.some(member => member.id === userId) || group.createdBy === userId;
      if (!isMember) {
        reply.status(403).send({ error: 'You are not a member of this group' });
        return;
      }

      const list = await listRepository.findOne({ where: { id: listId } });
      if (!list) {
        reply.status(404).send({ error: 'List not found' });
        return;
      }

      if (list.user !== userId) {
        reply.status(403).send({ error: 'You can only share your own lists' });
        return;
      }

      // Check if list is already shared with this group
      const isAlreadyShared = group.sharedLists?.some(sharedList => sharedList.id === listId);
      if (isAlreadyShared) {
        reply.status(400).send({ error: 'List is already shared with this group' });
        return;
      }

      if (!group.sharedLists) {
        group.sharedLists = [];
      }
      group.sharedLists.push(list);
      await groupRepository.save(group);

      reply.status(201).send({ message: 'List shared with group successfully' });
    } catch (error) {
      fastify.log.error(error, 'Failed to share list with group');
      reply.status(500).send({ error: 'Failed to share list with group' });
    }
  });

  // Get shared lists for a group
  fastify.get('/groups/:id/shared-lists', {
    schema: {
      description: 'Get all lists shared with a group',
      tags: ['groups'],
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
              user: { type: 'string', format: 'uuid' },
              title: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
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
    const userId = request.user.id;
    const groupId = request.params.id;

    try {
      const group = await groupRepository
        .createQueryBuilder('group')
        .leftJoinAndSelect('group.members', 'member')
        .leftJoinAndSelect('group.sharedLists', 'sharedList')
        .where('group.id = :groupId', { groupId })
        .getOne();

      if (!group) {
        reply.status(404).send({ error: 'Group not found' });
        return;
      }

      // Check if user is creator or member
      const isMember = group.members?.some(member => member.id === userId) || group.createdBy === userId;
      if (!isMember) {
        reply.status(403).send({ error: 'You are not a member of this group' });
        return;
      }

      return group.sharedLists || [];
    } catch (error) {
      fastify.log.error(error, 'Failed to fetch shared lists');
      reply.status(500).send({ error: 'Failed to fetch shared lists' });
    }
  });

  // Unshare a list from a group - only list owner can unshare
  fastify.delete('/groups/:id/shared-lists/:listId', {
    schema: {
      description: 'Unshare a list from a group',
      tags: ['groups'],
      security: [{ basicAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          listId: { type: 'string', format: 'uuid' }
        },
        required: ['id', 'listId']
      },
      response: {
        204: { type: 'null' },
        401: errorSchema,
        403: errorSchema,
        404: errorSchema,
        500: errorSchema
      }
    }
  }, async (request, reply) => {
    const userId = request.user.id;
    const groupId = request.params.id;
    const listId = request.params.listId;

    try {
      const group = await groupRepository
        .createQueryBuilder('group')
        .leftJoinAndSelect('group.sharedLists', 'sharedList')
        .where('group.id = :groupId', { groupId })
        .getOne();

      if (!group) {
        reply.status(404).send({ error: 'Group not found' });
        return;
      }

      const list = await listRepository.findOne({ where: { id: listId } });
      if (!list) {
        reply.status(404).send({ error: 'List not found' });
        return;
      }

      if (list.user !== userId) {
        reply.status(403).send({ error: 'You can only unshare your own lists' });
        return;
      }

      const sharedList = group.sharedLists?.find(sharedList => sharedList.id === listId);
      if (!sharedList) {
        reply.status(404).send({ error: 'List is not shared with this group' });
        return;
      }

      group.sharedLists = group.sharedLists.filter(sharedList => sharedList.id !== listId);
      await groupRepository.save(group);

      reply.status(204).send();
    } catch (error) {
      fastify.log.error(error, 'Failed to unshare list from group');
      reply.status(500).send({ error: 'Failed to unshare list from group' });
    }
  });
}