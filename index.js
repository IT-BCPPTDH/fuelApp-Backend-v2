//index.js

const serverRoutes = require('uWebSockets.js')
const app = serverRoutes.App();
require('dotenv').config();

const port = process.env.PORT || 9111;

const formLkfRoutes = require('./routes/form_lkf');

// Cors Setup
app.options('/*', (res, req) => {
    res.writeHeader('Access-Control-Allow-Origin', '*');
    res.writeHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.writeHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.writeHeader('Access-Control-Allow-Credentials', 'true');

    res.onAborted(() => {
        res.aborted = true;
    });

    res.end();
});

// Prohibit Direct Access
app.get('/', (res, req) => {
    res.cork(() => {
        res.write('<html>');
        res.write('<h1>Prohited Access</h1>');
        res.end('</html>');
    });
})

formLkfRoutes(app)


// Server Listener
app.listen('0.0.0.0', port, (token) => {
    if (token) {
        console.log('Listening to port ' + port);
    } else {
        console.log('Failed to listen to port ' + port);
    }
});
