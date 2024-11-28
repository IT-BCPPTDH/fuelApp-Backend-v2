/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    try {
      console.log('Creating function: delete_station_transaction');
      await knex.raw(`
        CREATE OR REPLACE FUNCTION delete_station_transaction(p_lkf_id VARCHAR)
        RETURNS VOID
        LANGUAGE plpgsql
        AS $$
        BEGIN
          -- Hapus dari tabel form_lkf
          DELETE FROM form_lkf
          WHERE lkf_id = p_lkf_id;
  
          -- Hapus dari tabel form_data
          DELETE FROM form_data
          WHERE lkf_id = p_lkf_id;
  
          -- Hapus dari tabel fuelman_log berdasarkan join dengan tabel form_lkf
          DELETE FROM fuelman_log
          USING form_lkf
          WHERE fuelman_log.jde_operator = form_lkf.fuelman_id
            AND fuelman_log."date" = form_lkf."date"
            AND fuelman_log.station = form_lkf.station
            AND form_lkf.lkf_id = p_lkf_id;
        END;
        $$;
      `);
      console.log('Function delete_station_transaction created successfully.');
    } catch (err) {
      console.error('Migration failed:', err.message);
      throw err;
    }
  };
  
  exports.down = async function (knex) {
    try {
      console.log('Dropping function: delete_station_transaction');
      await knex.raw('DROP FUNCTION IF EXISTS delete_station_transaction(VARCHAR)');
      console.log('Function delete_station_transaction dropped successfully.');
    } catch (err) {
      console.error('Rollback failed:', err.message);
      throw err;
    }
  };
  