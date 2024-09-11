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
        const jmlBalance = result[0].opening_sonding - jmlIssued
        const data = { 
            openStock : result[0].opening_dip,
            receipt: result[0].total_receipt,
            stock: result[0].opening_sonding,
            issued: result[0].total_issued + result[0].total_transfer,
            totalBalance: jmlIssued,
            closingStock : result[0].closing_stock,
            dailyVarience: jmlBalance, 
            startMeter: result[0].flow_meter_start,
            closeMeter: result[0].flow_meter_end,
            totalMeter: result[0].flow_meter_end - result[0].flow_meter_start
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


module.exports = {
    getTotalData,
    getTableData
}