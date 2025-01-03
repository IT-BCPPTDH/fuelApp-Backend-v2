const db = require('../../database/helper');
const { formatYYYYMMDD, prevFormatYYYYMMDD,formatDateToDDMMYYYY, formatDateOption } = require('../../helpers/dateHelper');
const logger = require('../../helpers/pinoLog');
const { QUERY_STRING } = require('../../helpers/queryEnumHelper');

const normalizeStation = (station) => {
    return station.split('-')[0];
};

const groupClosing = async(data) => {
  const groupedData = data.reduce((acc, item) => {
    const normalizedStation = normalizeStation(item.station);
    if (!acc[normalizedStation]) acc[normalizedStation] = { Day: null, Night: null };
    acc[normalizedStation][item.shift] = { ...item, station: normalizedStation };
    return acc;
  }, {});

  const filteredData = Object.values(groupedData).map(({ Day, Night }) => {
    if (Day && Night) {
      return { station: Night.station, closing_dip: Night.closing_dip };
    } else if (Day) {
      return { station: Day.station, closing_dip: Day.closing_dip };
    } else {
      return { station: Night.station, closing_dip: Night.closing_dip };
    }
  });

  return filteredData;
};

const processData = async(data) => {
  const groupedData = data.reduce((acc, item) => {
    const normalizedStation = normalizeStation(item.station);
    if (!acc[normalizedStation]) acc[normalizedStation] = { Day: null, Night: null };
    acc[normalizedStation][item.shift] = { ...item, station: normalizedStation };
    return acc;
  }, {});

  const result = Object.values(groupedData).map(({ Day, Night }) => {
    const openingDip = Day ? Day.opening_dip : Night.opening_dip; 
    const closingDip = Night?.closing ?? Day?.closing;

    return {
      station: Night?.station || Day?.station,
      opening_dip: openingDip,
      closing_dip: closingDip ? closingDip : 0,
    };
  })

  return result;
};

const calculateTotal = async (data) => {
  return data.reduce((totals, item) => {
    totals.opening_dip += item.opening_dip;
    totals.closing_dip += item.closing_dip ?? 0;
    return totals;
  }, { opening_dip: 0, closing_dip: 0 });
}

const calcDifferences = (data) => {
    const groupedData = data.reduce((acc, item) => {
        const normalizedStation = normalizeStation(item.station);
        if (!acc[normalizedStation]) acc[normalizedStation] = { Day: null, Night: null };
        acc[normalizedStation][item.shift] = item;
        return acc;
      }, {});

      const result = Object.entries(groupedData).map(([station, { Day, Night }]) => {
        const diff = (Night?.opening_dip && Day?.closing)
          ? Night.opening_dip - Day.closing
          : 0;
    
        return {
          station,
          difference: diff
        };
      });
  
    return result;
};

const mergeStations = (data, targetPrefixes) => {
    const groupedData = {};
  
    data.forEach(item => {
      const matchedPrefix = targetPrefixes.find(prefix => item.station.startsWith(prefix));
  
      if (matchedPrefix) {
        if (!groupedData[matchedPrefix]) {
          groupedData[matchedPrefix] = {
            station: matchedPrefix,
            total_issued: 0,
            total_transfer: 0,
            total_receive: 0,
            total_receive_kpc: 0
          };
        }
        groupedData[matchedPrefix].total_issued += item.total_issued;
        groupedData[matchedPrefix].total_transfer += item.total_transfer;
        groupedData[matchedPrefix].total_receive += item.total_receive;
        groupedData[matchedPrefix].total_receive_kpc += item.total_receive_kpc;
      } else {
        groupedData[item.station] = { ...item };
      }
    });
    return Object.values(groupedData);
};

const mergeNtoD = (data1, data2) => {
  const map1 = Object.fromEntries(data1.map(item => [item.station, item.opening_dip ?? 0]));
  const map2 = Object.fromEntries(data2.map(item => [item.station, item.closing_dip ?? 0]));
  
  const allStations = new Set([...Object.keys(map1), ...Object.keys(map2)]);
  return Array.from(allStations).map(station => {
    if (!map2[station]) {
      return { station, total: 0 };
    }
    
    if (!map1[station]) {
      return { station, total: 0 };
    }

    const openingDip = map1[station];
    const closingDip = map2[station];

    return { station, total: openingDip - closingDip };
  });
};

const calc = (data) => {
  const totals = data.reduce((acc, item) => {
    Object.keys(item).forEach((key) => {
      if (key !== 'station') {
        const value = typeof item[key] === 'string' ? parseFloat(item[key].replace(/,/g, '')) : item[key];
        acc[key] = (acc[key] || 0) + (value || 0); 
      }
    });
    return acc;
  }, {});

  return totals
}

