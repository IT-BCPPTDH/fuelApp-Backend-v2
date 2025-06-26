const ExcelJS = require('exceljs');
const db = require('../database/helper')
const logger = require("../helpers/pinoLog");
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');
const { QUERY_STRING } = require('../helpers/queryEnumHelper');
const { formatYYYYMMDD, formatedDatesYYYYMMDD, formattedHHMM, formatedMonth, 
    getFirstDate, formatedDatesNames,formatDateMMYYYY, formatDDMonthYYYY } = require('../helpers/dateHelper')
const { HTTP_STATUS, STATUS_MESSAGE } = require("../helpers/enumHelper");
const { getTableDashboard } = require('../query-service/admin_dashboard/admin_dashboard_services');
const { getData, getFCShift, getFCHmkm,getKPC, 
    getContentyMail, getFCByOwner, bodyMail } = require('../query-service/downloads/download_services');


const generateExcel = (data, headers, fileName) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Sheet1");

    let startRow = 3;
    data.forEach((row, index) => {
        renderTemplate(index, sheet, row, headers, startRow);
        let additionalRows = row.data_unit ? row.data_unit.length + 4 : 4;
        startRow += additionalRows + 3;
    });

    const createFile = async (outputPath) => {
        return await workbook.xlsx.writeFile(outputPath)
            .then((file) => {
                return true
            })
            .catch((error) => {
                console.error('Gagal menyimpan file Excel:', error);
            });
    }

    const outputPath = path.join(__dirname + '../../download', fileName);
    return new Promise(async (resolve, reject) => {
        try {
            const exists = fs.existsSync(outputPath)

            if (exists) {
                fs.unlink(outputPath, async (err) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {
                        const fileDownload = await createFile(outputPath);
                        if (fileDownload) {
                            resolve(fileName);
                        } else {
                            resolve(false);
                        }
                    }
                });
            } else {
                const fileDownload = await createFile(outputPath);
                if (fileDownload) {
                    resolve(fileName);
                } else {
                    resolve(false);
                }
            }
        } catch (err) {
            console.error(err);
            reject(err);
        }
    });
}

function renderTemplate(index, sheet, data, headers, startRow) {
    sheet.getCell(`B${startRow}`).value = 'No LKF';
    sheet.getCell(`B${startRow + 1}`).value = 'No Unit';
    sheet.getCell(`B${startRow + 2}`).value = 'Shift';
    sheet.getCell(`D${startRow}`).value = 'FM Awal';
    sheet.getCell(`D${startRow + 1}`).value = 'FM Akhir';
    sheet.getCell(`D${startRow + 2}`).value = 'Total Issued';
    sheet.getCell(`F${startRow + 2}`).value = 'Time';
    sheet.getCell(`H${startRow + 2}`).value = 'Flow Meter';
    sheet.getCell(`J${startRow + 2}`).value = 'Shift';

    sheet.getCell(`A${startRow}`).value = index+1;
    sheet.getCell(`C${startRow}`).value = data.lkf_id;
    sheet.getCell(`C${startRow + 1}`).value = data.station;
    sheet.getCell(`C${startRow + 2}`).value = data.shift;
    sheet.getCell(`E${startRow}`).value = data.flow_meter_start;
    sheet.getCell(`E${startRow + 1}`).value = data.flow_meter_end;
    sheet.getCell(`E${startRow + 2}`).value = data.total_in;
    sheet.getCell(`H${startRow + 1}`).value = data.date

    const indexStyle = [`A${startRow}`]

    indexStyle.forEach((cell) => {
        sheet.getCell(cell).font = { bold: true };
        sheet.getCell(cell).alignment = { horizontal: 'center', vertical: 'middle' };
    });

    const styledCells = [
        `B${startRow}`, `B${startRow + 1}`, `B${startRow + 2}`,
        `D${startRow}`, `D${startRow + 1}`, `D${startRow + 2}`,
        `F${startRow + 2}`, `H${startRow + 2}`, `H${startRow + 1}`, , `J${startRow + 2}`
    ];
    styledCells.forEach((cell) => {
        sheet.getCell(cell).font = { bold: true };
        sheet.getCell(cell).alignment = { horizontal: 'center', vertical: 'middle' };
        sheet.getCell(cell).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });

    const valueCells = [
        `C${startRow}`, `C${startRow + 1}`, `C${startRow + 2}`,
        `E${startRow}`, `E${startRow + 1}`, `E${startRow + 2}`,
        `H${startRow + 1}`
    ];
    valueCells.forEach((cell) => {
        sheet.getCell(cell).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });

    const blueStyle = [
        `B${startRow}`, `B${startRow + 1}`, `B${startRow + 2}`,
        `D${startRow}`, `D${startRow + 1}`, `D${startRow + 2}`,
        `F${startRow + 2}`
    ]

    blueStyle.forEach((cell) => {
        sheet.getCell(cell).fill = 
        {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'dbebf3' }, 
        };
    });

    const yellowStyle = [
        `H${startRow + 1}`
    ]

    yellowStyle.forEach((cell) => {
        sheet.getCell(cell).fill = 
        {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'ffff00' }, 
        };
    });

    const greenStyle = [
        `H${startRow + 2}`, `J${startRow + 2}`
    ]

    greenStyle.forEach((cell) => {
        sheet.getCell(cell).fill = 
        {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '94cc54' }, 
        };
    });

    const purpleStyle = [
        `C${startRow}`
    ]

    purpleStyle.forEach((cell) => {
        sheet.getCell(cell).fill = 
        {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '7434a4' }, 
        };
        sheet.getCell(cell).font = { color: { argb: 'FFFFFFFF' } };
    });

    sheet.mergeCells(`F${startRow + 2}:G${startRow + 2}`);
    sheet.getCell(`F${startRow + 2}`).alignment = { horizontal: 'center', vertical: 'middle' };

    sheet.mergeCells(`H${startRow + 1}:I${startRow + 1}`);
    sheet.mergeCells(`H${startRow + 2}:I${startRow + 2}`);
    sheet.getCell(`H${startRow + 1}`).alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getCell(`H${startRow + 2}`).alignment = { horizontal: 'center', vertical: 'middle' };
    for (let col = 'A'; col <= 'J'; col = String.fromCharCode(col.charCodeAt(0) + 1)) {
        sheet.getColumn(col).width = 10;
    }

    let totalQty = 0;
    if (data.data_unit && data.data_unit.length > 0) {
        const headerRow = sheet.addRow(['', ...headers, '','', 'Jam Awal', 'Jam Akhir']); 

        let unitStartRow = headerRow.number + 1;

        headerRow.eachCell((cell, colNumber) => { 
            if (colNumber > 1 && colNumber < headerRow.cellCount - 3) { 
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'f3f3f3' },
                };
                cell.alignment = {
                    horizontal: 'center',
                    vertical: 'middle',
                };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            }
        });

        headerRow.height = 15;

        function convertTimeToInteger(timeString) {
            return parseInt(timeString.replace(':', ''), 10);
        }

        data.data_unit.forEach((unit, index) => {
            let row = unitStartRow + index;
            sheet.getCell(`B${unitStartRow + index}`).value = unit.no_unit || '';
            sheet.getCell(`C${unitStartRow + index}`).value = unit.hmkm || 0;
            sheet.getCell(`D${unitStartRow + index}`).value = unit.qty || 0;
            sheet.getCell(`E${unitStartRow + index}`).value = unit.driver || 0;
            sheet.getCell(`F${unitStartRow + index}`).value = unit.start || '';
            sheet.getCell(`G${unitStartRow + index}`).value = unit.end || '';
            sheet.getCell(`H${unitStartRow + index}`).value = unit.awal || 0;
            sheet.getCell(`I${unitStartRow + index}`).value = unit.akhir || 0;
            sheet.getCell(`J${unitStartRow + index}`).value = unit.shift == 'Day' ? 'D' : 'N';
            sheet.getCell(`K${unitStartRow + index}`).value = unit.type === 'Transfer' ? 'Transfer' : unit.type === 'Receipt' ? 'Receipt' : unit.type === 'Receipt KPC' ? 'Receipt KPC' : '';

            const jamAwal = unit.start || '00:00';
            const jamAkhir = unit.end || '00:00';
            sheet.getCell(`M${row}`).value = convertTimeToInteger(jamAwal);
            sheet.getCell(`N${row}`).value = convertTimeToInteger(jamAkhir);

            totalQty += unit.qty || 0;

            let totalRow = unitStartRow + data.data_unit.length; 
            sheet.getCell(`D${totalRow}`).value = totalQty; 
            
            const borderedCells = [
                `B${row}`, `C${row}`, `D${row}`, `E${row}`,
                `F${row}`, `G${row}`, `H${row}`, `I${row}`, `J${row}`
            ];
            
            borderedCells.forEach((cell) => {
                sheet.getCell(cell).border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
            
            sheet.getCell(`D${row}`).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'c3dbf3' } 
            };

            sheet.getCell(`J${row}`).alignment = {
                horizontal: 'center',
                vertical: 'middle',
            };

            sheet.getCell(`J${row}`).font = { bold: true };
        
            if (unit.type === 'Transfer') {
                sheet.getCell(`B${row}`).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'b5f2a2' } 
                };
                sheet.getCell(`B${row}`).font = { color: { argb: '0a801a' } };
                sheet.getCell(`K${row}`).font = { color: { argb: '0a801a' } };
            } else if (unit.type === 'Receipt' || unit.type === 'Receipt KPC' ) {
                sheet.getCell(`B${row}`).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'f3a3a3' } 
                };
                sheet.getCell(`B${row}`).font = { color: { argb: 'a61516' } };
                sheet.getCell(`K${row}`).font = { color: { argb: 'a61516' } };
            }
        });
    }
}

