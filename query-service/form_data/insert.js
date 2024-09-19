const db = require('../../database/helper');
const { base64ToImage } = require('../../helpers/base64toImage');
const logger = require('../../helpers/pinoLog');
const { QUERY_STRING } = require('../../helpers/queryEnumHelper');

const postFormData = async (data) => {
    try {
        const dt = new Date()
        
        const { from_data_id, no_unit, model_unit, owner, date_trx, hm_last, hm_km, qty_last, qty, flow_start, flow_end, jde_operator, name_operator, start, end, fbr, lkf_id, signature, type, photo, created_by } = data

        let sign = await base64ToImage(signature)
        let pic = await base64ToImage(photo)

        const params = [ from_data_id, no_unit, model_unit, owner, date_trx, hm_last, hm_km, qty_last, qty, flow_start, flow_end, jde_operator, name_operator, start, end, fbr, lkf_id, signature, type, photo, created_by ]
        
        let result = await db.query(QUERY_STRING.postFormData, params)

        if(data.no_unit.includes('LV') || data.no_unit.includes('HLV')){
            const query = `UPDATE quota_usage SET used = ? WHERE "unitNo" = ?`;

            const value = [qty, no_unit]
            const res = await db.query(query, value);
        }
        
        if(result.rowCount>0){
            return true
        }else{
            return false
        }
    } catch (error) {
        logger.error(error)
        console.error('Error during update:', error);
        return false;
    }
};

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

        if (dataJson.no_unit.includes('LV') || dataJson.no_unit.includes('HLV')) {
            const params = [dataJson.qty, dataJson.no_unit]

            const query = `UPDATE quota_usage SET used = $1 WHERE "unitNo" = $2`;
            const res = await db.query(query, params)
        }

        if(result){
            return true
        }
        return false

    } catch (error) {
        console.log(error)
        return false
    }
}

module.exports = {
    postFormData,
    insertToForm
}