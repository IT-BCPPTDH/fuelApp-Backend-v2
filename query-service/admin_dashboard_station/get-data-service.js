const db = require('../../database/helper');
const { formatYYYYMMDD, prevFormatYYYYMMDD,formatDateToDDMMYYYY, formatDateTimeToDDMMYYYY_HHMMSS } = require('../../helpers/dateHelper');
const logger = require('../../helpers/pinoLog');
const { QUERY_STRING } = require('../../helpers/queryEnumHelper');

const getTotalStation = async (params) => {
    try {
        let data
        const dateNow = formatYYYYMMDD(params.tanggal)
        const station = params.station
        const totalStation = await db.query(QUERY_STRING.getAllDataStation, [dateNow, station])
        const stationShiftDay = await db.query(QUERY_STRING.getStationShiftDay, [dateNow, station])
        const stationShiftNight = await db.query(QUERY_STRING.getStationShiftNigth, [dateNow, station])
        data = { 
            totalAllOpening : totalStation.rows[0].total_open ? totalStation.rows[0].total_open : 0,
            totalAllClosing :  totalStation.rows[0].total_close ? totalStation.rows[0].total_close : 0,
            totalAllIssued: totalStation.rows[0].total_issued ? totalStation.rows[0].total_issued : 0,
            totalAllReceipt : totalStation.rows[0].total_receive ? totalStation.rows[0].total_receive : 0,
            totalAllCloseData: totalStation.rows[0].close_data ? totalStation.rows[0].close_data : 0,
            totalAllVariance: totalStation.rows[0].variant ? totalStation.rows[0].variant : 0,
            totalAllKpc: totalStation.rows[0].total_receive_kpc ? totalStation.rows[0].total_receive_kpc : 0,
            totalAllOpeningDay : stationShiftDay?.rows[0]?.total_open ? stationShiftDay.rows[0].total_open : 0,
            totalAllClosingDay :  stationShiftDay?.rows[0]?.total_close ? stationShiftDay.rows[0].total_close : 0,
            totalAllIssuedDay: stationShiftDay?.rows[0]?.total_issued ? stationShiftDay.rows[0].total_issued : 0,
            totalAllReceiptDay : stationShiftDay?.rows[0]?.total_receive ? stationShiftDay.rows[0].total_receive : 0,
            totalAllCloseDataDay : stationShiftDay?.rows[0]?.close_data ? stationShiftDay.rows[0].close_data : 0,
            totalAllVarianceDay : stationShiftDay?.rows[0]?.variant ? stationShiftDay.rows[0].variant : 0,
            totalAllKpcDay: stationShiftDay?.rows[0]?.total_receive_kpc ? stationShiftDay.rows[0].total_receive_kpc : 0,
            totalAllOpeningNigth : stationShiftNight?.rows[0]?.total_open ? stationShiftNight.rows[0].total_open : 0,
            totalAllClosingNigth :  stationShiftNight?.rows[0]?.total_close ? stationShiftNight.rows[0].total_close : 0,
            totalAllIssuedNigth : stationShiftNight?.rows[0]?.total_issued ? stationShiftNight.rows[0].total_issued : 0,
            totalAllReceiptNigth : stationShiftNight?.rows[0]?.total_receive ? stationShiftNight.rows[0].total_receive : 0,
            totalAllCloseDataNigth : stationShiftNight?.rows[0]?.close_data ? stationShiftNight.rows[0].close_data : 0,
            totalAllVarianceNigth : stationShiftNight?.rows[0]?.variant ? stationShiftNight.rows[0].variant : 0,
            totalAllKpcNigth: stationShiftNight?.rows[0]?.total_receive_kpc ? stationShiftNight.rows[0].total_receive_kpc : 0,
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