const generateRaw = (data, headers, fileName) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Sheet1");
    const headerRow = sheet.addRow(['','', ...headers]);

    headerRow.eachCell((cell, colNumber) => {
        if (colNumber > 2) { 
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'dbebf3' },
            };
            cell.alignment = {
                horizontal: 'center',
                vertical: 'middle',
            };
        }
    });

    headerRow.height = 15;

    data.forEach((row) => {
        const excelRow = sheet.addRow(['','', ...row]);

        row.forEach((cell, colIndex) => {
            const currentCell = excelRow.getCell(colIndex + 3);

            currentCell.alignment = { horizontal: 'center', vertical: 'middle' };

            const column = sheet.getColumn(colIndex + 3);
            const cellTextLength = cell ? cell.toString().length : 10;
            const currentWidth = column.width || 0;
            const desiredWidth = Math.max(cellTextLength + 10, currentWidth);
            column.width = desiredWidth;
        });
    });

    const createFile = async (outputPath) => {
        return await workbook.xlsx.writeFile(outputPath)
            .then((file) => {
                return true
            })
            .catch((error) => {
                console.error('Gagal menyimpan file Excel:', error);
            });
    }

    const outputPath = path.join(__dirname + '../../download', fileName);
    return new Promise(async (resolve, reject) => {
        try {
            const exists = fs.existsSync(outputPath)

            if (exists) {
                fs.unlink(outputPath, async (err) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {
                        const fileDownload = await createFile(outputPath);
                        if (fileDownload) {
                            resolve(fileName);
                        } else {
                            resolve(false);
                        }
                    }
                });
            } else {
                const fileDownload = await createFile(outputPath);
                if (fileDownload) {
                    resolve(fileName);
                } else {
                    resolve(false);
                }
            }
        } catch (err) {
            console.error(err);
            reject(err);
        }
    });
}

const generateElipse = (data, headers, fileName) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Sheet1");
    const headerRow = sheet.addRow(['','', ...headers]);

    headerRow.eachCell((cell, colNumber) => {
        if (colNumber > 2) { 
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'dbebf3' },
            };
            cell.alignment = {
                horizontal: 'center',
                vertical: 'middle',
            };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        }
    });

    headerRow.height = 15;

    data.forEach((row) => {
        const excelRow = sheet.addRow(['','', ...row]);

        row.forEach((cell, colIndex) => {
            const currentCell = excelRow.getCell(colIndex + 3);

            currentCell.alignment = { horizontal: 'center', vertical: 'middle' };

            const column = sheet.getColumn(colIndex + 3);
            const cellTextLength = cell ? cell.toString().length : 10;
            const currentWidth = column.width || 0;
            const desiredWidth = Math.max(cellTextLength + 10, currentWidth);
            column.width = desiredWidth;
        });
    });

    const createFile = async (outputPath) => {
        return await workbook.xlsx.writeFile(outputPath)
            .then((file) => {
                return true
            })
            .catch((error) => {
                console.error('Gagal menyimpan file Excel:', error);
            });
    }

    const outputPath = path.join(__dirname + '../../download', fileName);
    return new Promise(async (resolve, reject) => {
        try {
            const exists = fs.existsSync(outputPath)

            if (exists) {
                fs.unlink(outputPath, async (err) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {
                        const fileDownload = await createFile(outputPath);
                        if (fileDownload) {
                            resolve(fileName);
                        } else {
                            resolve(false);
                        }
                    }
                });
            } else {
                const fileDownload = await createFile(outputPath);
                if (fileDownload) {
                    resolve(fileName);
                } else {
                    resolve(false);
                }
            }
        } catch (err) {
            console.error(err);
            reject(err);
        }
    });
}

const downloadReportLkf = async (data) => {
    try {
        let convertedArray;
        let fileName;
        const dateBefore = formatYYYYMMDD(data.tanggalFrom);
        const dateNow = formatYYYYMMDD(data.tanggalTo);
        let paramIndex = 3;

        // Use DISTINCT in SQL to filter duplicates at the database level
        let query = `SELECT fl.lkf_id, 
                            TO_CHAR((fl."date"::timestamp at TIME zone 'UTC' at TIME zone 'Asia/Bangkok'), 'YYYY-MM-DD') as date,
                            fl.shift, fl.site, fl.fuelman_id, fl.station, fl.opening_sonding, fl.closing_sonding, 
                            fl.opening_dip, fl.closing_dip, fd2.flow_start , fd2.flow_end, 
                            fl."status", fl.note, fl.created_at, fl.updated_at, 
                            fl2.login_time, fl2.logout_time, fd2.hm_km,fd2.hm_last,
                            fl.hm_start, fl.hm_end,
                            fd.no_unit, fd2.qty, fd2.qty_last,fd.jde_operator as operator, fd."start", fd."end", fd.type 
                     FROM form_lkf fl
                     LEFT JOIN fuelman_log fl2 ON fl.fuelman_id = fl2.jde_operator 
                     left join form_data fd2 on fl.lkf_id = fd2.lkf_id
                     JOIN form_data fd ON fd.lkf_id = fl.lkf_id 
                     WHERE fl."date" BETWEEN $1 AND $2`;

        let values = [dateBefore, dateNow];

        if (data.station.length > 0) {
            query += ` AND fl.station = ANY($${paramIndex})`;
            values.push(data.station);
            paramIndex++;
        }

        if (data.type !== 'All') {
            if (data.type === 'Issued And Transfer') {
                query += ` AND fd.type IN ('Issued', 'Transfer')`;
            } else if (data.type === 'Receipt Only') {
                query += ` AND fd.type IN ('Receipt')`;
            } else if (data.type === 'Issued Only') {
                query += ` AND fd.type IN ('Issued')`;
            } else if (data.type === 'Receipt KPC Only') {
                query += ` AND fd.type IN ('Receipt KPC')`;
            }
        }

        query += ' ORDER BY fl.date, fl.shift, fl.lkf_id';

        const result = await db.query(query, values);
        
        if (result.rowCount === 0) {
            return {
                status: HTTP_STATUS.OK,
                message: 'No data found',
            };
        }

        const uniqueRows = Array.from(new Map(result.rows.map(item => [item.lkf_id, item])).values());

        if (data.option === "Excel") {
            fileName = `Excel-${dateBefore}-${dateNow}.xlsx`;
            const datas = transformData(result.rows); 
            const headers = ['Unit', 'HM/KM', 'Qty', 'Driver', 'IN', 'OUT', 'Awal', 'Akhir', 'Shift'];

            await generateExcel(datas, headers, fileName);

            return {
                status: HTTP_STATUS.OK,
                link: fileName,
                data: result.rows
            };
        } else if (data.option === "Elipse") {
            fileName = `Excel-template-LKF-${formatedDatesNames(dateBefore)}-${formatedDatesNames(dateNow)}.xlsx`;
            const headers = ['Usage Sheet Id', 'District', 'Whouseid', 'Default Usage Date', 'Usage Date(YYYYMMDD)', 
                             'Equip Ref', 'Account Code', 'Bulk Mat Type', 'Quantity'];

            convertedArray = uniqueRows.map(val => {
                const usage_sheet = `LKF_${(formatedMonth(val.date))}`;
                const accountCode = "12231004601";
                const bulkMat = 'F001';
                return [
                    usage_sheet,
                    val.site,
                    "PIT A",
                    formatedDatesYYYYMMDD(val.date),
                    formatedDatesYYYYMMDD(val.date),
                    val.no_unit,
                    accountCode,
                    bulkMat,
                    val.qty
                ];
            });

            await generateElipse(convertedArray, headers, fileName);

            return {
                status: HTTP_STATUS.OK,
                link: fileName
            };
        } else {
            fileName = `Excel-template-LKF-${formatedDatesNames(dateBefore)}-${formatedDatesNames(dateNow)}-Raw.xlsx`;
            const headers = ['NOMOR_LKF', 'DATE', 'SHIFT', 'HM_AWAL', 'HM_AKHIR', 'LOCATION', 'ID_FUELMAN',
                             'STATION', 'OPENING_DIP', 'CLOSING_DIP', 'OPENING_SONDING', 'CLOSING_SONDING', 
                             'FLOW_METER_START', 'FLOW_METER_END', 'TOTAL_METER', 'STATUS', 'NOTES', 
                             'LOGIN_TIME', 'LOGOUT_TIME', 'CREATED_AT', 'UPDATED_AT'];

            convertedArray = uniqueRows.map(val => [
                val.lkf_id,
                val.date,
                val.shift,
                val.hm_start,
                val.hm_end,
                val.site,
                val.fuelman_id,
                val.station,
                val.opening_dip,
                val.closing_dip,
                val.opening_sonding,
                val.closing_sonding,
                val.flow_start,
                val.flow_end,
                val.flow_end - val.flow_start,
                val.status,
                val.notes,
                val.login_time,
                val.logout_time,
                val.created_at,
                val.updated_at
            ]);

            await generateRaw(convertedArray, headers, fileName);

            return {
                status: HTTP_STATUS.OK,
                link: fileName
            };
        }
    } catch (error) {
        console.log(error)
        logger.error(error);
        return {
            status: HTTP_STATUS.BAD_REQUEST,
            message: `${error}`,
        };
    }
}

