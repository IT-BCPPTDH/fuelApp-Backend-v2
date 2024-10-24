const db = require('../../database/helper');
const { formatYYYYMMDD, prevFormatYYYYMMDD,formatDateToDDMMYYYY, formatDateOption } = require('../../helpers/dateHelper');
const logger = require('../../helpers/pinoLog');
const { QUERY_STRING } = require('../../helpers/queryEnumHelper');

const getTotalDashboard = async (params) => {
    try {
        let result
        const dateNow = formatYYYYMMDD(params.tanggal)
        const dateBefore = formatDateOption(params.option, dateNow)
        result = await filterData(params.tanggal, false)
        let dataSonding = await db.query(QUERY_STRING.getTotalSonding,[dateBefore, dateNow])
        let dataType = await db.query(QUERY_STRING.getTotalType,[dateBefore, dateNow])
        const data = { 
            prevSonding : result.dataClosingPrev ? result.dataClosingPrev.toLocaleString('en-US') : 0,
            openSonding : dataSonding.rows[0].total_opening ? dataSonding.rows[0].total_opening.toLocaleString('en-US') : 0,
            reciptKpc: dataType.rows[0].total_receive ? dataType.rows[0].total_receive.toLocaleString('en-US') : 0,
            issuedTrx: dataType.rows[0].total_issued ? dataType.rows[0].total_issued.toLocaleString('en-US') : 0,
            tfTrx: dataType.rows[0].total_transfer ? dataType.rows[0].total_transfer.toLocaleString('en-US') : 0,
            closeData: dataType.rows[0].total_close_data ? dataType.rows[0].total_close_data.toLocaleString('en-US') : 0,
            closeSonding: dataType.rows[0].total_closing ? dataType.rows[0].total_closing.toLocaleString('en-US') : 0,
            variant: dataType.rows[0].total_variant ? dataType.rows[0].total_variant.toLocaleString('en-US') : 0,
            intershiftNtoD: result.interShiftNtoDs ?  result.interShiftNtoDs.toLocaleString('en-US') : 0,
            intershiftDtoN: result.interShiftDtoNs ? result.interShiftDtoNs.toLocaleString('en-US') : 0
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
        const getDataStations =  await db.query(QUERY_STRING.getTotals, [dateBefore, dateNow])
        result = await filterData(params.tanggal, true)
        const mergedData = (getDataStations?.rows || []).map(itemA => {
            const matchingItemB = Array.isArray(result) 
              ? result.find(itemB => itemB.station === itemA.station) 
              : undefined;
          
            if (matchingItemB) {
              return {
                ...itemA,
                date: formatDateToDDMMYYYY(matchingItemB.date),
                // closeDataPrev: matchingItemB.closeDataPrev,
                // variants: matchingItemB.variants,
                interShift: matchingItemB.interShift
              };
            }
            
            return {
              ...itemA,
              date: formatDateToDDMMYYYY(itemA.date),
              total_opening : itemA.total_opening ? itemA.total_opening.toLocaleString('en-US') : 0,
              total_closing: itemA.total_closing ?  itemA.total_closing.toLocaleString('en-US') : 0,
              total_issued : itemA.total_issued ? itemA.total_issued.toLocaleString('en-US') : 0,
              total_transfer : itemA.total_transfer ? itemA.total_transfer.toLocaleString('en-US') : 0,
              total_receive : itemA.total_receive ? itemA.total_receive.toLocaleString('en-US') : 0,
              total_receive_kpc : itemA.total_receive_kpc ? itemA.total_receive_kpc.toLocaleString('en-US'): 0,
              total_close_data : itemA.total_close_data ? itemA.total_close_data.toLocaleString('en-US') : 0,
              total_variant : itemA.total_variant ? itemA.total_variant.toLocaleString('en-US') : 0
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