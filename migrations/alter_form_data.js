/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    // return knex.raw('ALTER TABLE form_data DROP COLUMN "isStatus"');
};

exports.down = function(knex) {
  // return knex.raw('ALTER TABLE form_data ADD COLUMN "isStatus" BOOLEAN DEFAULT false');
};

//Lakukan rollback lalu migrate ulang
  