const redisClient = require('../helpers/redisHelper');
const { getDataRedis } = require('../helpers/redisTransaction');

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
        .writeHeader('Access-Control-Allow-Headers', 'origin, content-type, accept, x-requested-with, authorization, lang, domain-key')
        .writeHeader('Access-Control-Max-Age', '2592000')
        .writeHeader('Vary', 'Origin');
}

module.exports = {
    handleResponseJsonAdmin,
    handleResponseJsonOperator,
    handleResponseParams,
}