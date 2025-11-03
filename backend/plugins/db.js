import fp from 'fastify-plugin';
import { DataSource } from 'typeorm';
import { entities } from '../entities/index.js';

export default fp(async (fastify) => {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL || 'postgres://lister_user:lister_password@localhost:5432/lister_db',
    synchronize: true,
    logging: false,
    entities: entities,
  });

  fastify.decorate('db', await dataSource.initialize());
});