/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('fuelman_log', function(table) {
        table.increments('id').primary();
        table.date('date').notNullable();
        table.string('jde_operator', 8).notNullable();
        table.string('name_operator', 25).nullable();
        table.string('station', 20).notNullable();
        table.timestamp('login_time').defaultTo(knex.fn.now());
        table.timestamp('logout_time')
        table.boolean('is_delete').defaultTo(0);
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('fuelman_log');
};