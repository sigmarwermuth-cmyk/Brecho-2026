exports.up = async function(knex) {
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('email').notNullable().unique();
    table.string('password').notNullable();
    table.string('phone').nullable();
    table.string('address').nullable();
    table.string('profile_image').nullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable('categories', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable().unique();
    table.string('slug').notNullable().unique();
  });

  await knex.schema.createTable('products', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.integer('category_id').unsigned().references('id').inTable('categories').onDelete('SET NULL');
    table.string('title').notNullable();
    table.text('description').notNullable();
    table.decimal('price', 10, 2).notNullable();
    table.string('size').notNullable();
    table.enum('condition', ['Novo', 'Seminovo', 'Usado']).notNullable();
    table.string('image_url').notNullable();
    table.enum('status', ['disponivel', 'reservado', 'vendido']).defaultTo('disponivel');
    table.timestamps(true, true);
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('products');
  await knex.schema.dropTableIfExists('categories');
  await knex.schema.dropTableIfExists('users');
};
