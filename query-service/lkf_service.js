const db = require("../database/helper");

// 🔹 Ambil data LKF berdasarkan ID
async function getLkfById(params) {
  const lkf_id = params.lkf_id || params;
  const query = `
    SELECT *
    FROM form_lkf
    WHERE lkf_id = $1
    LIMIT 1;
  `;
  const result = await db.query(query, [lkf_id]);
  return result.rows;
}

// 🔹 Update field-field LKF
async function updateLkfData(data) {
  const query = `
    UPDATE form_lkf
    SET 
      opening_dip = $1,
      opening_sonding = $2,
      closing_dip = $3,
      closing_sonding = $4,
      close_data = $5,
      variant = $6,
      flow_meter_start = $7,
      flow_meter_end = $8,
      status = $9,
      updated_by = $10,
      updated_at = NOW()
    WHERE lkf_id = $11
    RETURNING *;
  `;

  const values = [
    data.opening_dip,
    data.opening_sonding,
    data.closing_dip,
    data.closing_sonding,
    data.close_data,
    data.variant,
    data.flow_meter_start,
    data.flow_meter_end,
    data.status,
    data.updated_by,
    data.lkf_id,
  ];

  const result = await db.query(query, values);
  return result.rows[0];
}

module.exports = {
  getLkfById,
  updateLkfData,
};
