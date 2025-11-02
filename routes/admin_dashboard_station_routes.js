// routes/admin_dashboard_station_routes.js
const dashboardStation = require("../handlers/admin_dashboard_stasion_handler");
const lkfHandler = require("../handlers/lkf_handler"); // ⬅️ Tambahan penting!

module.exports = (app) => {
  app.post("/api/admin/get-dashboard-station", (res, req) =>
    dashboardStation.handleDashboardStation(res, req)
  );

  app.post("/api/admin/get-dashboard-table-station", (res, req) =>
    dashboardStation.handleDashboardTableStation(res, req)
  );

  app.put("/api/admin/update-station", (res, req) =>
    dashboardStation.handleUpdateLkf(res, req)
  );

  app.put("/api/admin/delete-station/:lkf_id", (res, req) =>
    dashboardStation.handleDelLkf(res, req)
  );

  app.post("/api/admin/add-station", (res, req) =>
    dashboardStation.handleAddLkf(res, req)
  );

  app.get("/api/admin/get-lkf/:lkf_id", (res, req) => {
    lkfHandler.handleGetLkfById(res, req);
  });

  app.put("/api/admin/update-lkf", (res, req) => {
    lkfHandler.handleUpdateLkf(res, req);
  });
};
