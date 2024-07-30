const redisClient = require('./redisHelper');

const getDataRedis = async (token) => {
    try {
      const data = await redisClient.get(token);
      if (data) {
        return JSON.parse(data);
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error getting data from Redis:', error);
      return false;
    }
  };

  module.exports = {
    getDataRedis
  }