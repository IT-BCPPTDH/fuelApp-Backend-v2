const db = require("../database/helper");
const { HTTP_STATUS } = require("../helpers/enumHelper");

async function getLkfByIdController(lkf_id) {
  console.log("🧩 Controller getLkfByIdController:", lkf_id);
  try {
    const result = await db.query("SELECT * FROM form_lkf WHERE lkf_id = $1", [
      lkf_id,
    ]);

    if (result.rows.length === 0) {
      console.log("⚠️ Data not found for lkf_id:", lkf_id);
      return {
        status: "404",
        message: "Data not found",
        data: [],
      };
    }

    console.log("✅ Data found:", result.rows);
    return {
      status: "200",
      message: "Success get data",
      data: result.rows,
    };
  } catch (error) {
    console.error("❌ Error in getLkfByIdController:", error);
    return {
      status: "500",
      message: error.message || "Internal server error",
    };
  }
}

async function updateLkfController(data) {
  try {
    const {
      lkf_id,
      opening_dip,
      opening_sonding,
      closing_dip,
      closing_sonding,
      flow_meter_start,
      flow_meter_end,
      status,
      updated_by,
    } = data;

    const parseValue = (val) => {
      if (val === "" || val === undefined || val === null) return null;
      const num = Number(val);
      return isNaN(num) ? null : num;
    };

    const values = [
      parseValue(opening_dip),
      parseValue(opening_sonding),
      parseValue(closing_dip),
      parseValue(closing_sonding),
      parseValue(flow_meter_start),
      parseValue(flow_meter_end),
      status || null,
      updated_by || null,
      lkf_id,
    ];

    console.log("🛠 Updating LKF:", lkf_id);
    console.log("📦 Values dikirim:", values);

    const query = `
    UPDATE form_lkf
      SET 
        opening_dip = $1,
        opening_sonding = $2,
        closing_dip = $3,
        closing_sonding = $4,
        flow_meter_start = $5,
        flow_meter_end = $6,
        status = $7,
        updated_by = $8,
        updated_at = NOW()
      WHERE lkf_id = $9
      RETURNING *;
    `;

    const result = await db.query(query, values);

    if (result.rowCount === 0) {
      return { status: "404", message: "LKF not found or no changes applied." };
    }

    return {
      status: "200",
      message: "LKF successfully updated.",
      data: result.rows[0],
    };
  } catch (err) {
    console.error("❌ Error in updateLkfController:", err);
    return { status: "500", message: err.message };
  }
}

module.exports = {
  getLkfByIdController,
  updateLkfController,
};
