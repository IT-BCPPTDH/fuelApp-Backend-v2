//index.js
const cron = require('node-cron');
const serverRoutes = require('uWebSockets.js')
const app = serverRoutes.App();
require('dotenv').config();
const fs = require('fs');
const path = require('path');
process.env.TZ = 'Asia/Makassar';
console.log(new Date().toString()); 

const port = process.env.PORT || 9111;

const formLkfRoutes = require('./routes/form_lkf');
const formDataRoutes = require('./routes/form_data');
const loginRoutes = require('./routes/login');
const homeRoutes = require('./routes/home_tab_routes');
const adminDashboardRoutes = require('./routes/admin_dashboard_routes')
const adminDashboardStationRoutes = require('./routes/admin_dashboard_station_routes')
const adminDashboardDataRoutes = require('./routes/admin_dashboard_form_data_routes')
const adminRequestQuotaRoutes = require('./routes/admin_request_quota_routes')
const quotaUsageRoutes = require('./routes/quota_usage_routes')
const downloadRoutes = require('./routes/admin_download_routes')
const getCloseStation = require('./routes/form_lkf')

const { generateDaily } = require('./controllers/quota_usage_controller')

// Cors Setup
app.options('/*', (res, req) => {
    res.writeHeader('Access-Control-Allow-Origin', '*');
    res.writeHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.writeHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.writeHeader('Access-Control-Allow-Headers', 'custom_token');
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

app.get('/online', (res, req) => {
    res.cork(() => {
        res.writeHeader('Access-Control-Allow-Origin', '*'); // Allow all origins (or specify the exact origin)
        res.writeHeader('Access-Control-Allow-Methods', 'GET, OPTIONS'); // Allow methods
        res.writeHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allow headers

        // Respond to OPTIONS preflight request (for browsers)
        if (req.getMethod() === 'OPTIONS') {
            res.end(); // End preflight response
            return;
        }

        res.writeHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ online: true }));
    });
});


formLkfRoutes(app)
formDataRoutes(app)
loginRoutes(app)
adminDashboardRoutes(app)
adminDashboardStationRoutes(app)
adminDashboardDataRoutes(app)
adminRequestQuotaRoutes(app)
homeRoutes(app)
quotaUsageRoutes(app)
downloadRoutes(app)
getCloseStation(app)

// generateDaily()
cron.schedule('0 0 * * *', async () => {
    generateDaily()
})


// Server Listener
app.listen('0.0.0.0', port, (token) => {
    if (token) {
        console.log('Listening to port ' + port);
    } else {
        console.log('Failed to listen to port ' + port);
    }
});
