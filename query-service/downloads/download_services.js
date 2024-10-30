const db = require('../../database/helper');
const { formattedHeaders, formatDDMonthYYYY,formattedHHMM,formatedDatesNames } = require('../../helpers/dateHelper');
const logger = require('../../helpers/pinoLog');
const { getEquipment, getFilterBanlaws, getMdElipse } = require('../../helpers/proto/master-data');
const { QUERY_STRING } = require('../../helpers/queryEnumHelper');
const nodemailer = require('nodemailer');
const path = require('path');

const getData = async(dateFrom, dateTo) => {
    try{
        const fetchData = await db.query(QUERY_STRING.getConsumtion, [dateFrom, dateTo])
        const uniqueNoUnits = [...new Set(fetchData.rows.map(item => item.no_unit))];
        const fetchUnit = await getMdElipse(uniqueNoUnits)
        const unit = JSON.parse(fetchUnit.data)

        const dataUnit = unit
        .map((item) => ({
            desc: item.equip_category ? item.equip_category : 'OTHERS',
            unit_no: item.equip_no_unit ? item.equip_no_unit : 'OTHERS',
            egi: item.equip_model_egi ? item.equip_model_egi : 'OTHERS',
            owner: item.equip_owner_elipse ? item.equip_owner_elipse : 'OTHERS',
            location: item.equip_position ? item.equip_position : 'PIT B'
        }))
        .sort((a, b) => {
            const descA = a.location || ""; 
            const descB = b.location || "";
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
        const fetchUnit = await getMdElipse(uniqueNoUnits)
        const unit = JSON.parse(fetchUnit.data)
        const dataUnit = unit
        .map((item) => ({
            desc: item.equip_category ? item.equip_category : 'OTHERS',
            unit_no: item.equip_no_unit ? item.equip_no_unit : 'OTHERS',
            egi: item.equip_model_egi ? item.equip_model_egi : 'OTHERS',
            owner: item.equip_owner_elipse ? item.equip_owner_elipse : 'OTHERS',
            location: item.equip_position ? item.equip_position : 'PIT B'
        }))
        .sort((a, b) => {
            const descA = a.location || ""; 
            const descB = b.location || "";
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
        const fetchUnit = await getMdElipse(uniqueNoUnits)
        const unit = JSON.parse(fetchUnit.data)
        const dataUnit = unit
        .map((item) => ({
            desc: item.equip_category ? item.equip_category : 'OTHERS',
            unit_no: item.equip_no_unit ? item.equip_no_unit : 'OTHERS',
            egi: item.equip_model_egi ? item.equip_model_egi : 'OTHERS',
            owner: item.equip_owner_elipse ? item.equip_owner_elipse : 'OTHERS',
            location: item.equip_position ? item.equip_position : 'PIT B'
        }))
        .sort((a, b) => {
            const descA = a.location || ""; 
            const descB = b.location || "";
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

const getFCByOwner = async(dateFrom, dateTo) => {
    try{
        const fetchData = await db.query(QUERY_STRING.getFCOwn, [dateFrom, dateTo])
        const uniqueNoUnits = [...new Set(fetchData.rows.map(item => item.no_unit))];
        const fetchElipse = await getMdElipse(uniqueNoUnits)
        const elipse = JSON.parse(fetchElipse.data)

        const mergedData = fetchData.rows.map(item => {
            const matchingData = elipse.find(data => data.equip_no_unit === item.no_unit);

            if (matchingData) {
              return { 
                ...item,
                tanggal: formatedDatesNames(item.formatted_date),
                category: matchingData.equip_category,
                owners: matchingData.equip_owner_elipse
               };
            }
            return { 
                ...item,
                tanggal: formatedDatesNames(item.formatted_date),
                category: "Others",
            };
        });

        const summedOwner = mergedData.reduce((acc, item) => {
            if (!['KPC', 'BACKCHARGE', 'Others'].includes(item.category)) {
                const normalizedTanggal = item.tanggal.trim();
                const normalizedOwners = item.owners.trim().toLowerCase(); 

                const key = `${normalizedTanggal}-${normalizedOwners}`;

                if (!acc[key]) {
                    acc[key] = {
                        tanggal: normalizedTanggal,
                        owners: item.owners.trim(), 
                        qty: 0
                    };
                }
        
                acc[key].qty += item.qty;
            }
        
            return acc;
        }, {});

        const summedBackcharge = mergedData.reduce((acc, item) => {
            if (['BACKCHARGE'].includes(item.category) && !['Others'].includes(item.category)) {
                const key = `${item.tanggal}-${item.owners}`;
        
                if (!acc[key]) {
                    acc[key] = {
                        tanggal: item.tanggal,
                        owners: item.owners,
                        qty: 0
                    };
                }
        
                acc[key].qty += item.qty;
            }
        
            return acc;
        }, {});

        const summedKpc = mergedData.reduce((acc, item) => {
            if (['KPC'].includes(item.category)&& !['Others'].includes(item.category)) {
                const key = `${item.tanggal}-${item.owners}`;
        
                if (!acc[key]) {
                    acc[key] = {
                        tanggal: item.tanggal,
                        owners: item.owners,
                        qty: 0
                    };
                }
        
                acc[key].qty += item.qty;
            }
        
            return acc;
        }, {});
        
        const owners = Object.values(summedOwner);
        const backcharge = Object.values(summedBackcharge);
        const kpc = Object.values(summedKpc);
        
        const result = {
            owner: owners,
            backcharge: backcharge,
            kpc: kpc
        }

        return result
    }catch(error){
        logger.error(error)
        console.error('Error during update:', error);
        return false;
    }
}

const getContentyMail = async(dateFrom, dateTo) => {
    try{
        const fetchDataKPC = await db.query(QUERY_STRING.getDataForMailKPC, [dateFrom, dateTo])
        const fetchDataIssued = await db.query(QUERY_STRING.getDataForMailIssued, [dateFrom, dateTo])
        const UnitsNosKPC = [...new Set(fetchDataKPC.rows.map(item => item.no_unit))];
        const UnitsNos = [...new Set(fetchDataIssued.rows.map(item => item.no_unit))];
        const fetchKPC = await getMdElipse(UnitsNosKPC)
        const unitKPC = JSON.parse(fetchKPC.data)
        const fetchIssued = await getMdElipse(UnitsNos)
        const unitIssued = JSON.parse(fetchIssued.data)

        const mergedDataKPC = fetchDataKPC.rows.map(item => {
            const matchingData = unitKPC.find(data => data.equip_no_unit === item.no_unit);
            return {
                ...item,
                owner: matchingData ? matchingData.equip_owner_elipse : 'PT. Darma Henwa Tbk'
            };
        });

        const mergedDataIssued = fetchDataIssued.rows.map(item => {
            const matchingData = unitIssued.find(data => data.equip_no_unit === item.no_unit);
            return {
                ...item,
                category: matchingData ? (matchingData.equip_category ? matchingData.equip_category : 'OTHERS') : 'OTHERS'
            };
        });

        const rets = sumFunction(mergedDataKPC)
        console.log(rets)

        // const dataKpc = {...restTotal, ...totals}
         
        // console.log(totals)
        // console.log(dataKpc)
        // const data = {
        //     dataKpc: dataKpc,
        //     dataIssued: dataIssued
        // }
        return true
    }catch(error){
        logger.error(error)
        console.error('Error during update:', error);
        return false;
    }
}

const bodyMail = async(dateStart, dateEnd) => {
    try{
        const content = await getContentyMail(dateStart, dateEnd)
        console.log(content)
        const yesterday = '2024-10-27';
        const supplier_name = 'ABC Supplier';
        const receipt = [
          { category: 'Category A', total: 100 },
          { category: 'Category B', total: 200 },
        ];
        const total = [
          { category: 'Category X', total: 150 },
          { category: 'Category Y', total: 250 },
        ];
        const totaldh = [{ total: 400 }];

        // Function to format numbers
        // const numberFormat = (number) => {
        //   return new Intl.NumberFormat().format(number);
        // };

        // // Calculate totals
        // let rc = receipt.reduce((acc, curr) => acc + curr.total, 0);
        // let ttl = total.reduce((acc, curr) => acc + curr.total, 0);
        // const transporter = nodemailer.createTransport({
        //     host: process.env.MAIL_HOST,
        //     port: 25,
        //     secure: false, 
        //     auth: {
        //         user: process.env.MAIL_USER, 
        //         pass: process.env.MAIL_PASSWORD,
        //     },
        //     tls:{
        //         rejectUnauthorized:false
        //     }
        // });
        // const fileName = 'Fuel-Consumption-06-Oct-2024.xlsx'
        // // const currentModulePath = dirname(fileURLToPath(import.meta.url));
        // let mailOptions = {
        //     from: process.env.MAIL_EMAIL,
        //     to: 'kazehayareo@gmail.com',
        //     cc: 'annisa@think-match.com',
        //     subject: 'Fuelapp Auto Report - Fuel Consumption 16-Oct-2024',
        //     html : `
        //     <!DOCTYPE html>
        //     <html lang="en" dir="ltr">
        //       <head>
        //         <meta charset="utf-8">
        //         <title></title>
        //       </head>
        //       <body>
        //         <p>Dear All,</p>
        //         <br>
        //         <br>
        //         <p id="showlkf" style="margin-top:20px; margin-bottom:100px">Terlampir, Fuel Consumption ${yesterday}</p>
        //         <table>
        //           <tbody>
        //             <tr>
        //               <td style="border: 1px solid #000; width:150px;background-color:#0b0f8a;color:#ffffff;font-size:10pt"><b>RECEIPT ${supplier_name}</b></td>
        //               <td style="border: 1px solid #000; width:150px;background-color:#0b0f8a;color:#ffffff;font-size:10pt"><b>Date ${yesterday}</b></td>
        //             </tr>
        //             ${receipt.map(r => `
        //             <tr>
        //               <td style="border: 1px solid #000; width:150px;background-color:#0b0f8a;color:#ffffff;font-size:10pt"><b>${r.category}</b></td>
        //               <td style="border: 1px solid #000; width:150px;background-color:#ffffff;color:#0b0f8a;font-size:10pt;text-align:right"><b>${numberFormat(r.total)}</b></td>
        //             </tr>
        //             `).join('')}
        //             <tr>
        //               <td style="border: 1px solid #000; width:150px;background-color:#0b0f8a;color:#ffffff;font-size:10pt"><b>Grand Total</b></td>
        //               <td style="border: 1px solid #000; width:150px;background-color:#0b0f8a;color:#ffffff;font-size:10pt;text-align:right"><b>${numberFormat(rc)}</b></td>
        //             </tr>
        //           </tbody>
        //         </table>
        //         <br><br>
        //         <table>
        //           <tbody>
        //             <tr>
        //               <td style="border: 1px solid #000; width:150px;background-color:#0b0f8a;color:#ffffff;font-size:10pt"><b>ISSUE BY CATEGORY</b></td>
        //               <td style="border: 1px solid #000; width:150px;background-color:#0b0f8a;color:#ffffff;font-size:10pt;text-align:center"><b>Total</b></td>
        //             </tr>
        //             ${total.map(tot => `
        //             <tr>
        //               <td style="border: 1px solid #000; width:150px;background-color:#0b0f8a;color:#ffffff;font-size:10pt"><b>${tot.category}</b></td>
        //               <td style="border: 1px solid #000; width:150px;background-color:#ffffff;color:#0b0f8a;font-size:10pt;text-align:right"><b>${numberFormat(tot.total)}</b></td>
        //             </tr>
        //             `).join('')}
        //             <tr>
        //               <td style="border: 1px solid #000; width:150px;background-color:#0b0f8a;color:#ffffff;font-size:10pt"><b>Total DH</b></td>
        //               ${totaldh.map(dh => `
        //               <td style="border: 1px solid #000; width:150px;background-color:#0b0f8a;color:#ffffff;font-size:10pt;text-align:right"><b>${numberFormat(dh.total)}</b></td>
        //               `).join('')}
        //             </tr>
        //             <tr>
        //               <td style="border: 1px solid #000; width:150px;background-color:#0b0f8a;color:#ffffff;font-size:10pt"><b>Grand Total</b></td>
        //               <td style="border: 1px solid #000; width:150px;background-color:#0b0f8a;color:#ffffff;font-size:10pt;text-align:right"><b>${numberFormat(ttl)}</b></td>
        //             </tr>
        //           </tbody>
        //         </table>
        //       </body>
        //     </html>
        //     `,
        //     attachments: [
        //         {
        //           filename: fileName,
        //           path: path.join(__dirname, '../../download/', fileName), 
        //           contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        //         },
        //     ],
        // };

        // console.log(process.env.DOWNLOAD_PATH)
    
        // // Kirim email
        // transporter.sendMail(mailOptions, (error, info) => {
        //     if (error) {
        //         console.log('Error saat mengirim email:', error);
        //     } else {
        //         console.log('Email terkirim: ' + info.response);
        //     }
        // });   
        return true 
    }catch(error){
        logger.error(error)
        console.error('Error during update:', error);
        return false;
    }
}


const sumFunction = (data) => {
    const totals = data.reduce((acc, curr) => {
        if (!acc[curr.owner]) {
            acc[curr.owner] = 0;
        }
        acc[curr.owner] += curr.qty;
        return acc;
    }, {});

    const grandTotal = Object.values(totals).reduce((acc, curr) => acc + curr, 0);
    const datas = {
        total : totals,
        jml: grandTotal
    }

    return datas
}

module.exports = {
    getData,
    getFCShift,
    getFCHmkm,
    getKPC,
    getFCByOwner,
    bodyMail
}