const transformData = (data) => {
    const result = [];

    data.forEach((item) => {
        let existingEntry = result.find(entry => entry.lkf_id === item.lkf_id);

        if (!existingEntry) {
            existingEntry = {
                lkf_id: item.lkf_id,
                station: item.station,
                shift: item.shift,
                flow_meter_start: item.flow_start,
                flow_meter_end: item.flow_end,
                date: `${formatedDatesNames(item.date)}`,
                total_in: 0, 
                data_unit: []
            };
            result.push(existingEntry);
        }

        // Cek duplikasi sebelum menambahkan ke data_unit
        const unitExists = existingEntry.data_unit.some(
            unit => unit.no_unit === item.no_unit &&
                    unit.start === formattedHHMM(item.start) &&
                    unit.end === formattedHHMM(item.end) &&
                    unit.type === item.type
        );

        if (!unitExists) {
            existingEntry.data_unit.push({
                no_unit: item.no_unit,
                driver: item.operator,
                hmkm: item.hm_km,
                qty: item.qty,
                start: formattedHHMM(item.start),
                end: formattedHHMM(item.end),
                awal: item.flow_start,
                akhir: item.flow_end,
                shift: item.shift,
                type: item.type
            });

            existingEntry.flow_meter_start = existingEntry.data_unit[0].awal;
            existingEntry.flow_meter_end = item.flow_end; 
            existingEntry.total_in = existingEntry.flow_meter_end - existingEntry.flow_meter_start;
        }
    });

    return result;
};


const downloadHomeStation = async(data) => {
    try{
        const result = await getTableDashboard(data)
        const fileNames = `Excel-history-Fuel-${formatedDatesNames(data.tanggal)}(${data.option}).xlsx`
        const headers = ['Station', 'Open Stock', 'Receipt KPC', 'Receipt', 'Issued', 'Transfer',
        'Close Sonding', 'Close Data', 'Variant', 'InterShift O/C Variance(N to D)', 'InterShift O/C Variance(D to N)'];
    
        const convertedArray = result.map(val => [
            val.station, 
            val.total_opening,
            val.total_receive_kpc,
            val.total_receive,
            val.total_issued,
            val.total_transfer,
            val.total_closing,
            val.total_close_data,
            val.total_variant,
            val.intershiftNtoD,
            val.intershiftDtoN,
        ]);

        const totals = functionTotal(result)

        await generateReportStation(convertedArray, totals, headers, fileNames);
        
        return {
            status: HTTP_STATUS.OK,
            link: fileNames
        }
    }catch(error){
        logger.error(error)
        return {
            status: HTTP_STATUS.BAD_REQUEST,
            message: `${error}`,
        };
    }
}

const generateReportStation = (data, totalQty, headers, fileName) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Sheet1");
    const startRow = 3;
    const headerRow = sheet.insertRow(startRow, ['', ...headers]);

    headerRow.eachCell((cell, colNumber) => {
        if (colNumber > 1) { 
            cell.alignment = {
                horizontal: 'center',
                vertical: 'middle',
            };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        }
        if (colNumber >= 9 && colNumber <= 12) {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'fbf3bb' } 
            };
        }
    });

    headerRow.height = 15;

    for (let col = 'K'; col <= 'L'; col = String.fromCharCode(col.charCodeAt(0) + 1)) {
        sheet.getColumn(col).width = 25;
    }

    data.forEach((row, index) => {
        const rowIndex = startRow + 1 + index;
        const excelRow = sheet.insertRow(rowIndex, ['', ...row]);

        row.forEach((cell, colIndex) => {
            const currentCell = excelRow.getCell(colIndex + 2);

            currentCell.alignment = { horizontal: 'center', vertical: 'middle' };
            currentCell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };

            const column = sheet.getColumn(colIndex + 2);
            const cellTextLength = cell ? cell.toString().length : 10;
            const currentWidth = column.width || 0;
            const desiredWidth = Math.max(cellTextLength + 11, currentWidth);
            column.width = desiredWidth;
        });
    });

    const totalRow = [
        'Total',
        totalQty.total_opening.toLocaleString('en-US'),
        totalQty.totalKpc.toLocaleString('en-US'),
        totalQty.totalReceipt.toLocaleString('en-US'),
        totalQty.total_issued.toLocaleString('en-US'),
        totalQty.totalTransfer.toLocaleString('en-US'),
        totalQty.totalClosing.toLocaleString('en-US'),
        totalQty.totalCloseData.toLocaleString('en-US'),
        totalQty.totalVariant.toLocaleString('en-US'),
        totalQty.totalNtoD.toLocaleString('en-US'),
        totalQty.totalDtoN.toLocaleString('en-US'),
    ];

    const excelTotalRow = sheet.addRow(['',...totalRow]);

    excelTotalRow.eachCell((cell, colNumber) => {
        if(colNumber > 1){
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.font = { bold: true };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        }
    });
    
    const createFile = async (outputPath) => {
        return await workbook.xlsx.writeFile(outputPath)
            .then((file) => {
                return true
            })
            .catch((error) => {
                console.error('Gagal menyimpan file Excel:', error);
            });
    }

    const outputPath = path.join(__dirname + '../../download', fileName);
    return new Promise(async (resolve, reject) => {
        try {
            const exists = fs.existsSync(outputPath)

            if (exists) {
                fs.unlink(outputPath, async (err) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {
                        const fileDownload = await createFile(outputPath);
                        if (fileDownload) {
                            resolve(fileName);
                        } else {
                            resolve(false);
                        }
                    }
                });
            } else {
                const fileDownload = await createFile(outputPath);
                if (fileDownload) {
                    resolve(fileName);
                } else {
                    resolve(false);
                }
            }
        } catch (err) {
            console.error(err);
            reject(err);
        }
    });
}

