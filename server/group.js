// 群
const dbserver = require("../dao/dbserver");

// 新建群
exports.createGroup = function (req, res) {
  let data = req.body;
  dbserver.createGroup(data, res);
};

// 获取当前用户的群列表
// exports.getUserGroup = function (req, res) {
//   let data = req.body;
//   dbserver.getUserGroup(data, res);
// };
