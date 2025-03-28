const db = require('../../database/helper');
const knex = require('knex');
const knexConfig = require('../../knexfile');
const dbKnex = knex(knexConfig);
const logger = require('../../helpers/pinoLog');
const { QUERY_STRING } = require('../../helpers/queryEnumHelper')
const { formatDateOption,formatYYYYMMDD,formatDateToDDMMYYYY } = require('../../helpers/dateHelper')

const insertToOperator = async (dataJson, today) => {
    let items;

    if (dataJson.egi.toLowerCase().includes('bus elf') || dataJson.kategori.toLowerCase().includes('elf')) {
        items = {
            date: today,
            unit_no: dataJson.unit_no,
            model: dataJson.egi,
            kategori: dataJson.kategori,
            quota: dataJson.quota === 0 ? 40 : dataJson.quota,
            used: 0,
            additional: 0,
            is_active: dataJson.is_active // Ubah dari isActive ke is_active
        };
    } else {
        const egiLower = dataJson.egi.toLowerCase();
        let quota;
        let kategori = dataJson.kategori;

        if (egiLower.includes('colt') || dataJson.kategori.toLowerCase().includes('bus')) {
            quota = dataJson.quota === 0 ? 30 : dataJson.quota;
        } else if (egiLower.includes('triton') || dataJson.kategori.toLowerCase().includes('light vehicle')) {
            quota = dataJson.quota === 0 ? 20 : dataJson.quota;
        }

        items = {
            date: today,
            unit_no: dataJson.unit_no,
            model: dataJson.egi,
            kategori: kategori,
            quota: quota,
            used: 0,
            additional: 0,
            is_active: dataJson.is_active 
        };
    }

    const sanitizedColumns = Object.keys(items).map(key => `"${key}"`);
    const valuesPlaceholders = sanitizedColumns.map((_, idx) => `$${idx + 1}`).join(', ');
    const createOperatorQuery = `
      INSERT INTO quota_usage (${sanitizedColumns.join(', ')})
      VALUES (${valuesPlaceholders})
    `;
    const values = Object.values(items); // Ubah dari Object.keys(items).map() ke Object.values(items)

    try {
        const result = await db.query(createOperatorQuery, values);
        return !!result;
    } catch (error) {
        logger.error(error);
        console.error('Error during update:', error);
        return false;
    }
};


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
    const {active, unit_no, date} = params
    const formatDate = (dateStr) => {
        const [day, month, year] = dateStr.split('-'); 
        return `${year}-${month}-${day}`;
    };
    let dates = formatDate(date);
    const query = 'UPDATE quota_usage SET "is_active" = $1 WHERE "unit_no" = $2 and "date" = $3'
    const value = [active, unit_no, dates]
    const queryUnit = 'UPDATE unit_quota SET "is_active" = $1 WHERE "unit_no" = $2'
    const values = [active, unit_no]
    const res = await db.query(query, value);
    await db.query(queryUnit,values)
    if(res){
        return true
    }
    return false
}

const updateModel = async(updateFields) => {
    const setClauses = Object.keys(updateFields)
        .filter(field => field !== 'tanggal' && field !== 'kategori' && field !== 'model') // Exclude 'model'
        .map((field, index) => `${field} = $${index + 1}`)
        .join(', ');

    const values = Object.keys(updateFields)
        .filter(field => field !== 'tanggal' && field !== 'kategori' && field !== 'model') 
        .map(field => updateFields[field]);

    let date = formatYYYYMMDD(updateFields.tanggal);
    const opt = 'Daily'
    const dateBefore = formatDateOption(opt, date)
    let kategori = updateFields.kategori;
    let model = updateFields.model; 
    values.push(date, kategori, `%${model}%`);

    try{
        await updateUnitQuota(updateFields)
        const query = `UPDATE quota_usage SET ${setClauses} 
        WHERE "date" = $${values.length - 2} AND (kategori = $${values.length - 1} OR model LIKE $${values.length});`;
        const result = await db.query(query, values)
        if(result){
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

const updateUnitQuota = async (updateFields) => {
    const validFields = Object.keys(updateFields).filter(field => !['kategori', 'model', 'tanggal'].includes(field));

    if (validFields.length === 0) {
        console.error("No valid fields to update.");
        return false;
    }

    const setClauses = validFields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const values = validFields.map(field => updateFields[field]);

    let kategori = updateFields.kategori;
    let egi = updateFields.model;

    values.push(kategori, `%${egi}%`);

    try {
        const query = `
            UPDATE unit_quota 
            SET ${setClauses} 
            WHERE (kategori = $${values.length - 1}::TEXT OR egi LIKE $${values.length}::TEXT);
        `;

        const result = await db.query(query, values);

        if (result.rowCount > 0) {
            return true;
        }
        return false;
    } catch (error) {
        logger.error(error);
        console.error('Error during update:', error);
        return false;
    }
};

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

const insertOne = async (params) => {
    try{
        let { date, unit_no, model, kategori, quota } = params;
        const param = [ date, unit_no, model, kategori, quota ];
        const result = await db.query(QUERY_STRING.insert_limited, param);
        if(result){
            return true
        }else{
            return false
        }
    }catch(error){
        logger.error(error)
        console.error('Error during update:', error);
        return false;
    }
}

module.exports = {
    insertToOperator,
    getTotal,
    updateActive,
    updateModel,
    updateTab,
    insertOne
}