const functionTotal = (data) => {
    const totals = data.reduce((acc, item) => {
        const totalOpening = typeof item.total_opening === 'string' 
            ? Number(item.total_opening.replace(/,/g, '')) 
            : Number(item.total_opening) || 0;
        const totalClosing = typeof item.total_closing === 'string' 
            ? Number(item.total_closing.replace(/,/g, '')) 
            : Number(item.total_closing) || 0;
        const totalKpc = typeof item.total_receive_kpc === 'string' 
            ? Number(item.total_receive_kpc.replace(/,/g, '')) 
            : Number(item.total_receive_kpc) || 0;
        const totalReceipt = typeof item.total_receive === 'string' 
            ? Number(item.total_receive.replace(/,/g, '')) 
            : Number(item.total_receive) || 0;
        const totalTransfer = typeof item.total_transfer === 'string' 
            ? Number(item.total_transfer.replace(/,/g, '')) 
            : Number(item.total_transfer) || 0;
        const totalVariant = typeof item.total_variant === 'string' 
            ? Number(item.total_variant.replace(/,/g, '')) 
            : Number(item.total_variant) || 0;

        const totalCloseData = typeof item.total_close_data === 'string' 
            ? Number(item.total_close_data.replace(/,/g, '')) 
            : Number(item.total_close_data) || 0;
    
        const totalIssued = typeof item.total_issued === 'string' 
            ? Number(item.total_issued.replace(/,/g, '')) 
            : Number(item.total_issued) || 0;

        const totalNtoD = typeof item.intershiftNtoD === 'string' 
            ? Number(item.intershiftNtoD.replace(/,/g, '')) 
            : Number(item.intershiftNtoD) || 0;

        const totalDtoN = typeof item.intershiftDtoN === 'string' 
            ? Number(item.intershiftDtoN.replace(/,/g, '')) 
            : Number(item.intershiftDtoN) || 0;
    
        // Update the accumulator
        acc.total_opening += totalOpening;
        acc.total_issued += totalIssued;
        acc.totalKpc += totalKpc;
        acc.totalClosing += totalClosing;
        acc.totalReceipt += totalReceipt;
        acc.totalTransfer += totalTransfer;
        acc.totalVariant += totalVariant;
        acc.totalCloseData += totalCloseData;
        acc.totalNtoD += totalNtoD;
        acc.totalDtoN += totalDtoN;
    
        return acc;
    }, { total_opening: 0,totalKpc: 0, total_issued: 0, totalCloseData: 0,
    totalClosing: 0, totalReceipt: 0, totalTransfer:0, totalVariant:0, totalNtoD:0,  totalDtoN:0});

    return totals
}

const downloadLkfDetailedLkf = async(data) => {
    try{
        const result = await db.query(QUERY_STRING.getHomeTable, [data.lkfId])
        const fileNames = `Excel-template-LKF-${data.lkfId}-${formatedDatesNames(data.tanggal)}.xlsx`
        const headers = ['ID-ROW', 'UNIT_NO', 'MODEL_UNIT', 'HM_KM', 'QTY_ISSUED', 'FLOWMETER_AWAL',
        'FLOWMETER_AKHIR', 'NAMA_OPERATOR', 'ID_OPERATOR', 'REFUEL_START', 'REFUEL_STOP', 'TYPE', 'FBR History'];
    
        const convertedArray = result.rows.map(val => [
            val.from_data_id, 
            val.no_unit,
            val.model_unit,
            val.hm_km,
            val.qty,
            val.flow_start,
            val.flow_end,
            val.name_operator,
            val.jde_operator,
            formattedHHMM(val.start),
            formattedHHMM(val.end),
            val.type === "Issued" ? "I" : val.type === "Transfer" ? "T" : val.type === "Receipt" ? "R" : val.type,
            val.fbr
        ]);

        await generateLkf(convertedArray, headers, fileNames);
        
        return {
            status: HTTP_STATUS.OK,
            link: fileNames
        }
    }catch(error){
        console.log(error)
        logger.error(error)
        return {
            status: HTTP_STATUS.BAD_REQUEST,
            message: `${error}`,
        };
    }
}

const generateLkf = async(data, headers, fileName)=>{
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Sheet1");
    const headerRow = sheet.addRow(headers);

    headerRow.eachCell((cell, colNumber) => {
        cell.alignment = {
            horizontal: 'center',
            vertical: 'middle',
        };
    });

    headerRow.height = 15;

    data.forEach((row) => {
        const excelRow = sheet.addRow(row);

        row.forEach((cell, colIndex) => {
            const currentCell = excelRow.getCell(colIndex + 1);
            const column = sheet.getColumn(colIndex + 1);
            const cellTextLength = cell ? cell.toString().length : 10;
            const currentWidth = column.width || 0;
            const desiredWidth = Math.max(cellTextLength + 10, currentWidth);
            column.width = desiredWidth;
        });
    });

    const createFile = async (outputPath) => {
        return await workbook.xlsx.writeFile(outputPath)
            .then((file) => {
                return true
            })
            .catch((error) => {
                console.error('Gagal menyimpan file Excel:', error);
            });
    }

    const outputPath = path.join(__dirname + '../../download', fileName);
    return new Promise(async (resolve, reject) => {
        try {
            const exists = fs.existsSync(outputPath)

            if (exists) {
                fs.unlink(outputPath, async (err) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {
                        const fileDownload = await createFile(outputPath);
                        if (fileDownload) {
                            resolve(fileName);
                        } else {
                            resolve(false);
                        }
                    }
                });
            } else {
                const fileDownload = await createFile(outputPath);
                if (fileDownload) {
                    resolve(fileName);
                } else {
                    resolve(false);
                }
            }
        } catch (err) {
            console.error(err);
            reject(err);
        }
    });
}

const downloadLkfElipse = async(data) => {
    try{
        const result = await db.query(QUERY_STRING.getHomeTable, [data.lkfId])
        const fileNames = `LKF-${data.lkfId}-${data.tanggal}.xlsx`
        const headers = ['Usage Sheet Id', 'District', 'Whouse Id', 'Default Usage Date(YYYYMMDD)', 
        'Usage Date(YYYYMMDD)', 'Equip Ref', 'Account Code', 'Bulk Mat Type', 'Quantity'];
    
        const convertedArray = result.rows.map(val => {
            const usage_sheet = `LKF-${(formatedDatesNames(data.tanggal))}`;
            const accountCode = "12231004601"
            const bulkMat = 'F001'
            return [
                usage_sheet,
                val.site,
                val.station,
                formatedDatesYYYYMMDD(data.tanggal),
                formatedDatesYYYYMMDD(data.tanggal),
                val.no_unit,
                accountCode,
                bulkMat,
                val.qty
            ]
        });


        await generateLkfElipse(convertedArray, headers, fileNames);
        
        return {
            status: HTTP_STATUS.OK,
            link: fileNames
        }
    }catch(error){
        logger.error(error)
        return {
            status: HTTP_STATUS.BAD_REQUEST,
            message: `${error}`,
        };
    }
}

const generateLkfElipse = async(data, headers, fileName) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Sheet1");
    const headerRow = sheet.addRow(headers);

    headerRow.eachCell((cell, colNumber) => {
        cell.alignment = {
            horizontal: 'center',
            vertical: 'middle',
        };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });

    headerRow.height = 15;

    data.forEach((row) => {
        const excelRow = sheet.addRow(row);

        row.forEach((cell, colIndex) => {
            const currentCell = excelRow.getCell(colIndex + 1);
            const column = sheet.getColumn(colIndex + 1);
            currentCell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            const cellTextLength = cell ? cell.toString().length : 10;
            const currentWidth = column.width || 0;
            const desiredWidth = Math.max(cellTextLength + 10, currentWidth);
            column.width = desiredWidth;
        });
    });

    const createFile = async (outputPath) => {
        return await workbook.xlsx.writeFile(outputPath)
            .then((file) => {
                return true
            })
            .catch((error) => {
                console.error('Gagal menyimpan file Excel:', error);
            });
    }

    const outputPath = path.join(__dirname + '../../download', fileName);
    return new Promise(async (resolve, reject) => {
        try {
            const exists = fs.existsSync(outputPath)

            if (exists) {
                fs.unlink(outputPath, async (err) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {
                        const fileDownload = await createFile(outputPath);
                        if (fileDownload) {
                            resolve(fileName);
                        } else {
                            resolve(false);
                        }
                    }
                });
            } else {
                const fileDownload = await createFile(outputPath);
                if (fileDownload) {
                    resolve(fileName);
                } else {
                    resolve(false);
                }
            }
        } catch (err) {
            console.error(err);
            reject(err);
        }
    });
}

