/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('log_form_lkf', function(table) {
        table.increments('id').primary();
        table.string('lkf_id', 20).notNullable();
        table.date('date').notNullable();
        table.string('shift', 8).notNullable();
        table.float('hm_start', 20).notNullable();
        table.float('hm_end', 20).nullable();
        table.string('site', 8).notNullable();
        table.string('fuelman_id', 8).notNullable();
        table.string('station', 8).notNullable();
        table.float('opening_dip', 20).notNullable();
        table.float('opening_sonding', 20).notNullable();
        table.float('closing_dip', 20).nullable();
        table.float('closing_sonding', 20).nullable();
        table.float('flow_meter_start', 20).notNullable();
        table.float('flow_meter_end', 20).nullable();
        table.string('status', 8).notNullable();
        table.timestamp('time_opening').notNullable();
        table.string('signature', 40).nullable();
        table.string('note', 200).nullable();
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
    return knex.schema.dropTable('log_form_lkf');
};