const db = require('../../database/helper');
const { formattedHeaders, formatDDMonthYYYY,formattedHHMM,formatedDatesNames } = require('../../helpers/dateHelper');
const logger = require('../../helpers/pinoLog');
const { getEquipment, getFilterBanlaws, getMdElipse } = require('../../helpers/proto/master-data');
const { QUERY_STRING } = require('../../helpers/queryEnumHelper');
const nodemailer = require('nodemailer');


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
        const fetchData = await db.query(QUERY_STRING.getDataForMail, [dateFrom, dateTo])
        const UnitsNosKPC = fetchData.rows.filter(item => item.type === 'Receipt KPC').map(item => item.station);
        const UnitsNos = fetchData.rows.filter(item => item.type !== 'Receipt KPC').map(item => item.no_unit);
        const fetchUnit = await getEquipment(UnitsNos)
        const unit = JSON.parse(fetchUnit.data)
        const fetchBanlaws = await getFilterBanlaws(UnitsNosKPC)
        const banlaws = JSON.parse(fetchBanlaws.data)


        const mergedData = fetchData.rows.map(item => {
            const matchingData = banlaws.find(data => data.unit_elipse === String(item.station));
            console.log(`Memeriksa: item.station = ${item.station}, matchingData.unit_elipse = ${matchingData ? matchingData.unit_elipse : 'Tidak ditemukan'}`);
            if (matchingData) {
                return {
                    ...item,
                    owner: matchingData.owner
                };
            }
            return item;
        });
         
        const data = {
            dataKpc: dataKpc,
            dataIssued: dataIssued
        }
        return mergedData
    }catch(error){
        logger.error(error)
        console.error('Error during update:', error);
        return false;
    }
}

const bodyMail = () => {
    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: 25,
        secure: false, 
        auth: {
            user: process.env.MAIL_USER, 
            pass: process.env.MAIL_PASSWORD,
        },
        tls:{
            rejectUnauthorized:false
        }
    });
let mailOptions = {
    from: process.env.MAIL_EMAIL,
    to: 'annisa@think-match.com',
    subject: 'RECEIPT KPC',
    html: `
        <table style="border-collapse: collapse; width: 100%; color: white;">
            <tr>
                <th style="background-color: #00008B; border: 1px solid black; padding: 8px; text-align: left;">RECEIPT KPC</th>
                <th style="background-color: #00008B; border: 1px solid black; padding: 8px; text-align: left;">Date 16 October 2024</th>
            </tr>
            <tr>
                <td style="background-color: #00008B; border: 1px solid black; padding: 8px;">PT. Madhani Talata Nusantara</td>
                <td style="background-color: #00008B; border: 1px solid black; padding: 8px; text-align: right;">95,041</td>
            </tr>
            <tr>
                <td style="background-color: #00008B; border: 1px solid black; padding: 8px;">PT. Darma Henwa Tbk</td>
                <td style="background-color: #00008B; border: 1px solid black; padding: 8px; text-align: right;">129,599</td>
            </tr>
            <tr>
                <td style="background-color: #00008B; border: 1px solid black; padding: 8px; font-weight: bold;">Grand Total</td>
                <td style="background-color: #00008B; border: 1px solid black; padding: 8px; text-align: right; font-weight: bold;">224,640</td>
            </tr>
        </table>
    `,
    attachments: [
        // {
        //   filename: 'report.pdf', 
        //   path: './path/to/report.pdf', 
        //   contentType: 'application/pdf', 
        // },
      ],
    };

    // Kirim email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error saat mengirim email:', error);
        } else {
            console.log('Email terkirim: ' + info.response);
        }
    });    
}

module.exports = {
    getData,
    getFCShift,
    getFCHmkm,
    getKPC,
    getContentyMail,
    getFCByOwner,
    bodyMail
}