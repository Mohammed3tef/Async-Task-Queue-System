require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    maxRetries: process.env.MAX_RETRIES || 3,
    workerInterval: process.env.WORKER_INTERVAL || 1000 // milliseconds
};
