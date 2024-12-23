const db = require('../../database/helper');
const knex = require('knex');
const knexConfig = require('../../knexfile');
const dbKnex = knex(knexConfig);
const logger = require('../../helpers/pinoLog');
const { QUERY_STRING } = require('../../helpers/queryEnumHelper')
const { formatDateOption,formatYYYYMMDD,formatDateToDDMMYYYY,prevFormatYYYYMMDD } = require('../../helpers/dateHelper')

const insertToOperator = async (dataJson, today) => {
    let items
    if(dataJson.EGI.toLowerCase().includes('bus elf')){
        items = {
            date: today,
            unit_no: dataJson.unit_no,
            model: dataJson.EGI,
            kategori: dataJson.kategori,
            quota: 40,
            used: 0,
            additional: 0 
        }
    }else {
        const egiLower = dataJson.EGI.toLowerCase(); 
        let quota = 0;
        let kategori = dataJson.kategori;
    
        if (egiLower.includes('colt')) {
            quota = 30;
        } else if (egiLower.includes('triton') || dataJson.kategori.toLowerCase().includes('light vehicle')) {
            quota = 20;
        }
    
        items = {
            date: today,
            unit_no: dataJson.unit_no,
            model: dataJson.EGI,
            kategori: kategori,
            quota: quota,
            used: 0,
            additional: 0
        };
    }
    
    const sanitizedColumns = Object.keys(items).map(key => `"${key}"`);
    const valuesPlaceholders = sanitizedColumns.map((_, idx) => `$${idx + 1}`).join(', ');
    const createOperatorQuery = `
      INSERT INTO quota_usage (${sanitizedColumns.join(', ')})
      VALUES (${valuesPlaceholders})
    `;
    const values = Object.keys(items).map(key => items[key]);
    try {
        const result = await db.query(createOperatorQuery, values);
        if(result){
            return true
        }
        return false
    } catch (error) {
        logger.error(error)
        console.error('Error during update:', error);
        return false;
    }
}

const getTotal = async (params)  => {
    try {
        const dateNow = formatYYYYMMDD(params.tanggal)
        const dateBefore = formatDateOption(params.option, dateNow)
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
    const {active, unitNo, date} = params
    const query = 'UPDATE quota_usage SET "is_active" = $1 WHERE "unit_no" = $2 and "date" = $3'

    const value = [active, unitNo, date]
    const res = await db.query(query, value);
    return true
}

const updateModel = async(updateFields) => {
    const setClauses = Object.keys(updateFields)
        .filter(field => field !== 'tanggal' && field !== 'kategori') 
        .map((field, index) => `${field} = $${index + 1}`)
        .join(', ');

    const values = Object.keys(updateFields)
        .filter(field => field !== 'tanggal' && field !== 'kategori')
        .map(field => updateFields[field]);

    let date = formatYYYYMMDD(updateFields.tanggal);
    const opt = 'Daily'
    const dateBefore = formatDateOption(opt, date)
    let model = updateFields.kategori;
    values.push(date, model); 

    try{
        const query = `UPDATE quota_usage SET ${setClauses} WHERE "date" = $${values.length - 1} AND kategori = $${values.length}`;
        const result = await db.query(query, values)
        if(result){
            // const getActivedModal = await db.query(QUERY_STRING.getMaxQuota, [date, model])
            const getAlldata = await db.query(QUERY_STRING.getAllQuota, [dateBefore, date])

            const formattedResult = getAlldata.rows.map((item, index) => ({
                ...item,
                number: index+1,
                date: formatDateToDDMMYYYY(item.date)
            }));

            return formattedResult
        }
        return false
    }catch(error){
        logger.error(error)
        console.error('Error during update:', error);
        return false;
    }
}

const updateTab = async (params) => {
    const {used,id} = params
    const query = `
    UPDATE quota_usage 
    SET "used" = "used" + $1 
    WHERE "id" = $2
  `;
    
    const value = [used,id]
    const res = await db.query(query, value);
    return true
}

module.exports = {
    insertToOperator,
    getTotal,
    updateActive,
    updateModel,
    updateTab
}