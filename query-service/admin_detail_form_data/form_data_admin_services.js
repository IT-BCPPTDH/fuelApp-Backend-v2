const db = require('../../database/helper');
const { formatYYYYMMDD, prevFormatYYYYMMDD,formatDateToDDMMYYYY, formattedHHMMservice } = require('../../helpers/dateHelper');
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

const insertBulkData = async(header, dataArray, userData) => {
    try {
        const today = new Date()
        const dateNow = formatYYYYMMDD(today)
        let unitLimited = []
        let lkfId; 

        for (item of header) {
            lkfId = item[0]
        }

        for (const row of dataArray) {
            const fethUnit = await getEquipment([row[0]])
            const unit = JSON.parse(fethUnit.data)
            const typeMap = {
                "I": "Issued",
                "T": "Transfer",
                "R": "Receive",
                "K": "Receipt KPC"
            };
            const typeTrx = typeMap[row[9]] || "Unknown";

            const fetchLastData = await db.query(QUERY_STRING.getLastDataByStation, [unit[0].unit_no])
            const unitLast = fetchLastData.rows

            const jmlFbr = (parseFloat(row[1]) - unitLast[0].hm_km) / Number(row[2])
            let dt = Math.floor(Date.now() / 1000);
            const users = await fetchUser()
            const user = users.data.find((item) => item.JDE == row[3])

            const dataJson = {
                from_data_id: dt,
                no_unit: unit[0].unit_no,
                model_unit: unit[0].type,
                owner: unit[0].owner,
                date_trx: dateNow,
                qty: row[2],
                hm_km: row[1],
                jde_operator: user.JDE,
                name_operator: user.fullname ? user.fullname : "",
                start: formattedHHMMservice(row[4]),
                end: formattedHHMMservice(row[5]),
                flow_start: row[6],
                flow_end: row[7],
                type: typeTrx,
                fbr: jmlFbr,
                lkf_id: lkfId,
                created_at: today,
                created_by: userData.JDE
            };

            const sanitizedColumns = Object.keys(dataJson).map(key => `"${key}"`);
            const valuesPlaceholders = sanitizedColumns.map((_, idx) => `$${idx + 1}`).join(', ');

            const createOperatorQuery = `
              INSERT INTO form_data (${sanitizedColumns.join(', ')})
              VALUES (${valuesPlaceholders})
            `;

            const values = Object.keys(dataJson).map(key => {
              if (key === 'created_at' && dataJson[key] instanceof Date) {
                return dataJson[key].toISOString();
              }
              if (key === 'start' || key === 'end') {
                return dataJson[key].toString();
              }
              return dataJson[key];
            });

            const limitQuota = await db.query(QUERY_STRING.getQuota, [dataJson.no_unit])
         
            if(dataJson.no_unit.includes('LV') || dataJson.no_unit.includes('HLV')){
                const totalActual = dataJson.qty + limitQuota.rows[0].used;
                if(limitQuota.rows[0].quota > totalActual){
                    const params = [dataJson.qty, dataJson.no_unit];
                    const updateQuotaQuery = `UPDATE quota_usage SET used = $1 WHERE "unitNo" = $2 and "date" = '2024-10-29'`;
                    await db.query(updateQuotaQuery, params);
                    await db.query(createOperatorQuery, values);
                }else{
                    unitLimited.push(dataJson.no_unit)
                }
            }else{
                await db.query(createOperatorQuery, values);
            }
        }

        return unitLimited

    } catch (error) {
        logger.error(error)
        return false
    }
}

module.exports = {
    getTotalData,
    getTableData,
    insertBulkData
}