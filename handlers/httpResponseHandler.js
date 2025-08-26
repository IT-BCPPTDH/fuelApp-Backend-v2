const redisClient = require('../helpers/redisHelper');
const { getDataRedis } = require('../helpers/redisTransaction');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const client = require('../helpers/redisHelper');

async function handleResponseJsonAdmin(res, req, action, token) {
    setCorsHeaders(res);
    let keyToken = req.getHeader('x-request-secure')
    
    readJson(res, async (requestData) => {
        const userData = await getDataRedis(keyToken)
        
        if(userData){
            const result = await action(requestData,userData);
            res.cork(() => {
                res
                    .writeStatus(result.status)
                    .writeHeader('content-type', 'application/json')
                    .end(JSON.stringify(result));
            });
        }else{
            res.cork(() => {
                res
                    .writeStatus("401")
                    .writeHeader('content-type', 'application/json')
                    .end(JSON.stringify({ 
                        status: 401,
                        error: 'Unauthorized Token!' 
                    }));
            });
        }
    }, () => {
        res.cork(() => {
            res
                .writeStatus("500")
                .writeHeader('content-type', 'application/json')
                .end(JSON.stringify({ error: 'Invalid JSON or no data at all!' }));
        });
    });
}

async function handleResponseJsonOperator(res, req, action, token) {
    setCorsHeaders(res);
    readJson(res, async (requestData) => {
        const result = await action(requestData);
        res.cork(() => {
            res
                .writeStatus(String(result.status))
                .writeHeader('content-type', 'application/json')
                .end(JSON.stringify(result));
        });
    }, () => {
        res.cork(() => {
            res
                .writeStatus("500")
                .writeHeader('content-type', 'application/json')
                .end(JSON.stringify({ error: 'Invalid JSON or no data at all!' }));
        });
    });
}

async function handleResponseParams(res, req, action, qtyParams) {
    setCorsHeaders(res)

    let result = {}

    res.onAborted(() => {
        res.aborted = true;
    });

    if (qtyParams === 1) {
        result = await action(req.getParameter(0))
    } else if (qtyParams === 2) {
        result = await action(req.getParameter(0), req.getParameter(1))
    } else {
        result = await action()
    }

    if (!res.aborted) {
        res.cork(() => {
            res
                .writeStatus(result.status)
                .writeHeader('content-type', 'application/json')
                .end(JSON.stringify(result));
        });
    }
}

function readJson(res, cb, err) {
    let buffer;
    res.onData((ab, isLast) => {
        let chunk = Buffer.from(ab);

        if (isLast) {
            try {
                let json = buffer ? JSON.parse(Buffer.concat([buffer, chunk])) : JSON.parse(chunk);
                cb(json);
            } catch (e) {
                handleInvalidJson(res);
            }
        } else {
            buffer = buffer ? Buffer.concat([buffer, chunk]) : Buffer.concat([chunk]);
        }
    });

    res.onAborted(err);
}

function handleInvalidJson(res) {
    res.end(JSON.stringify({ error: 'Invalid JSON' }));
}

// async function checkCustomHeaders(req, res) {
//     const accessUserHeader = req.getHeader('access-user');
//     const wwwAuthHeader = req.getHeader('www-authenticate');

//     if (!accessUserHeader && !wwwAuthHeader) {
//         res.cork(() => {
//             res.end(JSON.stringify({ error: 'Forbidden Access' }));
//         });
//     }

//     // You can add more header validation logic if needed
//     // For example, validating values against the database

//     // Fetch expected values from the database (replace with your actual query)
//     const expectedAccessUser = await fetchExpectedValueFromDB('access-user');
//     const expectedWwwAuth = await fetchExpectedValueFromDB('www-authenticate');

//     // Compare values from headers with values from the database
//     if (accessUserHeader !== expectedAccessUser && wwwAuthHeader !== expectedWwwAuth) {
//         // Invalid custom header values, throw an error
//         res.cork(() => {
//             res.end(JSON.stringify({ error: 'Cannot access, validation failed' }));
//         });
//     }

//     // If headers are validated, return true
//     return true;
// }

function setCorsHeaders(res) {
    res.writeHeader('Access-Control-Allow-Origin', '*')
        .writeHeader('Access-Control-Allow-Credentials', 'true')
        .writeHeader('Access-Control-Allow-Headers', 'origin, content-type, accept, x-requested-with, authorization, lang, domain-key, custom_token')
        .writeHeader('Access-Control-Max-Age', '2592000')
        .writeHeader('Vary', 'Origin');
}

function generateCustomFilename(filename) {
  const timestamp = Date.now(); // Mendapatkan timestamp saat ini
  const extension = filename.split('.').pop(); // Mendapatkan ekstensi file
  const baseName = filename.replace(/\.[^/.]+$/, ""); // Menghilangkan ekstensi asli untuk menambahkan timestamp

  // Menggabungkan nama file dengan timestamp dan ekstensi
  return `${baseName}-${timestamp}.${extension}`;
} 

const allowedFileTypes = ['jpeg', 'jpg', 'png', 'webp', 'xlsx'];

function sendJsonResponse(res, result) {
  console.log(result)
  res.cork(() => {
    res
      .writeStatus(String(result.status || 200))
      .writeHeader('content-type', 'application/json')
      .end(JSON.stringify(result));
  });
}

function sanitizeFilename(filename) {
  return filename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
}

