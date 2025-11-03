import { EntitySchema } from 'typeorm';

export class User {
  constructor() {
    this.id = undefined;
    this.email = undefined;
    this.name = undefined;
    this.passwordHash = undefined;
    this.activated = undefined;
    this.roles = undefined;
  }
}

export const UserSchema = new EntitySchema({
  name: 'User',
  tableName: 'users',
  target: User,
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid'
    },
    email: {
      type: 'varchar',
      length: 255,
      unique: true,
      nullable: false
    },
    name: {
      type: 'varchar',
      length: 255,
      nullable: true
    },
    passwordHash: {
      type: 'varchar',
      length: 255,
      nullable: false
    },
    activated: {
      type: 'boolean',
      default: true,
      nullable: false
    },
    roles: {
      type: 'simple-array',
      nullable: true
    }
  },
  relations: {
    groups: {
      type: 'many-to-many',
      target: 'Group',
      mappedBy: 'members'
    },
    createdGroups: {
      type: 'one-to-many',
      target: 'Group',
      mappedBy: 'createdBy'
    }
  }
});
