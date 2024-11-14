const db = require('../../database/helper');
const { base64ToImage } = require('../../helpers/base64toImage');
const logger = require('../../helpers/pinoLog');
const { QUERY_STRING } = require('../../helpers/queryEnumHelper');
const { formatYYYYMMDD } = require('../../helpers/dateHelper');

// const postFormData = async (data) => {
//     try {
//         const dt = new Date()
        
//         const { from_data_id, no_unit, model_unit, owner, date_trx, hm_last, hm_km, qty_last, qty, flow_start, flow_end, jde_operator, name_operator, start, end, fbr, lkf_id, signature, type, photo, created_by } = data

//         // let sign = await base64ToImage(signature)
//         // let pic = await base64ToImage(photo)

//         const params = [ from_data_id, no_unit, model_unit, owner, date_trx, hm_last, hm_km, qty_last, qty, flow_start, flow_end, jde_operator, name_operator, start, end, fbr, lkf_id, signature, type, photo, created_by ]
        
//         let result = await db.query(QUERY_STRING.postFormData, params)

//         if(data.no_unit.includes('LV') || data.no_unit.includes('HLV')){
//             const query = `UPDATE quota_usage SET used = $1 WHERE "unitNo" = $2`;

//             const existingData = await db.query(QUERY_STRING.getExistingQuota, [data.no_unit])
//             if(existingData.rows.length > 0){
//                 qty += existingData.rows[0].used
//             }
//             const value = [qty, no_unit]
//             const res = await db.query(query, value);
//         }
        
//         if(result.rowCount>0){
//             return true
//         }else{
//             return false
//         }
//     } catch (error) {
//         logger.error(error)
//         console.error('Error during update:', error);
//         return false;
//     }
// };


const postFormData = async (data) => {
    try {
        const dt = new Date();
        
        let { from_data_id, no_unit, model_unit, owner, date_trx, hm_last, hm_km, qty_last, qty, flow_start, flow_end, jde_operator, name_operator, start, end, fbr, lkf_id, signature, type, photo, created_by } = data;

        const params = [ from_data_id, no_unit, model_unit, owner, date_trx, hm_last, hm_km, qty_last, qty, flow_start, flow_end, jde_operator, name_operator, start, end, fbr, lkf_id, signature, type, photo, created_by ];
        
        let result = await db.query(QUERY_STRING.postFormData, params);

        if(data.no_unit.includes('LV') || data.no_unit.includes('HLV')){
            const query = `UPDATE quota_usage SET used = $1 WHERE unit_no = $2 and date = $3`;

            const existingData = await db.query(QUERY_STRING.getExistingQuota, [data.no_unit]);
            console.log(existingData.rows[0].used)
            console.log(data.no_unit)
            if (existingData.rows.length > 0) {
                qty += existingData.rows[0].used;
                
            }
            console.log(qty)
            const tanggal = formatYYYYMMDD(date_trx)

            const value = [qty, no_unit, tanggal]
            const res = await db.query(query, value);
            console.log(value)
            console.log(res)

        }
        
        return result.rowCount > 0;
    } catch (error) {
        logger.error(error);
        console.error('Error during update:', error);
        return false;
    }
};

// const insertToForm = async (dataJson) => {
//     try {
//         const sanitizedColumns = Object.keys(dataJson).map(key => `"${key}"`);
//         const valuesPlaceholders = sanitizedColumns.map((_, idx) => `$${idx + 1}`).join(', ');

//         const createOperatorQuery = `
//           INSERT INTO form_data (${sanitizedColumns.join(', ')})
//           VALUES (${valuesPlaceholders})
//         `;

//         const values = Object.keys(dataJson).map(key => dataJson[key]);
//         const result = await db.query(createOperatorQuery, values);

//         //jumlahkan dulu bila qty dari nomor yang sama
//         if (dataJson.no_unit.includes('LV') || dataJson.no_unit.includes('HLV')) {
            
//             const existingData = await db.query(QUERY_STRING.getExistingQuota, [dataJson.no_unit])
//             if(existingData.rows.length > 0){
//                 dataJson.qty += existingData.rows[0].used
//             }

//             const params = [dataJson.qty, dataJson.no_unit, dataJson.date_trx]
//             const query = `UPDATE quota_usage SET used = $1 WHERE "unit_no" = $2 and "date" = $3`;
//             const res = await db.query(query, params)
//         }

//         if(result){
//             return true
//         }
//         return false

//     } catch (error) {
//         logger.error(error)
//         console.log(error)
//         return false
//     }
// }


const insertToForm = async (dataJson) => {
    try {
        const sanitizedColumns = Object.keys(dataJson).map(key => `"${key}"`);
        const valuesPlaceholders = sanitizedColumns.map((_, idx) => `$${idx + 1}`).join(', ');

        const createOperatorQuery = `
          INSERT INTO form_data (${sanitizedColumns.join(', ')})
          VALUES (${valuesPlaceholders})
        `;

        const values = Object.keys(dataJson).map(key => dataJson[key]);
        const result = await db.query(createOperatorQuery, values);

        // Jumlahkan qty jika nomor unit yang sama
        if (dataJson.no_unit.includes('LV') || dataJson.no_unit.includes('HLV')) {
            
            const existingData = await db.query(QUERY_STRING.getExistingQuota, [dataJson.no_unit]);
            if (existingData.rows.length > 0) {
                dataJson.qty += existingData.rows[0].used;
            }

            // Pastikan tanggal diformat dengan benar
            const tanggal = formatYYYYMMDD(dataJson.date_trx);
            const params = [dataJson.qty, dataJson.no_unit, tanggal];
            const query = `UPDATE quota_usage SET used = $1 WHERE "unit_no" = $2 and "date" = $3`;
            await db.query(query, params);
        }

        if (result) {
            return true;
        }
        return false;

    } catch (error) {
        logger.error(error);
        console.log(error);
        return false;
    }
};

const deleteForm = async (params) => {
    try{
        const res = await db.query(QUERY_STRING.DELETE_FORM_DATA, [params])
        if(res){
            return true
        }else{
            return false
        }
    }catch (error){
        logger.error(error)
        return false
    }
}

const editForm = async (updateFields) => {
    console.log(updateFields)
    try {

        const setClauses = Object.keys(updateFields)
            .filter(field => field !== 'from_data_id') // Exclude from_data_id for the update
            .map((field, index) => `${field} = $${index + 1}`)
            .join(', ');

        const values = Object.keys(updateFields)
            .filter(field => field !== 'from_data_id')
            .map(field => updateFields[field]);

        // Add from_data_id at the end for the WHERE clause
        values.push(updateFields.from_data_id);

        const query = `UPDATE form_data SET ${setClauses} WHERE from_data_id = $${values.length}`;
        const result = await db.query(query, values);

        return result.rowCount > 0; // Return true if at least one row was updated
    } catch (error) {
        logger.error(error);
        return false;
    }
};


module.exports = {
    postFormData,
    insertToForm,
    editForm,
    deleteForm
}