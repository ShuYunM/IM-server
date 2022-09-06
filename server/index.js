// 主页
const dbserver = require("../dao/dbserver");

// 获取好友列表
exports.getFriend = function (req, res) {
  let uid = req.body.uid;
  let state = req.body.state;
  dbserver.getUsers(uid, state, res);
};