const DailyConsumtion = async(data) => {
    try{
        const dateTill = formatYYYYMMDD(data.untilDate)
        const dateFrom = getFirstDate(dateTill)

        const title = ['FUEL ISSUED DAILY']
        const headersOne = [`Fuel Consumtion - ${formatDateMMYYYY(data.untilDate)}`];
        const headersTwo = ['DESCRIPTION', 'EQUIPMENT', 'OWNER', 'LOCATION', 'TOTAL'];
        const headersThree = ['UNIT NO', 'EGI', 'LOCATION', 'TOTAL'];

        let result, fileNames
        if(data.option == 'Consumtion'){
            fileNames = `Fuel-Consumption-${formatedDatesNames(data.untilDate)}.xlsx`
            result = await getData(dateFrom, dateTill)
            generateConsumtion(title, headersOne, headersTwo, headersThree, result, fileNames)
        }else if(data.option == 'Shift'){
            fileNames = `Fuel-Consumtion-with-shift-${formatedDatesNames(data.untilDate)}.xlsx`
            result = await getFCShift(dateFrom, dateTill)
            generateFCShift(title, headersOne, headersTwo, headersThree, result, fileNames)
        }else if(data.option == 'HMKM'){
            fileNames = `Fuel-Consumtion-with-hmkm-${formatedDatesNames(data.untilDate)}.xlsx`
            result = await getFCHmkm(dateFrom, dateTill)
            generateFChmkm(title, headersOne, headersTwo, headersThree, result, fileNames)
        }else if(data.option == 'KPC'){
            fileNames = `Summary-Receipt-Kpc-${formatedDatesNames(data.untilDate)}.xlsx`
            result = await getKPC(dateFrom, dateTill)
            const titles = ['FUEL RECEIPT FROM T108']
            const headers = ['Date', 'Shift', 'TransID', 'No BAA', 'UNIT NO', 'Operator', 
            'QTY BANLAW', 'Sonding Awal', 'Sonding Akhir', 'Total', 'VAR', 'Time In', 'Time Out',
            'OWNER', 'Unit Banlaw', 'PIN BANLAW'];
            generateByReceipt(titles, headers, result, fileNames)
        }else{
            fileNames = `FC-By-Owner-${formatedDatesNames(data.untilDate)}.xlsx`
            result = await getFCByOwner(dateFrom, dateTill)

            generateByOwner(result, fileNames)
        }

        return {
            status: HTTP_STATUS.OK,
            link: fileNames
        }
    }catch(error){
        logger.error(error)
        return {
            status: HTTP_STATUS.BAD_REQUEST,
            message: `${error}`,
        };
    }
}

const generateConsumtion = (title, headersOne, headersTwo, headersThree, rest, fileName) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Sheet1");

    sheet.mergeCells('A1:F3');

    ['A', 'B', 'C', 'D', 'E', 'F'].forEach((col, index) => {
        const widths = [15, 20, 20, 15, 15, 15];
        sheet.getColumn(col).width = widths[index];
    });

    const mergedCell = sheet.getCell('A1');
    mergedCell.value = title[0];
    mergedCell.alignment = {
        horizontal: 'left', 
        vertical: 'middle', 
    };
    mergedCell.font = {
        bold: true, 
        size: 11,   
    };
    mergedCell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
    };

    sheet.mergeCells('A4:F4')
    const mergeHeaderOne = sheet.getCell('A4')
    mergeHeaderOne.value = headersOne[0]
    mergeHeaderOne.alignment = {
        horizontal: 'left', 
        vertical: 'middle', 
    };
    mergeHeaderOne.font = {
        bold: true, 
        size: 11,
        color: {argb: 'ffffff'} 
    };
    mergeHeaderOne.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
    };
    mergeHeaderOne.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'ff0000' },
    }

    sheet.getCell('A5').value = headersTwo[0]; 
    sheet.getCell('B5').value = headersTwo[1]; 
    sheet.mergeCells('B5:C5'); 
    sheet.getCell('D5').value = headersTwo[2];
    sheet.getCell('E5').value = headersTwo[3]; 
    sheet.getCell('F5').value = headersTwo[4]; 
    
    ['A5', 'B5', 'D5', 'E5', 'F5'].forEach((cell, index) => {
        const headerCell = sheet.getCell(cell);
        headerCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '050580' }, 
        };
        headerCell.font = {
            color: { argb: 'FFFFFF' }, 
            bold: true,
            size: 8 
        };
        headerCell.alignment = {
            horizontal: 'center',
            vertical: 'middle'
        };
        headerCell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });
    
    const mergedCellB5 = sheet.getCell('B5');
    mergedCellB5.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '050580' }, 
    };
    mergedCellB5.font = {
        color: { argb: 'FFFFFF' }, 
        bold: true,
        size: 8
    };
    mergedCellB5.alignment = {
        horizontal: 'center',
        vertical: 'middle'
    };

    sheet.getCell('B6').value = headersThree[0];
    sheet.getCell('C6').value = headersThree[1];

    ['A6', 'B6', 'C6', 'D6', 'E6', 'F6'].forEach((cellAddress) => {
        const cell = sheet.getCell(cellAddress);
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '050580' }, 
        };
        cell.font = {
            bold: true,
            color: { argb: 'FFFFFF' }, 
            size: 8
        };
        cell.alignment = {
            horizontal: 'center',
            vertical: 'middle',
        };

        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });

    
    const uniqueDates = [...new Set(rest.dataConsumtion.map(item => item.dates))];
    uniqueDates.forEach((date, index) => {
        const cell = sheet.getCell(4, index + 7); 
        cell.value = date;
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '050580' }, 
        };
        cell.font = { 
            color: {argb : 'ffffff'},
            size: 11
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.width = 15;
    });

    uniqueDates.forEach((date, index) => {
        const columnLetter = String.fromCharCode(71 + index); 
        sheet.mergeCells(`${columnLetter}5:${columnLetter}6`);
        const mergedCell = sheet.getCell(`${columnLetter}5`);
        mergedCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFA500' } 
        };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
    });


    rest.dataUnit.forEach((item, rowIndex) => {
        const row = sheet.getRow(rowIndex + 7);
        row.getCell(1).value = item.desc ;
        row.getCell(2).value = item.unit_no;
        row.getCell(3).value = item.egi;
        row.getCell(4).value = item.owner;
        row.getCell(5).value = item.location;
        
        const totalQty = rest.dataConsumtion
        .filter(data => data.no_unit === item.unit_no)
        .reduce((sum, current) => sum + current.total_qty, 0);
    
        row.getCell(6).value = totalQty; 

        for (let i = 1; i <= 6; i++) {
            const cell = row.getCell(i);
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'fcfc8c' } 
            };
            cell.font = {
                bold: true,
                color: { argb: '050580' },
                size: 8
            };
            cell.alignment = { horizontal: 'left', vertical: 'middle' };
            if (i === 6) {
                cell.alignment = { horizontal: 'right', vertical: 'middle' };
            }
        }
    });
    
    rest.dataConsumtion.forEach((data) => {
        const dateIndex = uniqueDates.indexOf(data.dates) + 7; 
        const row = rest.dataUnit.findIndex(item => item.unit_no === data.no_unit) + 7; 
        if (row >= 7) { 
            const cell = sheet.getRow(row).getCell(dateIndex);
            cell.value = data.total_qty;
            cell.font = {
                size : 8
            }
            sheet.getColumn(dateIndex).width = 15;
        }
    });

    const lastRow = sheet.rowCount;
    const lastCol = sheet.columnCount;

    for (let i = 5; i <= lastRow; i++) {
        const row = sheet.getRow(i);
        for (let j = 1; j <= lastCol; j++) {
            const cell = row.getCell(j);
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        }
    }

    const createFile = async (outputPath) => {
        return await workbook.xlsx.writeFile(outputPath)
            .then((file) => {
                return true
            })
            .catch((error) => {
                console.error('Gagal menyimpan file Excel:', error);
            });
    }

    const outputPath = path.join(__dirname + '../../download', fileName);
    return new Promise(async (resolve, reject) => {
        try {
            const exists = fs.existsSync(outputPath)

            if (exists) {
                fs.unlink(outputPath, async (err) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {
                        const fileDownload = await createFile(outputPath);
                        if (fileDownload) {
                            resolve(fileName);
                        } else {
                            resolve(false);
                        }
                    }
                });
            } else {
                const fileDownload = await createFile(outputPath);
                if (fileDownload) {
                    resolve(fileName);
                } else {
                    resolve(false);
                }
            }
        } catch (err) {
            console.error(err);
            reject(err);
        }
    });
}

