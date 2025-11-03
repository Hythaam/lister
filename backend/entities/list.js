import { EntitySchema } from 'typeorm';

export class List {
  constructor() {
    this.id = undefined;
    this.user = undefined;
    this.title = undefined;
    this.createdAt = undefined;
    this.updatedAt = undefined;
  }
}

export const ListSchema = new EntitySchema({
  name: 'List',
  tableName: 'lists',
  target: List,
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid'
    },
    user: {
      type: 'uuid',
      nullable: false
    },
    title: {
      type: 'varchar',
      length: 255,
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
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: {
        name: 'user_id'
      },
      nullable: false
    },
    sharedWithGroups: {
      type: 'many-to-many',
      target: 'Group',
      mappedBy: 'sharedLists'
    }
  }
});