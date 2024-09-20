const db = require('../../database/helper');
const knex = require('knex');
const knexConfig = require('../../knexfile');
const dbKnex = knex(knexConfig);
const { QUERY_STRING } = require('../../helpers/queryEnumHelper')

const insertToOperator = async (dataJson) => {
    try {
        let items
        const today = new Date().toISOString().split('T')[0];
        if (dataJson.unit_no.includes('LV') && !dataJson.unit_no.includes('HLV')) {
            items = {
                date: today,
                unitNo: dataJson.unit_no,
                quota: 20,
                used: 0,
                additional: 0 
            }
        }else{
            if(dataJson.brand.toLowerCase().includes('bus')){
                items = {
                    date: today,
                    unitNo: dataJson.unit_no,
                    quota: 40,
                    used: 0,
                    additional: 0 
                }
            }else{
                items = {
                    date: today,
                    unitNo: dataJson.unit_no,
                    quota: 30,
                    used: 0,
                    additional: 0 
                }
            }
        }
        const sanitizedColumns = Object.keys(items).map(key => `"${key}"`);
        const valuesPlaceholders = sanitizedColumns.map((_, idx) => `$${idx + 1}`).join(', ');

        const createOperatorQuery = `
          INSERT INTO quota_usage (${sanitizedColumns.join(', ')})
          VALUES (${valuesPlaceholders})
        `;

        const values = Object.keys(items).map(key => items[key]);
        const result = await db.query(createOperatorQuery, values);

        if(result){
            return true
        }
        return false

    } catch (error) {
        console.log(error)
        return false
    }
}

const getTotal = async (params)  => {
    try {
        let data = await db.query(QUERY_STRING.getAllQuota,[params])
        return data.rows
    } catch (error) {
        logger.error(error)
        console.error('Error during update:', error);
        return false;
    }
}

module.exports = {
    insertToOperator,
    getTotal
}