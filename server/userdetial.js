const dbserver = require("../dao/dbserver");

// 详情
exports.userDetial = (req, res) => {
  let id = req.query.id;
  dbserver.userDetial(id, res);
};
// 用户信息修改
exports.userUpdate = (req, res) => {
  let data = req.body;
  dbserver.userUpdate(data, res);
};
// 获取好友的昵称
exports.getfreendMarkName = (req, res) => {
  let data = req.query;
  dbserver.getfreendMarkName(data, res);
};
// 修改好友的昵称
exports.updatefreendMarkName = (req, res) => {
  let data = req.body;
  dbserver.updatefreendMarkName(data, res);
};
