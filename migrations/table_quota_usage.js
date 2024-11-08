/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('quota_usage', function(table) {
        table.increments('id').primary();
        table.date('date')
        table.string('unit_no', 8)
        table.string('model', 50)
        table.string('kategori', 50)
        table.float('quota', 10)
        table.float('used', 10)
        table.float('additional')
        table.boolean('isDelete').defaultTo(0);
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
    return knex.schema.dropTable('quota_usage');
};