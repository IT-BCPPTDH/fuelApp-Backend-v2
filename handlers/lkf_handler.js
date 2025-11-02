const {
  getLkfByIdController,
  updateLkfController,
} = require("../controllers/lkf_controller");

const {
  handleResponseParams,
  handleResponseJsonOperator,
} = require("./httpResponseHandler");

async function handleGetLkfById(res, req) {
  await handleResponseParams(res, req, getLkfByIdController, 1);
}

async function handleUpdateLkf(res, req) {
  await handleResponseJsonOperator(res, req, updateLkfController, true);
}

module.exports = {
  handleGetLkfById,
  handleUpdateLkf,
};
