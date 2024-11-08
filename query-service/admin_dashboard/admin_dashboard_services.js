const db = require('../../database/helper');
const { formatYYYYMMDD, prevFormatYYYYMMDD,formatDateToDDMMYYYY, formatDateOption } = require('../../helpers/dateHelper');
const logger = require('../../helpers/pinoLog');
const { QUERY_STRING } = require('../../helpers/queryEnumHelper');

const getTotalDashboard = async (params) => {
    try {
        const dateNow = formatYYYYMMDD(params.tanggal)
        const dateBefore = formatDateOption(params.option, dateNow)
        const prevDate = prevFormatYYYYMMDD(dateNow)
        const prevDateBefore = prevFormatYYYYMMDD(dateBefore)
        const prevClosing = await db.query(QUERY_STRING.getClosingDip,[prevDateBefore, prevDate])
        const queryDtoN = await db.query(QUERY_STRING.getDtoN,[dateBefore, dateNow])
        const jmlQueryDtoN = queryDtoN.rows[0].total_opening_dip_night - queryDtoN.rows[0].total_closing_dip_day 
        let dataOpening = await db.query(QUERY_STRING.getOpeningDay,[dateBefore, dateNow])
        let dataLkfs = await db.query(QUERY_STRING.getTotalLkfs,[dateBefore, dateNow])
        let dataType = await db.query(QUERY_STRING.getTotalType,[dateBefore, dateNow])
        const interShiftND = dataLkfs.rows[0].total_opening - prevClosing.rows[0].total_before 
        const closedData = (dataLkfs.rows[0].total_opening + dataType.rows[0].total_receive_kpc) - dataType.rows[0].total_issued - dataType.rows[0].total_transfer
        const variants = dataLkfs.rows[0].total_closing - closedData
        const data = { 
            prevSonding : prevClosing.rows[0].total_before ? prevClosing.rows[0].total_before.toLocaleString('en-US') : 0,
            openSonding : dataOpening.rows[0].total_opening ? dataOpening.rows[0].total_opening.toLocaleString('en-US') : 0,
            reciptKpc: dataType.rows[0].total_receive_kpc ? dataType.rows[0].total_receive_kpc.toLocaleString('en-US') : 0,
            issuedTrx: dataType.rows[0].total_issued ? dataType.rows[0].total_issued.toLocaleString('en-US') : 0,
            tfTrx: dataType.rows[0].total_transfer ? dataType.rows[0].total_transfer.toLocaleString('en-US') : 0,
            closeData: dataLkfs.rows[0].total_close_data === null ? closedData.toLocaleString('en-US') : dataLkfs.rows[0].total_close_data.toLocaleString('en-US'),
            closeSonding: dataLkfs.rows[0].total_closing ? dataLkfs.rows[0].total_closing.toLocaleString('en-US') : 0,
            variant: dataLkfs.rows[0].total_variant == null ? variants.toLocaleString('en-US') : dataLkfs.rows[0].total_variant.toLocaleString('en-US'),
            intershiftNtoD: interShiftND ?  interShiftND.toLocaleString('en-US') : 0,
            intershiftDtoN: jmlQueryDtoN ? jmlQueryDtoN.toLocaleString('en-US') : 0
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
        const dateBefore = formatDateOption(params.option, dateNow)
        const prevDate = prevFormatYYYYMMDD(dateNow)
        const prevDateBefore = prevFormatYYYYMMDD(dateBefore)
        const getFormStations =  await db.query(QUERY_STRING.getFormSum, [dateBefore, dateNow])
        const getLkfStations =  await db.query(QUERY_STRING.getLkfSum, [dateBefore, dateNow])
        const queryIntershiftDtoN =  await db.query(QUERY_STRING.stationDtoN, [dateBefore, dateNow])
        const interDtoN = await calculateDifferences(queryIntershiftDtoN.rows)
        const queryClosingBefore = await db.query(QUERY_STRING.closingPrevStation, [prevDateBefore, prevDate])
        const queryOpeningDay = await db.query(QUERY_STRING.openingDipDay, [dateBefore, dateNow])
        const calcNtoD = await calculateDifferencesNtoD(queryOpeningDay.rows, queryClosingBefore.rows)
        const mergedArray = getLkfStations.rows.map(itemA => {
            const matchingItem = getFormStations.rows.find(itemB => itemB.station === itemA.station);
            const matchingItem3 = interDtoN.find(item3 => item3.station === itemA.station);
            const matchingItem4 = calcNtoD.find(item4 => item4.station === itemA.station);
            const closedData = itemA.total_opening + matchingItem.total_receive_kpc + matchingItem.total_receive - matchingItem.total_issued - matchingItem.total_transfer
            const variant = itemA.total_closing - closedData
            if (matchingItem) {
                return {
                    station: itemA.station,
                    total_opening : itemA.total_opening ? itemA.total_opening.toLocaleString('en-US') : 0,
                    total_closing: itemA.total_closing ?  itemA.total_closing.toLocaleString('en-US') : 0,
                    total_issued : matchingItem.total_issued ? matchingItem.total_issued.toLocaleString('en-US') : 0,
                    total_transfer : matchingItem.total_transfer ? matchingItem.total_transfer.toLocaleString('en-US') : 0,
                    total_receive : matchingItem.total_receive ? matchingItem.total_receive.toLocaleString('en-US') : 0,
                    total_receive_kpc : matchingItem.total_receive_kpc ? matchingItem.total_receive_kpc.toLocaleString('en-US'): 0,
                    total_close_data : itemA.total_close_data == null ? closedData.toLocaleString('en-US') : itemA.total_close_data.toLocaleString('en-US'),
                    total_variant : itemA.total_variant == null? variant.toLocaleString('en-US') : itemA.total_variant.toLocaleString('en-US'), 
                    intershiftDtoN : matchingItem3.difference ? matchingItem3.difference.toLocaleString('en-US') : 0,
                    intershiftNtoD : matchingItem4.difference ? matchingItem4.difference.toLocaleString('en-US') : 0,
                };
            }
            return itemA;
        });
        return mergedArray
    }catch(err){
        logger.error(err)
        console.error('Error during update:', err);
        return false;
    }
}

function calculateDifferences(data) {
    return data.map(item => {
      const closingData = item.closing_dip_day ?? 0;
      const openingData = item.opening_dip_night ?? 0;
  
      const difference = openingData - closingData;
  
      return {
        ...item,
        difference 
      };
    });
}

function calculateDifferencesNtoD(openingDips, closingDips) {
    const result = openingDips.map(opening => {
        const closing = closingDips.find(c => c.station === opening.station);
        const closingDip = closing ? closing.closing_dip_before : 0; 
        return {
            station: opening.station,
            difference: opening.opening_dip_day - closingDip 
        };
    });

    closingDips.forEach(closing => {
        if (!result.some(res => res.station === closing.station)) {
            result.push({
                station: closing.station,
                difference: 0 - closing.closing_dip_before 
            });
        }
    });

    return result;
}

// const getTableDashboard = async (params) => {
//     try{
//         let result
//         const dateNow = formatYYYYMMDD(params.tanggal)
//         const dateBefore = formatDateOption(params.option, dateNow)
//         const getDataStations =  await db.query(QUERY_STRING.getTotals, [dateBefore, dateNow])
//         result = await filterData(params.tanggal, true)
//         const mergedData = (getDataStations?.rows || []).map(itemA => {
//             const matchingItemB = Array.isArray(result) 
//               ? result.find(itemB => itemB.station === itemA.station) 
//               : undefined;
          
//             if (matchingItemB) {
//               return {
//                 ...itemA,
//                 date: formatDateToDDMMYYYY(matchingItemB.date),
//                 // closeDataPrev: matchingItemB.closeDataPrev,
//                 // variants: matchingItemB.variants,
//                 interShift: matchingItemB.interShift
//               };
//             }
            
//             return {
//               ...itemA,
//               date: formatDateToDDMMYYYY(itemA.date),
//               total_opening : itemA.total_opening ? itemA.total_opening.toLocaleString('en-US') : 0,
//               total_closing: itemA.total_closing ?  itemA.total_closing.toLocaleString('en-US') : 0,
//               total_issued : itemA.total_issued ? itemA.total_issued.toLocaleString('en-US') : 0,
//               total_transfer : itemA.total_transfer ? itemA.total_transfer.toLocaleString('en-US') : 0,
//               total_receive : itemA.total_receive ? itemA.total_receive.toLocaleString('en-US') : 0,
//               total_receive_kpc : itemA.total_receive_kpc ? itemA.total_receive_kpc.toLocaleString('en-US'): 0,
//               total_close_data : itemA.total_close_data ? itemA.total_close_data.toLocaleString('en-US') : 0,
//               total_variant : itemA.total_variant ? itemA.total_variant.toLocaleString('en-US') : 0
//             };
//         });
//         return mergedData
//     }catch(err){
//         logger.error(err)
//         console.error('Error during update:', err);
//         return false;
//     }
// }

async function processShiftData(date, shift, openingSonding) {
    const getDataPrev = await db.query(QUERY_STRING.getPrevious, [date, shift]);
    const dataClosingPrev = getDataPrev.rows[0].total_closing;
    const closeDataPrev = getDataPrev.rows[0].total_close_data;
    const variantPrev = getDataPrev.rows[0].total_variant;
    const interShift = openingSonding - dataClosingPrev;

    return {
        dataClosingPrev,
        closeDataPrev,
        variantPrev,
        interShift
    };
}

// async function processDataTable(date, shift, openingSonding) {
//     let data
//     const updatedData = [];
//     const getDataPrev = await db.query(QUERY_STRING.getTotalBefores, [date, shift]);
//     for (let i = 0;  i < getDataPrev.rows.length; i++ ){
//         const item = getDataPrev.rows[i];
//         if (item.length > 0) {
//             data = {
//               closeDataPrev: item[0].total_closing ? item[0].total_closing : 0,
//               closeDataPrev: item[0].total_close_data ? item[0].total_close_data : 0,
//               variant: item[0].total_variant ? item[0].total_variant : 0,
//               interShift: openingSonding - item[0].total_closing
//             };
//           } else {
//             data = {
//               closeDataPrev: 0,
//               closeDataPrev: 0,
//               variant: 0,
//               interShift: 0
//             };
//           }
//         updatedData.push(data)
//     }
    
//     return updatedData
// }

// async function filterData(dates,  isTable) {
//     let shift, date, result, res
//     const dateNow = formatYYYYMMDD(dates)
//     const datePrevs = prevFormatYYYYMMDD(dates)
//     const getData = await db.query(QUERY_STRING.getAllLkf, [dateNow])
//     const openData = getData.rows.filter(entry => entry.shift === "Night");
//     if(openData.length > 0){
//         const lastData = getData.rows.length - 1
//         shift = getData.rows[lastData].shift === "Night" ? 'Day' : 'Night';
//         date = getData.rows[lastData].shift === "Night" ? dateNow : datePrevs;
//         if(isTable){
//             result = await processDataTable(date, shift, getData.rows[lastData].opening_sonding);
//         }else{
//             res = await processShiftData(date, shift, getData.rows[lastData].opening_sonding);
//             result = {
//                 ...res,
//                 interShiftDtoNs : res.interShift
                
//             }
//         }
//     }else{
//         const lastData = openData.length - 1
//         if(lastData != -1){
//             shift = openData[lastData].shift === "Night" ? 'Day' : 'Night';
//             date = openData[lastData].shift === "Night" ? dateNow : datePrevs;
//             if(isTable){
//                 result = await processDataTable(date, shift, getData.rows[lastData].opening_sonding);
//             }else{
//                 result = await processShiftData(date, shift, getData.rows[lastData].opening_sonding);
//                 result = {
//                     ...res,
//                     interShiftDtoNs : res.interShift
//                 }
//             }
//         }else{
//             return false
//         }
       
//     }
//     return result
// }

async function processDataTable(date, shift, openingSonding) {
    let data
    const updatedData = [];
    const getDataPrev = await db.query(QUERY_STRING.getTotalBefores, [date, shift]);
    for (let i = 0;  i < getDataPrev.rows.length; i++ ){
        const item = getDataPrev.rows[i];
        const matchingOpening = openingSonding.find(opening => opening.station === item.station);

        
        let interShift = 0;
        if (matchingOpening) {
            interShift = matchingOpening.opening_dip - item.total_closing;
        }
        data = {
          closeDataPrev: item.total_closing,
          closeDataPrev: item.total_close_data,
          variant: item.total_variant ,
          interShift: interShift
        };
        updatedData.push(data)
    }
    
    return updatedData
}

async function filterData(dates,  isTable) {
    let shift, date, result, res
    const dateNow = formatYYYYMMDD(dates)
    const datePrevs = prevFormatYYYYMMDD(dates)
    shift = 'Night';
    date = datePrevs;
    if(isTable){
        const getDatas = await db.query(QUERY_STRING.getAllLkfs, [dateNow])
        result = await processDataTable(date, shift, getDatas.rows);
    }else{
        const getData = await db.query(QUERY_STRING.getAllLkf, [dateNow])
        res = await processShiftData(date, shift, getData.rows[0].total_opening);
        result = {
            ...res,
            interShiftDtoNs : res.interShift
            
        }
    }
    return result
}


module.exports = {
    getTotalDashboard,
    getTableDashboard
}