import { EntitySchema } from 'typeorm';

export class ItemComment {
  constructor() {
    this.id = undefined;
    this.item = undefined;
    this.sourceUser = undefined;
    this.text = undefined;
    this.createdAt = undefined;
    this.updatedAt = undefined;
  }
}

export const ItemCommentSchema = new EntitySchema({
  name: 'ItemComment',
  tableName: 'item_comments',
  target: ItemComment,
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid'
    },
    item: {
      type: 'uuid',
      nullable: false
    },
    sourceUser: {
      type: 'uuid',
      nullable: false
    },
    text: {
      type: 'text',
      nullable: false
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
    item: {
      type: 'many-to-one',
      target: 'Item',
      joinColumn: {
        name: 'item_id'
      },
      nullable: false
    },
    sourceUser: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: {
        name: 'source_user_id'
      },
      nullable: false
    }
  }
});