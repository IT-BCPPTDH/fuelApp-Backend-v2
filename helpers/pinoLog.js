const pino = require('pino');
const path = require('path');
const fs = require('fs');
const rfs = require('rotating-file-stream');
const { formatYYYYMMDD } = require('./dateHelper');

const date = formatYYYYMMDD(new Date)
// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Configure Rotating File Stream
const logStream = rfs.createStream(`${date}.log`, {
    interval: '1d', // Rotate daily
    path: logsDir,
    maxFiles: 30, // Keep 30 days of logs
    compress: 'gzip' // Optional: Compress old logs
});

// Create a Pino logger with the rotating file stream
const logger = pino(logStream);

module.exports = logger;