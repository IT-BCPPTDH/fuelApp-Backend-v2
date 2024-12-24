const db = require('../../database/helper');
const { formatYYYYMMDD, formatDateOption,formatDateToDDMMYYYY, formatDateTimeToDDMMYYYY_HHMMSS } = require('../../helpers/dateHelper');
const logger = require('../../helpers/pinoLog');
const { QUERY_STRING } = require('../../helpers/queryEnumHelper');
const { getTableStation } = require('./get-data-service');

const editData = async(updateFields) => {
    try {
        const setClauses = Object.keys(updateFields)
        .filter(field => field !== 'lkf_id')  
        .map((field, index) => {
          if (field === 'date') {
            return `"date" = $${index + 1}`; 
          }
          return `${field} = $${index + 1}`;
        })
        .join(', ');

        const values = Object.keys(updateFields)
            .filter(field => field !== 'lkf_id')
            .map(field => updateFields[field]);

        values.push(updateFields.lkf_id);

        const query = `UPDATE form_lkf SET ${setClauses} WHERE lkf_id = $${values.length}`;
        const result = await db.query(query, values)

        if(result){
            return true
        }

        return false
    } catch (error) {
        logger.error(error)
        console.log(error)
        return false
    }
}

const delData = async(params) => {
    try {
        const getData = await db.query(QUERY_STRING.getHomeTable, [params])
        const extractedData = getData.rows.map(item => ({
            unit: item.no_unit,
            date: item.date_trx,
            qty : item.qty
        }));

        for (const data of extractedData) {
            const existingData = await db.query(QUERY_STRING.getExistingQuota, [data.unit, data.date]);
            let updatedUsed
            if(existingData.rows.length > 0){
                updatedUsed = existingData.rows[0].used - data.qty; 
            }
            const params = [updatedUsed, data.unit, data.date]
            const query = `UPDATE quota_usage SET used = $1 WHERE "unit_no" = $2 and "date" = $3`;
            const res = await db.query(query, params)
          
        }
        await db.query('BEGIN')
        await db.query(`DELETE FROM form_lkf WHERE lkf_id = $1`, [params]);
        await db.query(`DELETE FROM form_data
        WHERE lkf_id = $1`, [params]);
        await db.query(`DELETE FROM fuelman_log
        USING form_lkf
        WHERE fuelman_log.jde_operator = form_lkf.fuelman_id
          AND fuelman_log."date" = form_lkf."date"
          AND fuelman_log.station = form_lkf.station
          AND form_lkf.lkf_id = $1`, [params]);

        await db.query('COMMIT');
        
        return true
    } catch (error) {
        logger.error(error)
        await db.query('ROLLBACK');
        console.error('Error during transaction:', error);
        return false
    }
}

module.exports = {
    editData,
    delData
}