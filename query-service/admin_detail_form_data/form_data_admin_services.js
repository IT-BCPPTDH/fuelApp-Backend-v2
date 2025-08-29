const db = require('../../database/helper');
const { formatYYYYMMDD, formatDateTimeToDDMMYYYY_HHMMSS, formattedHHMMservice, formatInputYYYYMMDD } = require('../../helpers/dateHelper');
const { fetchUser } = require('../../helpers/httpHelper');
const logger = require('../../helpers/pinoLog');
const { getEquipment } = require('../../helpers/proto/master-data');
const { QUERY_STRING } = require('../../helpers/queryEnumHelper');

const getTotalData = async (params) => {
    try {
        const res = await db.query(QUERY_STRING.getAllFormData,[params])
        const result = res.rows
        if(result.length == 0){
            return false
        }
        const totalReceived = result[0].total_receive + result[0].total_receive_kpc
        const jmlIssued = result[0].total_issued + result[0].total_transfer
        const jmlStock = result[0].total_open + totalReceived
        const jmlBalance = jmlStock - jmlIssued
        const totalIssued = result[0].total_issued + result[0].total_transfer
        const totalMeters = result[0].flow_meter_end - result[0].flow_meter_start
        const daily = result[0].total_close - jmlBalance
        const data = { 
            openStock : result[0].total_open ? result[0].total_open.toLocaleString('en-US') : 0,
            receipt: totalReceived ? totalReceived.toLocaleString('en-US') : 0,
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
        const formattedRows = data.rows.map((row) => ({
            ...row,
            entry_time: formatDateTimeToDDMMYYYY_HHMMSS(row.created_at), 
            sync_time: formatDateTimeToDDMMYYYY_HHMMSS(row.created_at), 
        }));
        
        return formattedRows
    }catch(err){
        logger.error(err)
        console.error('Error during update:', err);
        return false;
    }
}

const insertBulkData = async(header, dataArray, userData) => {
    try {
        const today = new Date()
        let unitLimited = {
            successCount: 0,
            quotaAffectedUnits: [],
            unitQuotaInfo: [],
            failedCount: 0,
            failedData: []
        }
        let lkfId, dateNow;         

        for (item of header) {
            lkfId = item[0]
            dateNow = formatInputYYYYMMDD(item[1])
        }

        for (const row of dataArray) {
            try {
                const fethUnit = await getEquipment([row[0]])
                const unit = JSON.parse(fethUnit.data)
                const typeMap = {
                    "I": "Issued",
                    "T": "Transfer",
                    "R": "Receive",
                    "K": "Receipt KPC"
                };
                const typeTrx = typeMap[row[9]] || "Unknown";
                
                // Check if unit exists
                if(unit.length === 0){
                    unitLimited.failedCount++;
                    unitLimited.failedData.push({
                        no_unit: row[0],
                        reason: "data unit tidak ada",
                        type: typeMap[row[9]]
                    });
                    continue;
                }
                
                const fetchLastData = await db.query(QUERY_STRING.getLastDataByStation, [unit[0].unit_no, dateNow])
                // Check if last data exists
                if(fetchLastData.rowCount === 0){
                    unitLimited.failedCount++;
                    unitLimited.failedData.push({
                        no_unit: unit[0].unit_no,
                        reason: "tidak ada data sebelumnya"
                    });
                    continue;
                }
                
                const unitLast = fetchLastData.rows
                const lastQty = unitLast[0].qty == null ? 0 : unitLast[0].qty
                const lastHmkm = unitLast[0].hm_km == null ? 0 : unitLast[0].hm_km
                const jmlFbr = lastQty / (parseFloat(row[1]) - lastHmkm) 
                let dt = Math.floor(Date.now() / 1000);
                const users = await fetchUser()
                const user = users.data.find((item) => item.JDE == row[3])
                // Check if user exists
                if(!user){
                    unitLimited.failedCount++;
                    unitLimited.failedData.push({
                        no_unit: unit[0].unit_no,
                        reason: "data user tidak ada",
                        jde: row[3]
                    });
                    continue;
                }
                
                // Handle HHMM numeric format (e.g., 2016 -> "20:16")
                // Fix invalid time format: if hours is "24", convert to "00"
                const formatHHMMNumeric = (timeValue) => {
                    if (typeof timeValue === 'number') {
                        const timeStr = timeValue.toString().padStart(4, '0');
                        let hours = timeStr.substring(0, 2);
                        const minutes = timeStr.substring(2, 4);
                        
                        // Fix invalid hour "24" to "00"
                        if (hours === '24') {
                            hours = '00';
                        }
                        
                        return `${hours}:${minutes}`;
                    } else if (typeof timeValue === 'string') {
                        const timeStr = timeValue.padStart(4, '0');
                        let hours = timeStr.substring(0, 2);
                        const minutes = timeStr.substring(2, 4);
                        
                        // Fix invalid hour "24" to "00"
                        if (hours === '24') {
                            hours = '00';
                        }
                        
                        return `${hours}:${minutes}`;
                    }
                    return '00:00';
                };
                
                const startTime = formatHHMMNumeric(row[4]);
                const endTime = formatHHMMNumeric(row[5]);
                
                const values = [
                    dt, // from_data_id
                    unit[0].unit_no, // no_unit
                    unit[0].type, // model_unit
                    unit[0].owner, // owner
                    dateNow, // date_trx - pass as string, let the database handle the conversion
                    lastHmkm, // hm_last (not used in this context)
                    row[1], // hm_km
                    lastQty, // qty_last (not used in this context)
                    row[2], // qty
                    row[6], // flow_start
                    row[7], // flow_end
                    user.JDE ? user.JDE : "", // jde_operator
                    user.fullname ? user.fullname : "Tidak ada operator", // name_operator
                    startTime, // start
                    endTime, // end
                    jmlFbr.toFixed(2), // fbr
                    lkfId, // lkf_id
                    null, // signature (not used in this context)
                    typeTrx, // type
                    null, // photo (not used in this context)
                    today, // sync_time
                    userData.JDE // created_by
                ];
                
                 // Ambil data kuota berdasarkan unit baru
                const currQuotaData = await db.query(QUERY_STRING.getExistingQuota, [unit[0].unit_no, dateNow]);
                const quotaExists = currQuotaData.rowCount > 0;
        
                if (quotaExists) {
                    // Add to unit quota info
                    unitLimited.unitQuotaInfo.push({
                        no_unit: unit[0].unit_no,
                        used: currQuotaData.rows[0].used,
                        quota: currQuotaData.rows[0].quota,
                        additional: currQuotaData.rows[0].additional
                    });
                    
                    let used = parseFloat(currQuotaData.rows[0].used);
                    const limit = parseFloat(currQuotaData.rows[0].quota) + parseFloat(currQuotaData.rows[0].additional);
                    const isNewIssued = typeTrx === 'Issued';
                    
                    // Update used quota if it's an issued type
                    if (isNewIssued) {
                        used += parseFloat(row[2]); // qty
                        unitLimited.quotaAffectedUnits.push(unit[0].unit_no);
                    }
        
                    if (used > limit) {
                        unitLimited.failedCount++;
                        unitLimited.failedData.push({
                            no_unit: unit[0].unit_no,
                            reason: "unit melebihi kapasitas",
                            used: used,
                            limit: limit
                        });
                        continue;
                    }
        
                    const updateQuotaQuery = `UPDATE quota_usage SET used = $1 WHERE "unit_no" = $2 AND "date" = $3`;
                    await db.query(updateQuotaQuery, [used, unit[0].unit_no, dateNow]);
                }

                await db.query(QUERY_STRING.postFormData, values);
                unitLimited.successCount++;
                
            } catch (rowError) {
                console.log(rowError)
                logger.error(rowError)
                unitLimited.failedCount++;
                unitLimited.failedData.push({
                    row_data: row,
                    reason: "Error processing row",
                    error: rowError.message
                });
            }

           
        }
        return unitLimited
    } catch (error) {
        console.log(error)
        logger.error(error)
        return false
    }
}

module.exports = {
    getTotalData,
    getTableData,
    insertBulkData
}