async function handleUploadFile(res, req, action, token = false) {
  setCorsHeaders(res);
  const contentType = req.getHeader('content-type');
  const boundary = contentType.split('; ')[1]?.replace('boundary=', '');
  let session_token = req.getHeader('custom_token')

  let buffer = Buffer.alloc(0);
  res.onData((chunk, isLast) => {
    buffer = Buffer.concat([buffer, Buffer.from(chunk)]);
    if (isLast) {
      const parts = parseMultipartData(buffer, boundary);

      res.cork(async () => {
        const uploadDir = path.join(__dirname, process.env.UPLOAD_PATH);
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const existingFiles = fs.readdirSync(uploadDir).map((file) => {
          return file.replace(/-\d{13,}\.\w+$/, '').replace(/\.\w+$/, '');
        });

        let uploadedFiles = [];

        let jsonData = [];
        let headerData = []
        for (const part of parts) {
          const sanitizedFilename = sanitizeFilename(part.filename);
          const fileExtension = sanitizedFilename.split('.').pop().toLowerCase();

          if (!allowedFileTypes.includes(fileExtension)) {
            console.error(`File type not allowed: ${fileExtension}`);
            sendJsonResponse(res, { error: `File type ${fileExtension} not allowed.` }, 400);
            return;
          }

          const customFilename = generateCustomFilename(sanitizedFilename);
          const baseNameWithoutTimestamp = sanitizedFilename.replace(/-\d{13,}\.\w+$/, '').replace(/\.\w+$/, '');

          if (existingFiles.includes(baseNameWithoutTimestamp)) {
            console.log(`File already exists: ${baseNameWithoutTimestamp}. Skipping file save.`);
            uploadedFiles.push(`${baseNameWithoutTimestamp}.${fileExtension}`);
            continue;
          }

          const filePath = path.join(uploadDir, customFilename);
          
          try {
            if (fileExtension === 'xlsx') {
              try {
                
                const workbook = new ExcelJS.Workbook();
                await workbook.xlsx.load(part.data); 
                const sheet = workbook.getWorksheet(1); 

                // Extract values from specific cells (B1 and G1)
                const cellValueB1 = sheet.getCell('B1').value;
                const cellValueG1 = sheet.getCell('G2').value;

                const expectedRow4 = [
                  "Unit", "HM/KM", "Qty", "Driver", "IN", "OUT", 
                  "Awal", "Akhir", "Shift", "Type"
                ];

                const row4 = sheet.getRow(4).values.slice(1, 11);
                if (!row4.every((cell, index) => cell === expectedRow4[index])) {
                  throw new Error("File yang diunggah tidak sesuai dengan template.");
                }

                sheet.eachRow((row, rowNumber) => {
                  if (rowNumber >= 5) {
                    const rowData = row.values.slice(1, 11);
                    const hasData = rowData.some(cell => cell !== undefined && cell !== null);
                    if (hasData) {
                      jsonData.push(rowData);
                    }
                  }
                });
              
                headerData.push([cellValueB1, cellValueG1]);
                uploadedFiles.push(customFilename);
              
              } catch (error) {
                sendJsonResponse(res, {status: "500", error:error.message });
                return;
              }
            } else if (['jpeg', 'jpg', 'png', 'webp'].includes(fileExtension)) {
              const savedFilename = await optimizeAndSaveImage(part.data, sanitizedFilename, uploadDir);
              console.log(`Optimized image saved as: ${savedFilename}`);
              uploadedFiles.push(savedFilename);
            } else {
              fs.writeFileSync(filePath, part.data);
              uploadedFiles.push(customFilename);
            }
          } catch (error) {
            console.error('Error saving file:', error);
            sendJsonResponse(res, { error: 'Error saving file.' }, 500);
            return;
          }
        }
        const data = await client.get(session_token);
        const result = await action(headerData, jsonData, data);
        sendJsonResponse(res, result);
      });
    }
  });

  res.onAborted(() => {
    console.log('Request aborted');
  });
}

function parseMultipartData(buffer, boundary) {
  let parts = [];
  let boundaryBuffer = Buffer.from(`--${boundary}`, 'utf-8');
  let offset = buffer.indexOf(boundaryBuffer) + boundaryBuffer.length;

  while (offset < buffer.length) {
    let nextOffset = buffer.indexOf(boundaryBuffer, offset);
    if (nextOffset === -1) break;

    let partBuffer = buffer.slice(offset, nextOffset);
    if (partBuffer.length === 0) break;

    let headerEndIndex = partBuffer.indexOf('\r\n\r\n');
    if (headerEndIndex === -1) break;

    let headerBuffer = partBuffer.slice(0, headerEndIndex).toString();
    let contentBuffer = partBuffer.slice(headerEndIndex + 4); 

    let headers = headerBuffer.split('\r\n').reduce((acc, line) => {
      let [key, value] = line.split(': ');
      acc[key.toLowerCase()] = value;
      return acc;
    }, {});

    let match = headers['content-disposition']?.match(/name="([^"]+)"; filename="([^"]+)"/);
    if (match) {
      parts.push({
        name: match[1],
        filename: match[2],
        data: contentBuffer.slice(0, contentBuffer.length - 2),
      });
    }

    offset = nextOffset + boundaryBuffer.length + 2;
  }

  return parts;
}

module.exports = {
    handleResponseJsonAdmin,
    handleResponseJsonOperator,
    handleResponseParams,
    handleUploadFile
}