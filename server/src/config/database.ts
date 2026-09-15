import knex from 'knex';
import config from './index';

let db: any = null;

try {
  db = knex(config.database);
} catch (e) {
  console.warn('[AI Studio] Database initialization warning:', e);
}

export default db;

