const { requestListener } = require('../BACKEND-main/server');

module.exports = async (req, res) => requestListener(req, res);