const generateFCShift = (title, headersOne, headersTwo, headersThree, rest, fileName) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Sheet1");

    sheet.mergeCells('A1:F3');

    ['A', 'B', 'C', 'D', 'E', 'F'].forEach((col, index) => {
        const widths = [15, 20, 20, 15, 15, 15];
        sheet.getColumn(col).width = widths[index];
    });

    const mergedCell = sheet.getCell('A1');
    mergedCell.value = title[0];
    mergedCell.alignment = {
        horizontal: 'left', 
        vertical: 'middle', 
    };
    mergedCell.font = {
        bold: true, 
        size: 11,   
    };
    mergedCell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
    };

    sheet.mergeCells('A4:F4')
    const mergeHeaderOne = sheet.getCell('A4')
    mergeHeaderOne.value = headersOne[0]
    mergeHeaderOne.alignment = {
        horizontal: 'left', 
        vertical: 'middle', 
    };
    mergeHeaderOne.font = {
        bold: true, 
        size: 11,
        color: {argb: 'ffffff'} 
    };
    mergeHeaderOne.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
    };
    mergeHeaderOne.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'ff0000' },
    }

    sheet.getCell('A5').value = headersTwo[0]; 
    sheet.getCell('B5').value = headersTwo[1]; 
    sheet.mergeCells('B5:C5'); 
    sheet.getCell('D5').value = headersTwo[2];
    sheet.getCell('E5').value = headersTwo[3]; 
    sheet.getCell('F5').value = headersTwo[4]; 
    
    ['A5', 'B5', 'D5', 'E5', 'F5'].forEach((cell, index) => {
        const headerCell = sheet.getCell(cell);
        headerCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '050580' }, 
        };
        headerCell.font = {
            color: { argb: 'FFFFFF' }, 
            bold: true,
            size: 8 
        };
        headerCell.alignment = {
            horizontal: 'center',
            vertical: 'middle'
        };
        headerCell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });
    
    const mergedCellB5 = sheet.getCell('B5');
    mergedCellB5.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '050580' }, 
    };
    mergedCellB5.font = {
        color: { argb: 'FFFFFF' }, 
        bold: true,
        size: 8
    };
    mergedCellB5.alignment = {
        horizontal: 'center',
        vertical: 'middle'
    };

    sheet.getCell('B6').value = headersThree[0];
    sheet.getCell('C6').value = headersThree[1];

    ['A6', 'B6', 'C6', 'D6', 'E6', 'F6'].forEach((cellAddress) => {
        const cell = sheet.getCell(cellAddress);
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '050580' }, 
        };
        cell.font = {
            bold: true,
            color: { argb: 'FFFFFF' }, 
            size: 8
        };
        cell.alignment = {
            horizontal: 'center',
            vertical: 'middle',
        };

        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });

    const uniqueDates = [...new Set(rest.dataConsumtion.map(item => item.dates))];

    function getExcelColumnName(index) {
        let columnName = "";
        while (index >= 0) {
            columnName = String.fromCharCode((index % 26) + 65) + columnName;
            index = Math.floor(index / 26) - 1;
        }
        return columnName;
    }
    
    uniqueDates.forEach((date, index) => {
        const startCol = getExcelColumnName(6 + index * 2); 
        const endCol = getExcelColumnName(7 + index * 2);  
    
        sheet.mergeCells(`${startCol}4:${endCol}4`);
        const mergedCell = sheet.getCell(`${startCol}4`);
        mergedCell.value = date;
        mergedCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '050580' }
        };
        mergedCell.font = {
            bold: true,
            color: { argb: 'ffffff' },
            size: 11
        };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
    
        sheet.mergeCells(`${startCol}5:${endCol}5`);
        const mergedCellFive = sheet.getCell(`${startCol}5`);
        mergedCellFive.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFA500' } 
        };
    
        const dayCell = sheet.getCell(`${startCol}6`);
        dayCell.value = 'D';
        dayCell.alignment = { horizontal: 'left', vertical: 'middle' };
        dayCell.font = {
            bold: true,
            size: 11,
            color: { argb: 'ffffff' }
        };
        dayCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '050580' } 
        };
    
        // Pengaturan untuk kolom Night ("N")
        const nightCell = sheet.getCell(`${endCol}6`);
        nightCell.value = 'N';
        nightCell.alignment = { horizontal: 'left', vertical: 'middle' };
        nightCell.font = {
            bold: true,
            size: 11,
            color: { argb: 'ffffff' }
        };
        nightCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '050580' } 
        };
    });
    
    rest.dataUnit.forEach((item, rowIndex) => {
        const row = sheet.getRow(rowIndex + 7);
        row.getCell(1).value = item.desc;
        row.getCell(2).value = item.unit_no;
        row.getCell(3).value = item.egi;
        row.getCell(4).value = item.owner;
        row.getCell(5).value = item.location;

        const totalQty = rest.dataConsumtion
            .filter(data => data.no_unit === item.unit_no)
            .reduce((sum, current) => sum + current.total_qty, 0);

        row.getCell(6).value = totalQty;

        for (let i = 1; i <= 6; i++) {
            const cell = row.getCell(i);
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'fcfc8c' } 
            };
            cell.font = {
                bold: true,
                color: { argb: '050580' },
                size: 8
            };
            cell.alignment = { horizontal: 'left', vertical: 'middle' };
            if (i === 6) {
                cell.alignment = { horizontal: 'right', vertical: 'middle' };
            }
        }
    });
    
    rest.dataConsumtion.forEach((data) => {
        const dateIndex = uniqueDates.indexOf(data.dates) * 2 + 7; 
        const row = rest.dataUnit.findIndex(item => item.unit_no === data.no_unit) + 7; 
    
        if (row >= 7) {
            const shiftOffset = data.shift === 'Day' ? 0 : 1; 
            const cell = sheet.getRow(row).getCell(dateIndex + shiftOffset);
    
            if (!cell.value) {
                cell.value = data.total_qty; 
            } else {
                cell.value += data.total_qty;
            }
    
            cell.font = {
                size: 8
            };
            sheet.getColumn(dateIndex).width = 8; 
            sheet.getColumn(dateIndex + 1).width = 8; 
        }
    });
    
    const lastRow = sheet.rowCount;
    const lastCol = sheet.columnCount;

    for (let i = 5; i <= lastRow; i++) {
        const row = sheet.getRow(i);
        for (let j = 1; j <= lastCol; j++) {
            const cell = row.getCell(j);
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        }
    }

    const createFile = async (outputPath) => {
        return await workbook.xlsx.writeFile(outputPath)
            .then((file) => {
                return true
            })
            .catch((error) => {
                console.error('Gagal menyimpan file Excel:', error);
            });
    }

    const outputPath = path.join(__dirname + '../../download', fileName);
    return new Promise(async (resolve, reject) => {
        try {
            const exists = fs.existsSync(outputPath)

            if (exists) {
                fs.unlink(outputPath, async (err) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {
                        const fileDownload = await createFile(outputPath);
                        if (fileDownload) {
                            resolve(fileName);
                        } else {
                            resolve(false);
                        }
                    }
                });
            } else {
                const fileDownload = await createFile(outputPath);
                if (fileDownload) {
                    resolve(fileName);
                } else {
                    resolve(false);
                }
            }
        } catch (err) {
            console.error(err);
            reject(err);
        }
    });
}

