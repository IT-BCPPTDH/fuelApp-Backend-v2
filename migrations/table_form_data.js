/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('form_data', function(table) {
        table.increments('id').primary();
        table.string('from_data_id', 20).notNullable();
        table.string('no_unit', 20).notNullable();
        table.string('model_unit', 50).nullable();
        table.string('owner', 50).nullable();
        table.timestamp('date_trx').nullable();
        table.float('hm_km', 20).nullable();
        table.float('qty', 20).nullable();
        table.float('flow_start', 20).nullable();
        table.float('flow_end', 20).nullable();
        table.string('jde_operator', 20).nullable();
        table.string('name_operator', 50).nullable();
        table.time('start').nullable();
        table.time('end').nullable();
        table.float('fbr', 20).nullable();
        table.string('lkf_id',20).notNullable();
        table.string('signature', 255).nullable();
        table.enu('type', ['Issued','Receipt','Transfer','Receipt KPC','Quota']).notNullable();
        table.string('photo', 255).nullable();
        table.integer('uniq_number', 50).nullable();
        table.boolean('isStatus').defaultTo(0);
        table.boolean('isDelete').defaultTo(0);
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
        table.string('created_by', 25).nullable();
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