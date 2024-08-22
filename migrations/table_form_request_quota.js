/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('form_table_request', function(table) {
        table.increments('id').primary();
        table.date('date').notNullable();
        table.time('time').notNullable();
        table.text('shift').notNullable();
        table.string('unit_no', 8).notNullable();
        table.string('model', 15).notNullable();
        table.float('hmkm', 15).notNullable();
        table.text('reason').notNullable();
        table.float('quota_request', 10).notNullable();
        table.string('document', 40).notNullable();
        table.string('request_by', 20).notNullable();
        table.string('request_name', 20).notNullable();
        table.string('approve_by', 8).notNullable();
        table.string('approve_name', 20).notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
        table.string('created_by', 25).notNullable();
        table.string('updated_by', 25).nullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('form_table_request');
};