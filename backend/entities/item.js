import { EntitySchema } from 'typeorm';

export class Item {
  constructor() {
    this.id = undefined;
    this.list = undefined;
    this.title = undefined;
    this.description = undefined;
    this.createdAt = undefined;
    this.updatedAt = undefined;
  }
}

export const ItemSchema = new EntitySchema({
  name: 'Item',
  tableName: 'items',
  target: Item,
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid'
    },
    list: {
      type: 'uuid',
      nullable: false
    },
    title: {
      type: 'varchar',
      length: 255,
      nullable: false
    },
    description: {
      type: 'text',
      nullable: true
    },
    createdAt: {
      type: 'datetime',
      createDate: true
    },
    updatedAt: {
      type: 'datetime',
      updateDate: true
    }
  },
  relations: {
    list: {
      type: 'many-to-one',
      target: 'List',
      joinColumn: {
        name: 'list_id'
      },
      nullable: false
    }
  }
});