const db = require('../../database/helper');
const { formatYYYYMMDD, prevFormatYYYYMMDD,formatDateToDDMMYYYY } = require('../../helpers/dateHelper');
const logger = require('../../helpers/pinoLog');
const { QUERY_STRING } = require('../../helpers/queryEnumHelper');

const getTotalDashboard = async (params) => {
    try {
        let result
        const dateNow = formatYYYYMMDD(params.tanggal)
        result = await filterData(params.tanggal, false)
        let dataSonding = await db.query(QUERY_STRING.getTotalSonding,[dateNow])
        let dataType = await db.query(QUERY_STRING.getTotalType,[dateNow])
        const data = { 
            prevSonding : result.dataClosingPrev ? result.dataClosingPrev: 0,
            openSonding :  dataSonding.rows[0].total_opening,
            reciptKpc: dataType.rows[0].total_receive,
            issuedTrx: dataType.rows[0].total_issued,
            tfTrx: dataType.rows[0].total_transfer,
            closeData: result.closeDataPrev,
            closeSonding: dataSonding.rows[0].total_closing,
            variant: result.variants,
            intershiftNtoD: result.interShiftNtoDs,
            intershiftDtoN: result.interShiftDtoNs
        }
        return data
    } catch (error) {
        logger.error(error)
        console.error('Error during update:', error);
        return false;
    }
};

const getTableDashboard = async (params) => {
    try{
        let result
        const dateNow = formatYYYYMMDD(params.tanggal)
        const getDataStations =  await db.query(QUERY_STRING.getTotals, [dateNow])
        result = await filterData(params.tanggal, true)
        const mergedData = getDataStations.rows.map(itemA => {
            const matchingItemB = result.find(itemB => itemB.station === itemA.station);
            if (matchingItemB) {
              return {
                ...itemA,
                date: formatDateToDDMMYYYY(matchingItemB.date),
                closeDataPrev: matchingItemB.closeDataPrev,
                variants: matchingItemB.variants,
                interShift: matchingItemB.interShift
              };
            }
            return {
                ...itemA,
                date: formatDateToDDMMYYYY(itemA.date)
            };
        });
          
        return mergedData
    }catch(err){
        logger.error(err)
        console.error('Error during update:', err);
        return false;
    }
}

async function processShiftData(date, shift, openingSonding) {
    const getDataPrev = await db.query(QUERY_STRING.getPrevious, [date, shift]);
    const dataClosingPrev = getDataPrev.rows[0].total_closing;
    const totalDataType = await db.query(QUERY_STRING.getTotalType, [date]);
    const closeDataPrev = getDataPrev.rows[0].total_opening
        + totalDataType.rows[0].total_receive
        - totalDataType.rows[0].total_issued
        - totalDataType.rows[0].total_transfer;
    const variants = dataClosingPrev - closeDataPrev;
    const interShift = openingSonding - dataClosingPrev;

    return {
        dataClosingPrev,
        closeDataPrev,
        variants,
        interShift
    };
}

async function processDataTable(date, shift, openingSonding) {
    let closeDataPrev, variants, interShift, data
    const updatedData = [];
    const getDataPrev = await db.query(QUERY_STRING.getTotalBefores, [date, shift]);
    for (let i = 0;  i < getDataPrev.rows.length; i++ ){
        const items = getDataPrev.rows[i];
        closeDataPrev = items.total_opening
            + items.total_receive
            - items.total_issued
            - items.total_transfer;
        variants = items.total_closing - closeDataPrev;
        interShift = openingSonding - items.total_closing;
        

        data = {
            ...items,
            closeDataPrev,
            variants,
            interShift
        }
        updatedData.push(data)
    }
    
    return updatedData
}

async function filterData(dates,  isTable) {
    let shift, date, result, res
    const dateNow = formatYYYYMMDD(dates)
    const datePrevs = prevFormatYYYYMMDD(dates)
    const getData = await db.query(QUERY_STRING.getAllLkf, [dateNow])
    const openData = getData.rows.filter(entry => entry.shift === "Night");
    if(openData.length > 0){
        const lastData = getData.rows.length - 1
        shift = getData.rows[lastData].shift === "Night" ? 'Day' : 'Night';
        date = getData.rows[lastData].shift === "Night" ? dateNow : datePrevs;
        if(isTable){
            result = await processDataTable(date, shift, getData.rows[lastData].opening_sonding);
        }else{
            res = await processShiftData(date, shift, getData.rows[lastData].opening_sonding);
            result = {
                ...res,
                interShiftDtoNs : res.interShift
                
            }
        }
    }else{
        const lastData = openData.length - 1
        if(lastData != -1){
            shift = openData[lastData].shift === "Night" ? 'Day' : 'Night';
            date = openData[lastData].shift === "Night" ? dateNow : datePrevs;
            if(isTable){
                result = await processDataTable(date, shift, getData.rows[lastData].opening_sonding);
            }else{
                result = await processShiftData(date, shift, getData.rows[lastData].opening_sonding);
                result = {
                    ...res,
                    interShiftDtoNs : res.interShift
                }
            }
        }else{
            return false
        }
       
    }
    return result
}


module.exports = {
    getTotalDashboard,
    getTableDashboard
}