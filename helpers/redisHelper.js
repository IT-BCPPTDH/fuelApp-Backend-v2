const { createClient } = require('redis');

let client = createClient({
    url:`redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
})

client.on('error', (err) => {
    console.error('Redis Client Error', err);
}).connect()



module.exports = client