const db = require('../../database/helper');
const { formattedHeaders, formatDDMonthYYYY,formattedHHMM } = require('../../helpers/dateHelper');
const logger = require('../../helpers/pinoLog');
const { getEquipment, getFilterBanlaws } = require('../../helpers/proto/master-data');
const { QUERY_STRING } = require('../../helpers/queryEnumHelper');


const getData = async(dateFrom, dateTo) => {
    try{
        const fetchData = await db.query(QUERY_STRING.getConsumtion, [dateFrom, dateTo])
        const uniqueNoUnits = [...new Set(fetchData.rows.map(item => item.no_unit))];
        const fetchUnit = await getEquipment(uniqueNoUnits)
        const unit = JSON.parse(fetchUnit.data)
        const dataUnit = unit
        .map((item) => ({
            desc: item.usage,
            unit_no: item.unit_no,
            egi: item.brand,
            owner: item.owner,
            location: item.site
        }))
        .sort((a, b) => {
            const descA = a.desc || ""; 
            const descB = b.desc || "";
            return descA.localeCompare(descB);
        });

        const formattedData = fetchData.rows.map((item) => {
            date = formattedHeaders(item.formatted_date)
            return {
                dates: date,
                no_unit: item.no_unit,
                total_qty: item.total_qty,
            };
        })

        return {
            dataConsumtion : formattedData,
            dataUnit: dataUnit
        }
    }catch(error){
        logger.error(error)
        console.error('Error during update:', error);
        return false;
    }
}

const getFCShift = async(dateFrom, dateTo) => {
    try{
        const fetchData = await db.query(QUERY_STRING.getConsumtionShift, [dateFrom, dateTo])
        const uniqueNoUnits = [...new Set(fetchData.rows.map(item => item.no_unit))];
        const fetchUnit = await getEquipment(uniqueNoUnits)
        const unit = JSON.parse(fetchUnit.data)
        const dataUnit = unit
        .map((item) => ({
            desc: item.usage,
            unit_no: item.unit_no,
            egi: item.brand,
            owner: item.owner,
            location: item.site
        }))
        .sort((a, b) => {
            const descA = a.desc || ""; 
            const descB = b.desc || "";
            return descA.localeCompare(descB);
        });

        const formattedData = fetchData.rows.map((item) => {
            date = formattedHeaders(item.formatted_date)
            return {
                dates: date,
                shift: item.shift,
                no_unit: item.no_unit,
                total_qty: item.total_qty,
            };
        })

        return {
            dataConsumtion : formattedData,
            dataUnit: dataUnit
        }
    }catch(error){
        logger.error(error)
        console.error('Error during update:', error);
        return false;
    }
}

const getFCHmkm = async(dateFrom, dateTo) => {
    try{
        const fetchData = await db.query(QUERY_STRING.getConsumtionAll, [dateFrom, dateTo])
        const uniqueNoUnits = [...new Set(fetchData.rows.map(item => item.no_unit))];
        const fetchUnit = await getEquipment(uniqueNoUnits)
        const unit = JSON.parse(fetchUnit.data)
        const dataUnit = unit
        .map((item) => ({
            desc: item.usage,
            unit_no: item.unit_no,
            egi: item.brand,
            owner: item.owner,
            location: item.site
        }))
        .sort((a, b) => {
            const descA = a.desc || ""; 
            const descB = b.desc || "";
            return descA.localeCompare(descB);
        });

        const formattedData = fetchData.rows.map((item) => {
            date = formattedHeaders(item.formatted_date)
            return {
                dates: date,
                shift: item.shift,
                hmkm:item.hm_km,
                no_unit: item.no_unit,
                total_qty: item.qty,
            };
        })

        return {
            dataConsumtion : formattedData,
            dataUnit: dataUnit
        }
    }catch(error){
        logger.error(error)
        console.error('Error during update:', error);
        return false;
    }
}

const getKPC = async(dateFrom, dateTo) => {
    try{
        const fetchData = await db.query(QUERY_STRING.getFCKpc, [dateFrom, dateTo])
        const uniqueNoUnits = [...new Set(fetchData.rows.map(item => item.station))];
        const fetchBanlaws = await getFilterBanlaws(uniqueNoUnits)
        const banlaws = JSON.parse(fetchBanlaws.data)

        const mergedData = fetchData.rows.map(item => {
            const matchingData = banlaws.find(data => data.unit_elipse === item.station);

            const totalQty = item.closing_dip - item.opening_dip
            const totalVar = totalQty - item.qty
          
            if (matchingData) {
              return { 
                tanggal: formatDDMonthYYYY(item.formatted_date),
                shift: item.shift == 'Day'? 'D' : 'N',
                transID: "",
                noBaa: item.fuelman_id,
                unitNo: item.station,
                operator: item.name_operator === "Nomor ID Salah" ? "" : item.name_operator, 
                qty: item.qty,
                sondingAwal: item.opening_dip,
                sondingAkhir: item.closing_dip,
                total: totalQty,
                var: totalVar,
                start: formattedHHMM(item.start),
                end: formattedHHMM(item.end),
                owner: matchingData.owner,
                unit_banlaw:  matchingData.unit_banlaw,
                pin_banlaw: matchingData.pin_banlaw,
               };
            }
            return { 
                tanggal: formatDDMonthYYYY(item.formatted_date),
                shift: item.shift == 'Day'? 'D' : 'N',
                transID: "",
                noBaa: item.fuelman_id,
                unitNo: item.station,
                operator: item.name_operator === "Nomor ID Salah" ? "" : item.name_operator, 
                qty: item.qty,
                sondingAwal: item.opening_dip,
                sondingAkhir: item.closing_dip,
                total: totalQty,
                var: totalVar,
                start: formattedHHMM(item.start),
                end: formattedHHMM(item.end),
                owner: "",
                pin_banlaw: "",
                unit_banlaw:  ""
            };
        });

        return mergedData
    }catch(error){
        logger.error(error)
        console.error('Error during update:', error);
        return false;
    }
}

module.exports = {
    getData,
    getFCShift,
    getFCHmkm,
    getKPC
}