const generateFChmkm = (title, headersOne, headersTwo, headersThree, rest, fileName) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Sheet1");

    sheet.mergeCells('A1:F3');

    ['A', 'B', 'C', 'D', 'E', 'F'].forEach((col, index) => {
        const widths = [15, 20, 20, 15, 15, 15];
        sheet.getColumn(col).width = widths[index];
    });

    const mergedCell = sheet.getCell('A1');
    mergedCell.value = title[0];
    mergedCell.alignment = {
        horizontal: 'left', 
        vertical: 'middle', 
    };
    mergedCell.font = {
        bold: true, 
        size: 11,   
    };
    mergedCell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
    };

    sheet.mergeCells('A4:F4')
    const mergeHeaderOne = sheet.getCell('A4')
    mergeHeaderOne.value = headersOne[0]
    mergeHeaderOne.alignment = {
        horizontal: 'left', 
        vertical: 'middle', 
    };
    mergeHeaderOne.font = {
        bold: true, 
        size: 11,
        color: {argb: 'ffffff'} 
    };
    mergeHeaderOne.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
    };
    mergeHeaderOne.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'ff0000' },
    }

    sheet.getCell('A5').value = headersTwo[0]; 
    sheet.getCell('B5').value = headersTwo[1]; 
    sheet.mergeCells('B5:C5'); 
    sheet.getCell('D5').value = headersTwo[2];
    sheet.getCell('E5').value = headersTwo[3]; 
    sheet.getCell('F5').value = headersTwo[4]; 
    
    ['A5', 'B5', 'D5', 'E5', 'F5'].forEach((cell, index) => {
        const headerCell = sheet.getCell(cell);
        headerCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '050580' }, 
        };
        headerCell.font = {
            color: { argb: 'FFFFFF' }, 
            bold: true,
            size: 8 
        };
        headerCell.alignment = {
            horizontal: 'center',
            vertical: 'middle'
        };
        headerCell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });
    
    const mergedCellB5 = sheet.getCell('B5');
    mergedCellB5.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '050580' }, 
    };
    mergedCellB5.font = {
        color: { argb: 'FFFFFF' }, 
        bold: true,
        size: 8
    };
    mergedCellB5.alignment = {
        horizontal: 'center',
        vertical: 'middle'
    };

    sheet.getCell('B6').value = headersThree[0];
    sheet.getCell('C6').value = headersThree[1];

    ['A6', 'B6', 'C6', 'D6', 'E6', 'F6'].forEach((cellAddress) => {
        const cell = sheet.getCell(cellAddress);
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '050580' }, 
        };
        cell.font = {
            bold: true,
            color: { argb: 'FFFFFF' }, 
            size: 8
        };
        cell.alignment = {
            horizontal: 'center',
            vertical: 'middle',
        };

        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });

    const uniqueDates = [...new Set(rest.dataConsumtion.map(item => item.dates))];

    function getExcelColumnName(index) {
        let columnName = "";
        while (index >= 0) {
            columnName = String.fromCharCode((index % 26) + 65) + columnName;
            index = Math.floor(index / 26) - 1;
        }
        return columnName;
    }

    uniqueDates.forEach((date, index) => {
        const startCol = getExcelColumnName(6 + index * 4);
        const endCol = getExcelColumnName(9 + index * 4); 
        sheet.mergeCells(`${startCol}4:${endCol}4`);
        const cell = sheet.getCell(`${startCol}4`);
        cell.value = date;
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '050580' }
        };
        cell.font = { 
            bold: true,
            color: { argb: 'ffffff' },
            size: 11
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };

        sheet.mergeCells(`${startCol}5:${getExcelColumnName(7 + index * 4 )}5`); 
        
        const dayShiftCell = sheet.getCell(`${startCol}5`);
        dayShiftCell.value = 'D';
        dayShiftCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'f3e38b' }
        };
        dayShiftCell.font = {
            size: 11
        };
        dayShiftCell.alignment = { horizontal: 'left', vertical: 'middle' };

        sheet.mergeCells(`${getExcelColumnName(8 + index * 4 )}5:${getExcelColumnName(9 + index * 4 )}5`); 
        const nightShiftCell = sheet.getCell(`${getExcelColumnName(9 + index * 4 )}5`);
        nightShiftCell.value = 'N';
        nightShiftCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'c3c3c3' }
        };
        nightShiftCell.font = {
            size: 11
        };
        nightShiftCell.alignment = { horizontal: 'left', vertical: 'middle' };
    });

    const totalColumns = Math.max(uniqueDates.length * 2); 
    for (let colIndex = 6; colIndex < 6 + totalColumns * 2 ; colIndex += 2) {
        const qtyCol = getExcelColumnName(colIndex);
        const hmCol = getExcelColumnName(colIndex + 1);

        const qtyCell = sheet.getCell(`${qtyCol}6`);
        qtyCell.value = 'Qty';
        qtyCell.alignment = { horizontal: 'center', vertical: 'middle' };
        qtyCell.font = { size: 11, color: { argb: 'ffffff' } };
        qtyCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '050580' } };

        const hmCell = sheet.getCell(`${hmCol}6`);
        hmCell.value = 'HM';
        hmCell.alignment = { horizontal: 'center', vertical: 'middle' };
        hmCell.font = { size: 11, color: { argb: 'ffffff' } };
        hmCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '050580' } };

    }

    rest.dataUnit.forEach((item, rowIndex) => {
        const row = sheet.getRow(rowIndex + 7);
        row.getCell(1).value = item.desc;
        row.getCell(2).value = item.unit_no;
        row.getCell(3).value = item.egi;
        row.getCell(4).value = item.owner;
        row.getCell(5).value = item.location;

        const totalQty = rest.dataConsumtion
            .filter(data => data.no_unit === item.unit_no)
            .reduce((sum, current) => sum + current.total_qty, 0);

        row.getCell(6).value = totalQty;

        for (let i = 1; i <= 6; i++) {
            const cell = row.getCell(i);
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'fcfc8c' }
            };
            cell.font = {
                bold: true,
                color: { argb: '050580' },
                size: 8
            };
            cell.alignment = { horizontal: 'left', vertical: 'middle' };
            if (i === 6) {
                cell.alignment = { horizontal: 'right', vertical: 'middle' };
            }
        }
    });

    rest.dataUnit.forEach((unit, rowIndex) => {
        const row = rowIndex + 7; 
        uniqueDates.forEach((date, dateIndex) => {
            const baseColIndex = dateIndex * 4 + 7; 

            // Mengisi nilai default 0 untuk setiap shift (Day dan Night)
            for (let shiftOffset = 0; shiftOffset < 4; shiftOffset += 2) {
                const qtyCell = sheet.getRow(row).getCell(baseColIndex + shiftOffset); // Kolom Qty
                const hmCell = sheet.getRow(row).getCell(baseColIndex + shiftOffset + 1); // Kolom HM

                // Set nilai default 0
                qtyCell.value = 0;
                hmCell.value = 0;

                [qtyCell, hmCell].forEach(cell => {
                    cell.font = { size: 8 };
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFFFF' }
                    };
                });

                // Mengatur lebar kolom
                sheet.getColumn(baseColIndex + shiftOffset).width = 8;
                sheet.getColumn(baseColIndex + shiftOffset + 1).width = 8;
            }
        });
    });

    
    rest.dataConsumtion.forEach((data) => {
        const dateIndex = uniqueDates.indexOf(data.dates) * 4 + 7; 
        const row = rest.dataUnit.findIndex(item => item.unit_no === data.no_unit) + 7; 

        if (row >= 7) {
            const shiftOffset = data.shift === 'Day' ? 0 : 2; 
            const qtyCell = sheet.getRow(row).getCell(dateIndex + shiftOffset); 
            const hmCell = sheet.getRow(row).getCell(dateIndex + shiftOffset + 1); 

            // Mengatur nilai Qty dan HM berdasarkan data yang ada
            qtyCell.value = data.total_qty || 0;
            hmCell.value = data.hmkm || 0;

            // Menambahkan style untuk Qty dan HM
            [qtyCell, hmCell].forEach(cell => {
                cell.font = { size: 8 };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFFFF' }
                };
            });

            // Mengatur lebar kolom
            sheet.getColumn(dateIndex).width = 8;
            sheet.getColumn(dateIndex + 1).width = 8;
            sheet.getColumn(dateIndex + 2).width = 8;
            sheet.getColumn(dateIndex + 3).width = 8;
        }
    });



    const lastRow = sheet.rowCount;
    const lastCol = sheet.columnCount;

    for (let i = 5; i <= lastRow; i++) {
        const row = sheet.getRow(i);
        for (let j = 1; j <= lastCol; j++) {
            const cell = row.getCell(j);
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        }
    }

    const createFile = async (outputPath) => {
        return await workbook.xlsx.writeFile(outputPath)
            .then((file) => {
                return true
            })
            .catch((error) => {
                console.error('Gagal menyimpan file Excel:', error);
            });
    }

    const outputPath = path.join(__dirname + '../../download', fileName);
    return new Promise(async (resolve, reject) => {
        try {
            const exists = fs.existsSync(outputPath)

            if (exists) {
                fs.unlink(outputPath, async (err) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {
                        const fileDownload = await createFile(outputPath);
                        if (fileDownload) {
                            resolve(fileName);
                        } else {
                            resolve(false);
                        }
                    }
                });
            } else {
                const fileDownload = await createFile(outputPath);
                if (fileDownload) {
                    resolve(fileName);
                } else {
                    resolve(false);
                }
            }
        } catch (err) {
            console.error(err);
            reject(err);
        }
    });
}

const generateByReceipt = (title, header, data, fileName) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Sheet1");
    const startRow = 4;
    const headerRow = sheet.insertRow(startRow, ['', ...header]); 
    sheet.mergeCells('A1:F3');

    ['A', 'B', 'C', 'D', 'E', 'F'].forEach((col, index) => {
        const widths = [15, 20, 20, 15, 15, 15];
        sheet.getColumn(col).width = widths[index];
    });

    const mergedCell = sheet.getCell('A1');
    mergedCell.value = title[0];
    mergedCell.alignment = {
        horizontal: 'left', 
        vertical: 'middle', 
    };
    mergedCell.font = {
        bold: true, 
        size: 11,   
    };
    mergedCell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
    };

    headerRow.eachCell((cell, colNumber) => {
        if(colNumber > 1) {
            cell.alignment = {
                horizontal: 'center',
                vertical: 'middle',
            };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'b4dbeb' } 
            };
            cell.font = {
                bold : true,
                size: 8
            },
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        }
    });

    headerRow.height = 15;

    data.forEach((row, rowIndex) => {
        const rowData = Object.values(row);
        const excelRow = sheet.addRow(['', ...rowData]); 
    
        rowData.forEach((cell, colIndex) => {
            const currentCell = excelRow.getCell(colIndex + 2);
            const column = sheet.getColumn(colIndex + 1);
            const cellTextLength = cell ? cell.toString().length : 10; 
            const currentWidth = column.width || 10; 
            const desiredWidth = Math.max(cellTextLength + 5, currentWidth); 
            column.width = desiredWidth;
    
            currentCell.alignment = { vertical: 'middle', horizontal: 'center' };
            currentCell.font = { size: 8, bold: true };
    
            
            if (colIndex === 9 || colIndex === 10 ) {
                currentCell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'ebf3db' }
                };
            }

            if(colIndex === rowData.length - 2 || colIndex === rowData.length - 1){
                currentCell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'b4dbeb' }
                };
            }
    
            currentCell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });
    });

    const createFile = async (outputPath) => {
        return await workbook.xlsx.writeFile(outputPath)
            .then((file) => {
                return true
            })
            .catch((error) => {
                console.error('Gagal menyimpan file Excel:', error);
            });
    }

    const outputPath = path.join(__dirname + '../../download', fileName);
    return new Promise(async (resolve, reject) => {
        try {
            const exists = fs.existsSync(outputPath)

            if (exists) {
                fs.unlink(outputPath, async (err) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {
                        const fileDownload = await createFile(outputPath);
                        if (fileDownload) {
                            resolve(fileName);
                        } else {
                            resolve(false);
                        }
                    }
                });
            } else {
                const fileDownload = await createFile(outputPath);
                if (fileDownload) {
                    resolve(fileName);
                } else {
                    resolve(false);
                }
            }
        } catch (err) {
            console.error(err);
            reject(err);
        }
    });
}

