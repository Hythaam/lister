import { UserSchema } from './user.js';
import { ListSchema } from './list.js';
import { ItemSchema } from './item.js';
import { ItemCommentSchema } from './itemComment.js';
import { GroupSchema } from './group.js';

export const entities = [UserSchema, ListSchema, ItemSchema, ItemCommentSchema, GroupSchema];