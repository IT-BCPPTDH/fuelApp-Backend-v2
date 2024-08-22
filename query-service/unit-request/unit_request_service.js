const db = require('../../database/helper');
const { formatYYYYMMDD, prevFormatYYYYMMDD,formatDateToDDMMYYYY } = require('../../helpers/dateHelper');
const logger = require('../../helpers/pinoLog');
const { QUERY_STRING } = require('../../helpers/queryEnumHelper');

const getSummaryUnitReq = async (params) => {
    try {
        const queryTotal = await db.query(QUERY_STRING.getQuotaTotal, [params])
        const queryShiftDay = await db.query(QUERY_STRING.getTotalByShiftDay, [params])
        const queryShiftNight = await db.query(QUERY_STRING.getTotalByShiftNight, [params])

        const data = {
            totalQuota: queryTotal.rows[0].total ? queryTotal.rows[0].total: 0,
            totalDay: queryShiftDay.rows ? queryShiftDay.rows[0].total_day : 0,
            totalNight:queryShiftNight.rows == null ? queryShiftNight.rows[0].total_night : 0 
        }
        return data
    } catch (error) {
        logger.error(error)
        console.error('Error during update:', error);
        return false;
    }
};

const insertUnitReq = async (data) => {
    try {
        const dt = new Date()
        const { date, time, shift, unit_no, model, hmkm, quota_request, reason, document, request_by, request_name, approve_by, 
            approve_name, created_at, created_by} = data
        const params = [date, time, shift, unit_no, model, hmkm, quota_request, reason,  document, request_by, request_name, approve_by, 
            approve_name, created_at, created_by]
        let result = await db.query(QUERY_STRING.addQuota, params)
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

const tableUnitReq = async (params) => {
    try {
        const tanggal = formatYYYYMMDD(params.tanggal)
        const result = await db.query(QUERY_STRING.getAllReq, [tanggal])
        return result.rows
    } catch (error) {
        logger.error(error)
        console.error('Error during update:', error);
        return false;
    }
};

module.exports = {
    getSummaryUnitReq,
    insertUnitReq,
    tableUnitReq
}