const db = require('../../database/helper');
const { formatYYYYMMDD, formatDateOption,formatDateToDDMMYYYY, formatDateTimeToDDMMYYYY_HHMMSS } = require('../../helpers/dateHelper');
const logger = require('../../helpers/pinoLog');
const { QUERY_STRING } = require('../../helpers/queryEnumHelper');

const getTotalStation = async (params) => {
    try {
        let data, totalStation, stationShiftDay,stationShiftNight
        const dateNow = formatYYYYMMDD(params.tanggal)
        const dateBefore = formatDateOption(params.option, dateNow)
        const station = params.station
        totalStation = await db.query(QUERY_STRING.getAllDataStation, [dateBefore, dateNow, station])
        stationShiftDay = await db.query(QUERY_STRING.getStationShiftDay, [dateBefore,dateNow, station])
        stationShiftNight = await db.query(QUERY_STRING.getStationShiftNigth, [dateBefore,dateNow, station])
        if(station == 'TK1037' || station == 'TK1036'){
            totalStation = await db.query(QUERY_STRING.getStationTK, [dateBefore, dateNow, `%${station}%`])
            stationShiftDay = await db.query(QUERY_STRING.getTKShiftDay, [dateBefore,dateNow, `%${station}%`])
            stationShiftNight = await db.query(QUERY_STRING.getTKShiftNigth, [dateBefore,dateNow, `%${station}%`])
        }
        const closedData = totalStation.rows[0].total_open + totalStation.rows[0].total_receive_kpc + totalStation.rows[0].total_receive - totalStation.rows[0].total_issued - totalStation.rows[0].total_transfer
        const variance = totalStation.rows[0].total_close - closedData
        const closedDataDay = stationShiftDay?.rows[0]?.total_open + stationShiftDay?.rows[0]?.total_receive_kpc + stationShiftDay?.rows[0]?.total_receive - stationShiftDay?.rows[0]?.total_issued - stationShiftDay?.rows[0]?.total_transfer
        const varianceDay = stationShiftDay?.rows[0]?.total_close - closedDataDay
        const closedDataNight = stationShiftNight?.rows[0]?.total_open + stationShiftNight?.rows[0]?.total_receive_kpc + stationShiftNight?.rows[0]?.total_receive - stationShiftNight?.rows[0]?.total_issued - stationShiftNight?.rows[0]?.total_transfer
        const varianceNight = stationShiftNight?.rows[0]?.total_close - closedDataNight
        data = { 
            totalAllOpening : totalStation.rows[0].total_open ? totalStation.rows[0].total_open.toLocaleString('en-US') : 0,
            totalAllClosing :  totalStation.rows[0].total_close ? totalStation.rows[0].total_close.toLocaleString('en-US') : 0,
            totalAllIssued: totalStation.rows[0].total_issued ? totalStation.rows[0].total_issued.toLocaleString('en-US') : 0,
            totalAllReceipt : totalStation.rows[0].total_receive ? totalStation.rows[0].total_receive.toLocaleString('en-US') : 0,
            totalAllCloseData: totalStation.rows[0].close_data ? totalStation.rows[0].close_data.toLocaleString('en-US') : 0,
            totalAllVariance: totalStation.rows[0].variant == null ? variance : totalStation.rows[0].variant.toLocaleString('en-US'),
            totalAllKpc: totalStation.rows[0].total_receive_kpc ? totalStation.rows[0].total_receive_kpc.toLocaleString('en-US') : 0,
            totalAllOpeningDay : stationShiftDay?.rows[0]?.total_open ? stationShiftDay.rows[0].total_open.toLocaleString('en-US') : 0,
            totalAllClosingDay :  stationShiftDay?.rows[0]?.total_close ? stationShiftDay.rows[0].total_close.toLocaleString('en-US') : 0,
            totalAllIssuedDay: stationShiftDay?.rows[0]?.total_issued ? stationShiftDay.rows[0].total_issued.toLocaleString('en-US') : 0,
            totalAllReceiptDay : stationShiftDay?.rows[0]?.total_receive ? stationShiftDay.rows[0].total_receive.toLocaleString('en-US') : 0,
            totalAllCloseDataDay : stationShiftDay?.rows[0]?.close_data ? stationShiftDay.rows[0].close_data.toLocaleString('en-US') : 0,
            totalAllVarianceDay : stationShiftDay?.rows[0]?.variant == null ? varianceDay : stationShiftDay.rows[0].variant.toLocaleString('en-US'),
            totalAllKpcDay: stationShiftDay?.rows[0]?.total_receive_kpc ? stationShiftDay.rows[0].total_receive_kpc.toLocaleString('en-US') : 0,
            totalAllOpeningNigth : stationShiftNight?.rows[0]?.total_open ? stationShiftNight.rows[0].total_open.toLocaleString('en-US') : 0,
            totalAllClosingNigth :  stationShiftNight?.rows[0]?.total_close ? stationShiftNight.rows[0].total_close.toLocaleString('en-US') : 0,
            totalAllIssuedNigth : stationShiftNight?.rows[0]?.total_issued ? stationShiftNight.rows[0].total_issued.toLocaleString('en-US') : 0,
            totalAllReceiptNigth : stationShiftNight?.rows[0]?.total_receive ? stationShiftNight.rows[0].total_receive.toLocaleString('en-US') : 0,
            totalAllCloseDataNigth : stationShiftNight?.rows[0]?.close_data ? stationShiftNight.rows[0].close_data.toLocaleString('en-US') : 0,
            totalAllVarianceNigth : stationShiftNight?.rows[0]?.variant == null ? varianceNight : stationShiftNight.rows[0].variant.toLocaleString('en-US'),
            totalAllKpcNigth: stationShiftNight?.rows[0]?.total_receive_kpc ? stationShiftNight.rows[0].total_receive_kpc.toLocaleString('en-US') : 0,
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
        let getDataStations, loginData
        const dateNow = formatYYYYMMDD(params.tanggal)
        const dateBefore = formatDateOption(params.option, dateNow)
        const station = params.station
        getDataStations =  await db.query(QUERY_STRING.getShiftStation, [station, dateBefore, dateNow])
        loginData = await db.query(QUERY_STRING.getLogStation, [station, dateBefore, dateNow])
        if(station == 'TK1037' || station == 'TK1036'){
            getDataStations =  await db.query(QUERY_STRING.getShiftStationTK, [`%${station}%`, dateBefore, dateNow])
            loginData = await db.query(QUERY_STRING.getLogStationTK, [`%${station}%`, dateBefore, dateNow])
        }
        const mergedData = getDataStations.rows.map(itemA => {
            const matchingItemB = loginData.rows.find(itemB => itemB.station === itemA.station
                && itemB.jde_operator === itemA.fuelman_id);

            const formattedDate = formatDateToDDMMYYYY(itemA.date)
            const formattedLogin = itemA.time_opening ?  formatDateTimeToDDMMYYYY_HHMMSS(itemA.time_opening) : ""
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