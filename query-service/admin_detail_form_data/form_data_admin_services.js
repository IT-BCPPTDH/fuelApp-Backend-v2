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
        const jmlStock = result[0].total_open - result[0].total_close + result[0].total_receive + result[0].total_receive_kpc
        const jmlBalance = jmlStock - jmlIssued
        const totalIssued = result[0].total_issued + result[0].total_transfer
        const totalMeters = result[0].flow_meter_end - result[0].flow_meter_start
        const data = { 
            openStock : result[0].total_open ? result[0].total_open.toLocaleString('en-US') : 0,
            receipt: result[0].total_receive ? result[0].total_receive.toLocaleString('en-US') : 0,
            stock: jmlStock ? jmlStock.toLocaleString('en-US') : 0,
            issued: totalIssued ? totalIssued.toLocaleString('en-US') : 0,
            totalIssued: jmlIssued ? jmlIssued.toLocaleString('en-US') : 0,
            totalBalance: jmlBalance ? jmlBalance.toLocaleString('en-US') : 0,
            closingStock : result[0].total_close ? result[0].total_close.toLocaleString('en-US') : 0,
            dailyVarience: result[0].variant ? result[0].variant.toLocaleString('en-US') : 0, 
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


module.exports = {
    getTotalData,
    getTableData
}