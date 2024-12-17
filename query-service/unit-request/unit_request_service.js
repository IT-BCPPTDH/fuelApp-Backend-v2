const db = require('../../database/helper');
const { formatYYYYMMDD, formatDateToDDMMYYYY, formattedHHMM } = require('../../helpers/dateHelper');
const logger = require('../../helpers/pinoLog');
const { QUERY_STRING } = require('../../helpers/queryEnumHelper');
const { base64ToImageReq } = require('../../helpers/base64toImage')

const getSummaryUnitReq = async (params) => {
    try {
        const queryTotal = await db.query(QUERY_STRING.getQuotaTotal, [params])
        const queryShiftDay = await db.query(QUERY_STRING.getTotalByShiftDay, [params])
        const queryShiftNight = await db.query(QUERY_STRING.getTotalByShiftNight, [params])

        const data = {
            totalQuota: queryTotal.rows[0].total ? queryTotal.rows[0].total: 0,
            totalAllUnit: queryTotal.rows[0].total ? queryTotal.rows[0].total_unit: 0,
            totalDay: queryShiftDay.rows ? queryShiftDay.rows[0].total_day : 0,
            totalUnitDay: queryShiftDay.rows ? queryShiftDay.rows[0].total_unit : 0,
            totalNight:queryShiftNight.rows  ? queryShiftNight.rows[0].total_night : 0,
            totalUnitNight:queryShiftNight.rows ? queryShiftNight.rows[0].total_unit : 0  
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
        let result
        let { date,  shift, unit_no, model, quota_request, reason, document, request_by, request_name, approve_by, 
            approve_name, created_at, created_by} = data
        
        let pic = await base64ToImageReq(document)

        const params = [date, shift, unit_no, model, quota_request, reason,  pic, request_by, request_name, approve_by, 
            approve_name, created_at, created_by]

        if(data.unit_no.includes('LV') || data.unit_no.includes('HLV')){
            const existingData = await db.query(QUERY_STRING.getExistingQuota, [unit_no,date])
            const query = `UPDATE quota_usage SET additional = $1 WHERE "unit_no" = $2 and "date" = $3`;

            if(existingData.rows.length > 0){
                quota_request = parseFloat(quota_request) + parseFloat(existingData.rows[0].additional);
                const value = [quota_request, unit_no, date]
                const res = await db.query(query, value);
                result = await db.query(QUERY_STRING.addQuota, params)
            }
        }

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
        const formattedData = result.rows.map(item => ({
            ...item,
            date: formatDateToDDMMYYYY(item.date)
        }));
        return formattedData
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