const db = require('../../database/helper');
const { formatYYYYMMDD, prevFormatYYYYMMDD,formatDateToDDMMYYYY, formatDateTimeToDDMMYYYY_HHMMSS } = require('../../helpers/dateHelper');
const logger = require('../../helpers/pinoLog');
const { QUERY_STRING } = require('../../helpers/queryEnumHelper');

const getTotalStation = async (params) => {
    try {
        const dateNow = formatYYYYMMDD(params.tanggal)
        const station = params.station
        const datePrevs = prevFormatYYYYMMDD(dateNow)
        const totalBefores = await db.query(QUERY_STRING.getStationBefore, [datePrevs, station])
        const totalStation = await db.query(QUERY_STRING.getTotalStation, [dateNow, station])
        const stationShift = await db.query(QUERY_STRING.getStationShift, [dateNow, station])
        const data = { 
            totalPrevSonding : totalBefores.rows[0].totalclose,
            totalOpenSonding :  totalStation.rows[0].totalopen,
            totalReciptKpc: totalStation.rows[0].receivekpc,
            prevSondingDay : totalBefores.rows[0].totalclose,
            openSondingDay: stationShift.rows[0].totalopen,
            receiptKpcDay: stationShift.rows[0].receivekpc,
            prevSondingNight : stationShift.rows[0].totalclose,
            openSondingNight : stationShift.rows[1].totalopen,
            receiptKPCNight : stationShift.rows[1].receivekpc,
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


module.exports = {
    getTotalStation,
    getTableStation
}