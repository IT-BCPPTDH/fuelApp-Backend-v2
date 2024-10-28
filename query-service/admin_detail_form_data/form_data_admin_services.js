const db = require('../../database/helper');
const { formatYYYYMMDD, prevFormatYYYYMMDD,formatDateToDDMMYYYY } = require('../../helpers/dateHelper');
const logger = require('../../helpers/pinoLog');
const { QUERY_STRING } = require('../../helpers/queryEnumHelper');

const getTotalData = async (params) => {
    try {
        const res = await db.query(QUERY_STRING.getAllFormData,[params])
        const result = res.rows
        if(result.length == 0){
            return false
        }
        const jmlIssued = result[0].total_issued + result[0].total_transfer
        const jmlStock = result[0].total_open  + result[0].total_receive + result[0].total_receive_kpc 
        const jmlBalance = jmlStock - jmlIssued
        const totalIssued = result[0].total_issued + result[0].total_transfer
        const totalMeters = result[0].flow_meter_end - result[0].flow_meter_start
        const daily = result[0].total_close - jmlBalance
        const data = { 
            openStock : result[0].total_open ? result[0].total_open.toLocaleString('en-US') : 0,
            receipt: result[0].total_receive ? result[0].total_receive.toLocaleString('en-US') : 0,
            receipt_kpc: result[0].total_receive_kpc ? result[0].total_receive_kpc.toLocaleString('en-US') : 0,
            stock: jmlStock ? jmlStock.toLocaleString('en-US') : 0,
            issued: totalIssued ? totalIssued.toLocaleString('en-US') : 0,
            totalIssued: jmlIssued ? jmlIssued.toLocaleString('en-US') : 0,
            totalBalance: jmlBalance ? jmlBalance.toLocaleString('en-US') : 0,
            closingStock : result[0].total_close ? result[0].total_close.toLocaleString('en-US') : 0,
            dailyVarience: daily ? daily.toLocaleString('en-US') : 0, 
            startMeter: result[0].flow_meter_start ? result[0].flow_meter_start.toLocaleString('en-US') : 0,
            closeMeter: result[0].flow_meter_end ? result[0].flow_meter_end.toLocaleString('en-US') : 0,
            totalMeter: totalMeters ? totalMeters.toLocaleString('en-US') : 0
        }
        return data
    } catch (error) {
        logger.error(error)
        console.error('Error during update:', error);
        return false;
    }
};

const getTableData = async (params) => {
    try{
        const data = await db.query(QUERY_STRING.getTableFormData, [params])
        return data.rows
    }catch(err){
        logger.error(err)
        console.error('Error during update:', err);
        return false;
    }
}

const insertBulkData = async(dataJson) => {
    try {
        const sanitizedColumns = Object.keys(dataJson).map(key => `"${key}"`);
        const valuesPlaceholders = sanitizedColumns.map((_, idx) => `$${idx + 1}`).join(', ');

        const createOperatorQuery = `
          INSERT INTO form_data (${sanitizedColumns.join(', ')})
          VALUES (${valuesPlaceholders})
        `;

        const values = Object.keys(dataJson).map(key => dataJson[key]);
        const result = await db.query(createOperatorQuery, values);

        //jumlahkan dulu bila qty dari nomor yang sama
        if (dataJson.no_unit.includes('LV') || dataJson.no_unit.includes('HLV')) {
            
            const existingData = await db.query(QUERY_STRING.getExistingQuota, [dataJson.no_unit])
            if(existingData.rows.length > 0){
                dataJson.qty += existingData.rows[0].used
            }

            const params = [dataJson.qty, dataJson.no_unit]
            const query = `UPDATE quota_usage SET used = $1 WHERE "unitNo" = $2`;
            const res = await db.query(query, params)
        }

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

module.exports = {
    getTotalData,
    getTableData
}