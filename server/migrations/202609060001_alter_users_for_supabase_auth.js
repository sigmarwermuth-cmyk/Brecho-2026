/**
 * Adapta a tabela `users` para funcionar com o Supabase Auth:
 * - remove a coluna `password` (senha agora é gerenciada pelo Supabase)
 * - troca `id` de INT AUTO_INCREMENT para CHAR(36) (UUID do Supabase Auth)
 * - atualiza a FK em `products.user_id` pro novo tipo
 *
 * ATENÇÃO: como o tipo do id muda, esta migration APAGA os dados existentes
 * de `users` e `products` pra evitar inconsistência de FK. Rode só em
 * desenvolvimento, antes de ter dados reais.
 */
exports.up = async function (knex) {
  await knex('products').del();
  await knex('users').del();

  await knex.schema.alterTable('products', (table) => {
    table.dropForeign('user_id');
  });

  await knex.raw('ALTER TABLE `products` MODIFY `user_id` CHAR(36) NULL');

  await knex.raw('ALTER TABLE `users` DROP COLUMN `password`');
  await knex.raw('ALTER TABLE `users` DROP PRIMARY KEY');
  await knex.raw('ALTER TABLE `users` MODIFY `id` CHAR(36) NOT NULL');
  await knex.raw('ALTER TABLE `users` ADD PRIMARY KEY (`id`)');

  await knex.schema.alterTable('products', (table) => {
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
  });
};

exports.down = async function (knex) {
  await knex('products').del();
  await knex('users').del();

  await knex.schema.alterTable('products', (table) => {
    table.dropForeign('user_id');
  });

  await knex.raw('ALTER TABLE `users` DROP PRIMARY KEY');
  await knex.raw('ALTER TABLE `users` MODIFY `id` INT NOT NULL AUTO_INCREMENT');
  await knex.raw('ALTER TABLE `users` ADD PRIMARY KEY (`id`)');
  await knex.raw('ALTER TABLE `users` ADD COLUMN `password` VARCHAR(255) NOT NULL DEFAULT ""');

  await knex.raw('ALTER TABLE `products` MODIFY `user_id` INT UNSIGNED NULL');

  await knex.schema.alterTable('products', (table) => {
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
  });
};
