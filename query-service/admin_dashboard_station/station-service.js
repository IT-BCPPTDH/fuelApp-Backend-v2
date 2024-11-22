const db = require('../../database/helper');
const { formatYYYYMMDD, formatDateOption,formatDateToDDMMYYYY, formatDateTimeToDDMMYYYY_HHMMSS } = require('../../helpers/dateHelper');
const logger = require('../../helpers/pinoLog');
const { QUERY_STRING } = require('../../helpers/queryEnumHelper');
const { getTableStation } = require('./get-data-service');

const editData = async(updateFields) => {
    try {
        const setClauses = Object.keys(updateFields)
            .filter(field => field !== 'lkf_id')  
            .map((field, index) => `${field} = $${index + 1}`)
            .join(', ');

        const values = Object.keys(updateFields)
            .filter(field => field !== 'lkf_id')
            .map(field => updateFields[field]);

        values.push(updateFields.lkf_id);

        const query = `UPDATE form_data SET ${setClauses} WHERE lkf_id = $${values.length}`;
        const result = await db.query(query, values)

        if(result){
            const fetchNewData = await getTableStation(data)
            if(fetchNewData.rows !== 0 ){
                return fetchNewData.rows
            }
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
        const getData = await db.query(QUERY_STRING.getLkfById, [params])
        const delFormData = await db.query(QUERY_STRING.deleteForm, [params])
        const delFuelman = await db.query(QUERY_STRING.deleteFuelmanLog, [getData.rows[0].station, getData.rows[0].date])
        const delLkf = await db.query(QUERY_STRING.deleteLkf, [params])
        return false
    } catch (error) {
        logger.error(error)
        console.log(error)
        return false
    }
}

module.exports = {
    editData,
    delData
}