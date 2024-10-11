const db = require('../../database/helper');
const knex = require('knex');
const knexConfig = require('../../knexfile');
const dbKnex = knex(knexConfig);
const logger = require('../../helpers/pinoLog');
const { QUERY_STRING } = require('../../helpers/queryEnumHelper')
const { formatDateToDDMMYYYY,formatYYYYMMDD, formatYYYYMMDDBefore } = require('../../helpers/dateHelper')

const insertToOperator = async (dataJson) => {
    try {
        let items
        const today = new Date().toISOString().split('T')[0];
        if (dataJson.unit_no.includes('LV') && !dataJson.unit_no.includes('HLV')) {
            if(dataJson.brand.includes('bus')){
                items = {
                    date: today,
                    unitNo: dataJson.unit_no,
                    modelUnit: "BUS",
                    quota: 20,
                    used: 0,
                    additional: 0 
                }
            }else{
                items = {
                    date: today,
                    unitNo: dataJson.unit_no,
                    modelUnit: "LV",
                    quota: 20,
                    used: 0,
                    additional: 0 
                }
            }
        }else{
            if(dataJson.brand.toLowerCase().includes('bus')){
                items = {
                    date: today,
                    unitNo: dataJson.unit_no,
                    modelUnit: "BUS",
                    quota: 40,
                    used: 0,
                    additional: 0 
                }
            }else{
                items = {
                    date: today,
                    unitNo: dataJson.unit_no,
                    modelUnit: "HLV",
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
        let dateBefore
        const dateNow = formatYYYYMMDD(params.tanggal)
        if(params.option == "Daily"){
            dateBefore = dateNow
        }else if(params.option == "Weekly"){
            const resultDate = formatYYYYMMDDBefore(dateNow, 7)
            dateBefore = resultDate
        }else{
            const resultDate = formatYYYYMMDDBefore(dateNow, 30)
            dateBefore = resultDate
        }
        let data = await db.query(QUERY_STRING.getAllQuota,[dateBefore, dateNow])
        const formattedResult = data.rows.map((item, index) => ({
            ...item,
            number: index+1,
            date: formatDateToDDMMYYYY(item.date)
        }));
        return formattedResult
    } catch (error) {
        logger.error(error)
        console.error('Error during update:', error);
        return false;
    }
}

const updateActive = async (params) => {
    const {active, unitNo} = params
    const query = 'UPDATE quota_usage SET "isActive" = $1 WHERE "unitNo" = $2'

    const value = [active, unitNo]
    const res = await db.query(query, value);
    return true
}

module.exports = {
    insertToOperator,
    getTotal,
    updateActive
}