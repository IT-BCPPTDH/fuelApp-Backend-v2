/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('form_data', function(table) {
        table.increments('id').primary();
        table.string('from_data_id', 20).notNullable();
        table.string('no_unit', 8).notNullable();
        table.string('model_unit', 50).notNullable();
        table.string('owner', 50).nullable();
        table.timestamp('date_trx').notNullable();
        table.float('hm_last', 20);
        table.float('hm_km', 20).notNullable();
        table.float('qty_last', 20).notNullable();
        table.float('qty', 20).notNullable();
        table.float('flow_start', 20).notNullable();
        table.float('flow_end', 20).notNullable();
        table.string('jde_operator', 8).notNullable();
        table.string('name_operator', 25).nullable();
        table.time('start').notNullable();
        table.time('end').notNullable();
        table.float('fbr', 20).notNullable();
        table.string('lkf_id',20).notNullable();
        table.string('signature', 40).notNullable();
        table.enu('type', ['Issued','Receipt','Transfer','Receipt KPC','Quota']).notNullable();
        table.string('photo', 40).notNullable();
        table.boolean('isStatus').defaultTo(0);
        table.boolean('isDelete').defaultTo(0);
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
    return knex.schema.dropTable('form_data');
};