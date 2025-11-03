import { EntitySchema } from 'typeorm';

export class Group {
  constructor() {
    this.id = undefined;
    this.name = undefined;
    this.description = undefined;
    this.createdBy = undefined;
    this.createdAt = undefined;
    this.updatedAt = undefined;
  }
}

export const GroupSchema = new EntitySchema({
  name: 'Group',
  tableName: 'groups',
  target: Group,
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid'
    },
    name: {
      type: 'varchar',
      length: 255,
      nullable: false
    },
    description: {
      type: 'text',
      nullable: true
    },
    createdBy: {
      type: 'uuid',
      nullable: false
    },
    createdAt: {
      type: 'timestamp',
      createDate: true
    },
    updatedAt: {
      type: 'timestamp',
      updateDate: true
    }
  },
  relations: {
    createdBy: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: {
        name: 'created_by'
      },
      nullable: false
    },
    members: {
      type: 'many-to-many',
      target: 'User',
      joinTable: {
        name: 'group_members',
        joinColumn: {
          name: 'group_id',
          referencedColumnName: 'id'
        },
        inverseJoinColumn: {
          name: 'user_id',
          referencedColumnName: 'id'
        }
      }
    },
    sharedLists: {
      type: 'many-to-many',
      target: 'List',
      joinTable: {
        name: 'group_shared_lists',
        joinColumn: {
          name: 'group_id',
          referencedColumnName: 'id'
        },
        inverseJoinColumn: {
          name: 'list_id',
          referencedColumnName: 'id'
        }
      }
    }
  }
});