const renderTable = (title, data, totalQty, sheet, startRow) => {
    const groupedData = {};
    data.forEach(({ tanggal, owners, qty }) => {
        if (!groupedData[owners]) {
            groupedData[owners] = {};
        }
        if (!groupedData[owners][tanggal]) {
            groupedData[owners][tanggal] = 0;
        }
        groupedData[owners][tanggal] += qty;
    });
    const sortedOwners = Object.keys(groupedData).sort((a, b) => b.localeCompare(a));

    let headerRow;
     const uniqueDates = [...new Set(data.map(item => item.tanggal))].sort((a, b) => new Date(a) - new Date(b));
    if(title == 'Owner'){
        headerRow = sheet.insertRow(startRow, ['', title, ...uniqueDates, 'Summary', 'Average']); 
    }else{
        // console.log(uniqueDates)
        const headerRowValues = ['', title, ...Array(uniqueDates.length).fill(''), '', ''];
        headerRow = sheet.insertRow(startRow, headerRowValues);
        sheet.mergeCells(headerRow.number, 3, headerRow.number, uniqueDates.length + 1);
    }
    headerRow.eachCell((cell, colNumber) => {
        if(colNumber > 1) {
            cell.alignment = {
                horizontal: 'center',
                vertical: 'middle',
            };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'b4dbeb' } 
            };
            cell.font = {
                bold : true,
                size: 10
            },
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        }
    });

    
    const totals = new Array(uniqueDates.length).fill(0);
    let totalAvg = [];

    // Menambahkan data ke sheet tanpa looping owner yang sama
    let summary, average
    sortedOwners.forEach((ownerName) => {
        const rowData = ['', ownerName]; 

        // Menambahkan data qty berdasarkan tanggal
        uniqueDates.forEach((date, index) => {
            const qty = groupedData[ownerName][date] || '-';
            rowData.push(qty);

            // Jika qty adalah angka, tambahkan ke total untuk kolom tersebut
            if (qty !== '-') {
                totals[index] += qty;
            }
        });

        // Menghitung Summary dan Average
        const quantities = rowData.slice(2).filter(val => val !== '-').map(Number); 
        summary = quantities.reduce((acc, val) => acc + val, 0);
        average = summary / totalQty * 100
        totalAvg.push(parseFloat(average.toFixed(2)))
       
        // Menambahkan Summary dan Average ke rowData
        rowData.push(summary);
        rowData.push(average.toFixed(2) + '%');

        // Tambahkan row ke sheet satu kali
        const excelRow = sheet.addRow(rowData);

        // Format lebar kolom dan gaya cell
        rowData.forEach((cell, colIndex) => {
            const currentCell = excelRow.getCell(colIndex + 1);
            const column = sheet.getColumn(colIndex + 1);
            const cellTextLength = cell ? cell.toString().length : 10;
            const currentWidth = column.width || 10;
            const desiredWidth = Math.max(cellTextLength + 5, currentWidth);
            column.width = desiredWidth;

            currentCell.alignment = { vertical: 'middle', horizontal: 'right' };
            currentCell.font = { size: 10 };
            
            if(colIndex == 1){
                currentCell.alignment = { vertical: 'middle', horizontal: 'left' };
                currentCell.font = { size: 10 };
            }

            // Menambahkan border
            if(colIndex >= 1){
                currentCell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            }
            
        });
    });

    const totalRow = ['', 'Total'];

    totals.forEach((total) => {
        totalRow.push(total);
    });

    const grandTotal = totals.reduce((acc, val) => acc + val, 0);
    const averageTotal = grandTotal / totalQty * 100

    totalRow.push(grandTotal);
    totalRow.push(parseFloat(averageTotal.toFixed(2)) + '%');

    // Tambahkan baris Total ke sheet
    const totalExcelRow = sheet.addRow(totalRow);

    totalRow.forEach((cell, colIndex) => {
        const currentCell = totalExcelRow.getCell(colIndex + 1);
        if(colIndex > 1) { 
            currentCell.alignment = { vertical: 'middle', horizontal: 'right' };
        }else{
            currentCell.alignment = { vertical: 'middle', horizontal: 'left' }
        }
        
        currentCell.font = { size: 10, bold: true };

        if(colIndex >= 1){
            currentCell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        } 
    });

    const rows = startRow + sortedOwners.length + 3

    return {totalRow: rows}
}

const generateByOwner = ( data, fileName) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Sheet1");
    const startRow = 2;

    const totalOwner = data.owner.reduce((accumulator, current) => accumulator + current.qty, 0);
    const totalBackcharge = data.backcharge.reduce((accumulator, current) => accumulator + current.qty, 0);
    const totalKpc = data.kpc.reduce((accumulator, current) => accumulator + current.qty, 0);
    const jumlah = totalOwner + totalBackcharge + totalKpc 

    let title = 'Owner'
    const tableOwner = renderTable(title, data.owner, jumlah,  sheet, startRow);
    
    
    title = 'Backcharge'
    const tableBack = renderTable(title, data.backcharge, jumlah, sheet, tableOwner.totalRow)

    title = 'KPC'
    renderTable(title, data.kpc, jumlah, sheet, tableBack.totalRow)

    const createFile = async (outputPath) => {
        return await workbook.xlsx.writeFile(outputPath)
            .then((file) => {
                return true
            })
            .catch((error) => {
                console.error('Gagal menyimpan file Excel:', error);
            });
    }

    const outputPath = path.join(__dirname + '../../download', fileName);
    return new Promise(async (resolve, reject) => {
        try {
            const exists = fs.existsSync(outputPath)

            if (exists) {
                fs.unlink(outputPath, async (err) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {
                        const fileDownload = await createFile(outputPath);
                        if (fileDownload) {
                            resolve(fileName);
                        } else {
                            resolve(false);
                        }
                    }
                });
            } else {
                const fileDownload = await createFile(outputPath);
                if (fileDownload) {
                    resolve(fileName);
                } else {
                    resolve(false);
                }
            }
        } catch (err) {
            console.error(err);
            reject(err);
        }
    });
}

const sentMail = async() => {
    try{
        const today = new Date();
        today.setDate(today.getDate() - 1); 

        const yesterday = today.toLocaleDateString('en-CA', { timeZone: 'Asia/Makassar' });
        const fileName = `Fuel-Consumption-${formatedDatesNames(yesterday)}.xlsx`
        const filePath = path.join(__dirname, '../../download/', fileName);
        if (!fs.existsSync(filePath)) {
            console.log(`File ${fileName} tidak ditemukan, membuat file baru...`);
            const data = {
                untilDate: yesterday,
                option: "Consumtion"
            }
            await DailyConsumtion(data); 
        }
        const result = await bodyMail(yesterday)
        if(result){
            return {
                status: HTTP_STATUS.OK,
                message: "Success"
            }
        }else{
            return {
                status: HTTP_STATUS.BAD_REQUEST,
                message: `Failed send Email!`,
            };
        }
    }catch(error){
        logger.error(error)
        return {
            status: HTTP_STATUS.BAD_REQUEST,
            message: `${error}`,
        };
    }
}

module.exports = {
    downloadReportLkf,
    downloadHomeStation,
    downloadLkfDetailedLkf,
    downloadLkfElipse,
    DailyConsumtion,
    sentMail
}

