/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 * This table for stored default unit quota.
 * you can used it to stored unit before render everyday
 */


exports.up = function(knex) {
    return knex.schema.createTable('unit_quota', function(table) {
        table.increments('id').primary();
        table.string('unit_no', 8)
        table.string('egi', 50)
        table.string('kategori', 50)
        table.float('quota', 10)
        table.boolean('is_active').defaultTo(1);
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('unit_quota');
};