//import { createClient } from 'redis';
const { createClient } = require('redis');
const client = createClient({
  socket: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6378,
  },
});

client.on('error', (err) => console.error('❌ Redis connection error:', err));

(async () => {
  try {
    await client.connect();
    const pong = await client.ping();
    console.log('✅ Redis connected! Response:', pong);
    await client.disconnect();
  } catch (err) {
    console.error('❌ Redis connection failed:', err);
  }
})();
