const uWS = require('uWebSockets.js');
const { insertDataHauling } = require('../controller/coal-hauling-controller')
const { insertDataBreakdown } = require('../controller/breakdown-controller')
const { insertDataProduction, insertDataDelay, insertDataDistance } = require('../controller/production-controller')
const { insertDataTimeEntry } = require('../controller/time-entry-pg-controller')

let chunkDataHauling = [] 
let chunkDataProduction = []
let chunkDataTimeEntry = []
let chunkDataBreakdown = []
let wsInstance;

const getWsInstance = () => {
  return wsInstance;
};


/**
 * Asynchronous WebSocket Message Handler
 *
 * This function processes incoming WebSocket messages by decoding and parsing them, and then handling 
 * them according to their event type. The function supports multiple event types, each corresponding 
 * to a specific data insertion process.
 *
 * @param {WebSocket} socket - The WebSocket connection instance through which the message was received.
 * @param {ArrayBuffer} message - The incoming message, which is received as an ArrayBuffer.
 *
 * Workflow:
 * 1. Decoding and Parsing:
 *    - Converts the incoming message from `ArrayBuffer` to `Uint8Array`.
 *    - Decodes the `Uint8Array` into a JSON string.
 *    - Parses the JSON string into a JavaScript object (`jsonObject`).
 *
 * 2. Event Handling:
 *    - Depending on the `jsonObject.event` value, it routes to the corresponding case:
 *      - 'data-hauling-mha': Collects chunks of data for 'data-hauling-mha' and inserts them into the database when all chunks are received.
 *      - 'insert-data-breakdown': Collects chunks of data for 'insert-data-breakdown' and inserts them into the database when all chunks are received.
 *      - 'insert-data-production': Collects chunks of data for 'insert-data-production', separates them into three parts, and inserts them into their respective databases when all chunks are received.
 *      - 'insert-data-time-entry': Collects chunks of data for 'insert-data-time-entry' and inserts them into the database when all chunks are received.
 *
 * 3. Data Chunk Handling:
 *    - For each event type, data chunks are accumulated until the last chunk is received.
 *    - When the last chunk is identified (`jsonObject.lastChunk` is `true`), the function concatenates and processes the complete data.
 *    - The complete data is then inserted into the corresponding database table using the appropriate insertion function.
 *
 * 4. Sending Progress Updates:
 *    - After receiving each chunk, the function sends a progress update to the client through the WebSocket connection.
 *
 * 5. Resetting State:
 *    - After all data chunks are processed and inserted, the corresponding chunk storage array is cleared for future use.
 */


const handleMessage = async (socket, message) => {
  const uint8Array = new Uint8Array(message);
  const jsonString = new TextDecoder().decode(uint8Array);
  const jsonObject = JSON.parse(jsonString);

  switch (jsonObject.event) {
    // case 'data-hauling-mha':

    //   chunkDataHauling.push(jsonObject.data)
    //   socket.send(JSON.stringify({ event: 'savingProgress', message: chunkDataHauling.length }));
    //   const isLastChunkHauling = jsonObject.lastChunk === true;

    //   if (isLastChunkHauling) {
    //     const completeData = [].concat(...chunkDataHauling);
    //     const dataToInsert = completeData.flatMap(chunk => chunk);
    //     await insertDataHauling(dataToInsert, socket);

    //     chunkDataHauling = [];
    //   }
    //   break;

    // case 'insert-data-breakdown':
    //   chunkDataBreakdown.push(jsonObject.data)
    //   socket.send(JSON.stringify({ event: 'savingProgressBreakdown', message: chunkDataBreakdown.length }));
    //   const isLastChunkBreakdown = jsonObject.lastChunk === true;

    //   if (isLastChunkBreakdown) {
    //     const completeData = [].concat(...chunkDataBreakdown);
    //     const dataToInsert = completeData.flatMap(chunk => chunk);

    //     //Todo: Create controller
    //     await insertDataBreakdown(dataToInsert, socket);

    //     chunkDataBreakdown = [];
    //   }
    //   break;

    // case 'insert-data-production':
    //   chunkDataProduction.push(jsonObject.data)
    //   socket.send(JSON.stringify({ event: 'savingProgressProd', message: chunkDataProduction.length }));
    //   const isLastChunkProduction = jsonObject.lastChunk === true;

    //   if (isLastChunkProduction) {
    //     const completeData = [].concat(...chunkDataProduction);
    //     // const dataToInsert = completeData.flatMap(chunk => chunk);

    //     const dataRitage = completeData[0]
    //     const dataDelay = completeData[1]
    //     const dataDistance = completeData[2]

    //    await insertDataProduction(dataRitage, socket);
    //    await insertDataDelay(dataDelay, socket)
    //    await insertDataDistance(dataDistance, socket)

    //     chunkDataProduction = [];
    //   }

    //   break;

    // case 'insert-data-time-entry':
    //   chunkDataTimeEntry.push(jsonObject.data)
    //   socket.send(JSON.stringify({ event: 'savingProgressTimeEntry', message: chunkDataTimeEntry.length }));
    //   const isLastChunkDataTimeEntry = jsonObject.lastChunk === true;

    //   if (isLastChunkDataTimeEntry) {
    //     const completeData = [].concat(...chunkDataTimeEntry);
    //     const dataToInsert = completeData.flatMap(chunk => chunk);

    //     //Todo: Create controller
    //     await insertDataTimeEntry(dataToInsert, socket);

    //     chunkDataTimeEntry = [];
    //   }
    //   break;

    // default:
    //   break;
  }
}


/**
 * WebSocket Configuration and Setup
 * 
 * This module exports a function to configure WebSocket connections on the provided Express application instance (`app`).
 * It sets up a WebSocket endpoint at '/websocket' with the following configurations:
 * 
 * 1. **Compression**: Utilizes the `uWS.SHARED_COMPRESSOR` for shared compression among WebSocket connections.
 * 2. **Max Payload Length**: Limits the maximum payload size to 16 MB (16 * 1024 * 1024 bytes).
 * 3. **Idle Timeout**: Sets a timeout of 10 seconds for idle connections.
 * 
 * The WebSocket lifecycle events are handled as follows:
 * 
 * - **open**: Triggered when a new WebSocket connection is established. Logs the connection and stores the WebSocket instance (`wsInstance`).
 * - **message**: Triggered when a message is received. The `handleMessage` function processes the incoming message.
 * - **drain**: Triggered when the WebSocket's buffer is emptied after being filled. Logs the current buffered amount to manage backpressure.
 * - **close**: Triggered when the WebSocket connection is closed. Logs the closure event along with the status code and message.
 * 
 * @param {object} app - The Express application instance to which the WebSocket server will be attached.
 */

module.exports = (app) => {
  app.ws('/websocket', {
    compression: uWS.SHARED_COMPRESSOR,
    maxPayloadLength: 16 * 1024 * 1024,
    idleTimeout: 10,
    open: (ws, req) => {
      console.log('WebSocket connected');
      wsInstance = ws;
    },
    message: (ws, message, isBinary) => {
      handleMessage(ws, message)
    },
    drain: (ws) => {
      console.log('WebSocket backpressure: ' + ws.getBufferedAmount());
    },
    close: (ws, code, message) => {
      console.log('WebSocket closed:', code, message);
    },
  });
};

module.exports.getWsInstance = getWsInstance; 