const db = require('../../database/helper');
const { formatYYYYMMDD, prevFormatYYYYMMDD,formatDateToDDMMYYYY, formatDateTimeToDDMMYYYY_HHMMSS } = require('../../helpers/dateHelper');
const logger = require('../../helpers/pinoLog');
const { QUERY_STRING } = require('../../helpers/queryEnumHelper');

const getTotalStation = async (params) => {
    try {
        let result
        const dateNow = formatYYYYMMDD(params.tanggal)
        const station = params.station
        result = await filterData(params.tanggal, station, false)
        let dataSonding = await db.query(QUERY_STRING.getTotalsStations,[station, dateNow])
        const data = { 
            prevSonding : result.dataClosingPrev ? result.dataClosingPrev: 0,
            openSonding :  dataSonding.rows[0].total_opening,
            reciptKpc: dataSonding.rows[0].total_receive,
            issuedTrx: dataSonding.rows[0].total_issued,
            tfTrx: dataSonding.rows[0].total_transfer,
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

const getTableStation = async (params) => {
    try{
        const dateNow = formatYYYYMMDD(params.tanggal)
        const station = params.station
        const getDataStations =  await db.query(QUERY_STRING.getShiftStation, [station, dateNow])
        const loginData = await db.query(QUERY_STRING.getLogStation, [station, dateNow])

        const mergedData = getDataStations.rows.map(itemA => {
            const matchingItemB = loginData.rows.find(itemB => itemB.station === itemA.station
                && itemB.jde_operator === itemA.fuelman_id);
                console.log(1, itemA)

            const formattedDate = formatDateToDDMMYYYY(itemA.date)
            const formattedLogin = formatDateTimeToDDMMYYYY_HHMMSS(itemA.time_opening)
            if (matchingItemB) {
              return {
                ...itemA,
                date: formattedDate,
                time_opening: formattedLogin,
                login_time: matchingItemB.login_time ? formatDateTimeToDDMMYYYY_HHMMSS(matchingItemB.login_time) : 'N/A',
                logout_time: matchingItemB.logout_time ? formatDateTimeToDDMMYYYY_HHMMSS(matchingItemB.logout_time) : 'N/A'
              };
            }
            return {
                ...itemA,
                date: formattedDate,  
                time_opening: formattedLogin  
              };
        });
        return mergedData
    }catch(err){
        logger.error(err)
        console.error('Error during update:', err);
        return false;
    }
}

async function processShiftData(date, shift, station, openingSonding) {
    const getDataPrev = await db.query(QUERY_STRING.getPreviouss, [date,shift,station]);
    const dataClosingPrev = getDataPrev.rows[0].total_closing;
    const closeDataPrev = getDataPrev.rows[0].total_opening
        + getDataPrev.rows[0].total_receive
        - getDataPrev.rows[0].total_issued
        - getDataPrev.rows[0].total_transfer;
    const variants = dataClosingPrev - closeDataPrev;
    const interShift = openingSonding - dataClosingPrev;

    return {
        dataClosingPrev,
        closeDataPrev,
        variants,
        interShift
    };
}

async function filterData(dates, station) {
    let shift, date, result, res
    const dateNow = formatYYYYMMDD(dates)
    const datePrevs = prevFormatYYYYMMDD(dates)
    const getData = await db.query(QUERY_STRING.getAllLkfTotal, [dateNow, station])
    const openData = getData.rows.filter(entry => entry.shift === "Night");
    if(openData.length > 0){
        const lastData = getData.rows.length - 1
        shift = getData.rows[lastData].shift === "Night" ? 'Day' : 'Night';
        date = getData.rows[lastData].shift === "Night" ? dateNow : datePrevs;
        res = await processShiftData(date, shift, station, getData.rows[lastData].opening_sonding);
        result = {
            ...res,
            interShiftDtoNs : res.interShift
            
        }
    }else{
        const lastData = openData.length - 1
        shift = openData[lastData].shift === "Night" ? 'Day' : 'Night';
        date = openData[lastData].shift === "Night" ? dateNow : datePrevs;
        result = await processShiftData(date, shift, station, getData.rows[lastData].opening_sonding);
        result = {
            ...res,
            interShiftDtoNs : res.interShift
        }
    }
    return result
}


module.exports = {
    getTotalStation,
    getTableStation
}