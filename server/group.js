// 群
const dbserver = require("../dao/dbserver");

// 新建群
exports.createGroup = function (req, res) {
  let data = req.body;
  dbserver.createGroup(data, res);
};