const mergeArray = (listData, listForm, difference, listDtoN) => {
    const merged= listData.map(itemA => {
      const matchingItem = listForm.find(itemB => itemB.station === itemA.station);
      const matchingItem2 = listDtoN.find(itemC => itemC.station === itemA.station);
      const matchingItem3 = difference.find(itemD => itemD.station === itemA.station);
      const closedData = itemA.opening_dip + matchingItem?.total_receive_kpc + matchingItem?.total_receive - matchingItem?.total_issued - matchingItem?.total_transfer
      const variant = (itemA.closing_dip !== 0 ? itemA.closing_dip : closedData) - closedData;
      if (matchingItem) {
          return {
              station: itemA.station,
              total_opening : itemA.opening_dip ? itemA.opening_dip.toLocaleString('en-US') : 0,
              total_closing: itemA.closing_dip !== 0 ?  itemA.closing_dip.toLocaleString('en-US') : closedData.toLocaleString('en-US'),
              total_issued : matchingItem.total_issued ? matchingItem.total_issued.toLocaleString('en-US') : 0,
              total_transfer : matchingItem.total_transfer ? matchingItem.total_transfer.toLocaleString('en-US') : 0,
              total_receive : matchingItem.total_receive ? matchingItem.total_receive.toLocaleString('en-US') : 0,
              total_receive_kpc : matchingItem.total_receive_kpc ? matchingItem.total_receive_kpc.toLocaleString('en-US'): 0,
              total_close_data : itemA.total_close_data == null ? closedData.toLocaleString('en-US') : itemA.total_close_data.toLocaleString('en-US'),
              total_variant : itemA.total_variant == null? variant.toLocaleString('en-US') : itemA.total_variant.toLocaleString('en-US'), 
              intershiftNtoD: matchingItem3.difference != null ? matchingItem3.difference.toLocaleString('en-US') : '0', 
              intershiftDtoN:matchingItem2.total !==  null ? matchingItem2.total.toLocaleString('en-US') : 0
          };
      }
      return itemA;
  });
  return merged
}

const getTotalDashboard = async (params) => {
    try {
        const dateNow = formatYYYYMMDD(params.tanggal)
        const dateBefore = formatDateOption(params.option, dateNow)
        const prevDate = prevFormatYYYYMMDD(dateNow)
        const prevDateBefore = prevFormatYYYYMMDD(dateBefore)
        const prevClosing = await db.query(QUERY_STRING.getClosing,[prevDateBefore, prevDate])
        const getFormStations =  await db.query(QUERY_STRING.getFormSum, [dateBefore, dateNow])
        const queryData = await db.query(QUERY_STRING.getList,[dateBefore, dateNow])
        const listData = await processData(queryData.rows)
        const listPrev = await groupClosing(prevClosing.rows)
        const totalPrev = listPrev.reduce((sum, item) => sum + item.closing_dip, 0);
        const target = ['TK1037', 'TK1036']
        const listForm = mergeStations(getFormStations.rows, target)
        const difference = await calcDifferences(queryData.rows)
        const listDtoN = mergeNtoD(listData, listPrev)
        const mergeData = mergeArray(listData, listForm, difference, listDtoN)
        const total = calc(mergeData)
        let data
        if(Object.keys(total).length === 0){
          data = { 
            prevSonding : totalPrev ? totalPrev.toLocaleString('en-US') : 0,
            openSonding : 0,
            recipt: 0,
            reciptKpc: 0,
            issuedTrx: 0,
            tfTrx: 0,
            closeData: 0,
            closeSonding: 0,
            variant: 0,
            intershiftNtoD: 0,
            intershiftDtoN:0
          }
        }else{
          data = { 
            prevSonding : totalPrev ? totalPrev.toLocaleString('en-US') : 0,
            openSonding : total.total_opening ? total.total_opening.toLocaleString('en-US') : 0,
            recipt: total.total_receive? total.total_receive.toLocaleString('en-US') : 0,
            reciptKpc: total.total_receive_kpc ? total.total_receive_kpc.toLocaleString('en-US') : 0,
            issuedTrx: total.total_issued ? total.total_issued.toLocaleString('en-US') : 0,
            tfTrx: total.total_transfer ? total.total_transfer.toLocaleString('en-US') : 0,
            closeData: total.total_close_data ? total.total_close_data.toLocaleString('en-US') : 0,
            closeSonding: total.closing_dip === 0 ? total.total_close_data.toLocaleString('en-US') : total.total_closing.toLocaleString('en-US'),
            variant: total.total_variant ? total.total_variant.toLocaleString('en-US') : 0,
            intershiftNtoD: total.intershiftDtoN !== null ?  total.intershiftDtoN.toLocaleString('en-US') : 0,
            intershiftDtoN: total.intershiftNtoD ? total.intershiftNtoD.toLocaleString('en-US') : 0
        }
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
        const dateNow = formatYYYYMMDD(params.tanggal)
        const dateBefore = formatDateOption(params.option, dateNow)
        const getFormStations =  await db.query(QUERY_STRING.getFormSum, [dateBefore, dateNow])
        const prevDate = prevFormatYYYYMMDD(dateNow)
        const prevDateBefore = prevFormatYYYYMMDD(dateBefore)
        const queryData = await db.query(QUERY_STRING.getList,[dateBefore, dateNow])
        const listData = await processData(queryData.rows)
        const prevClosing = await db.query(QUERY_STRING.getClosing,[prevDateBefore, prevDate])
        const listPrev = await groupClosing(prevClosing.rows)
        const target = ['TK1037', 'TK1036']
        const listForm = mergeStations(getFormStations.rows, target)
        const difference = await calcDifferences(queryData.rows)
        const listDtoN = mergeNtoD(listData, listPrev)
        const mergeData = mergeArray(listData, listForm, difference, listDtoN)
        return mergeData
    }catch(err){
        logger.error(err)
        console.error('Error during update:', err);
        return false;
    }
}

module.exports = {
    getTotalDashboard,
    getTableDashboard
}