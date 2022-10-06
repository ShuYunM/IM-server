// 主页
const db = require("../config/app");
const dbserver = require("../dao/dbserver");

// 获取好友列表
exports.getFriend = function (req, res) {
  let data = req.body;
  dbserver.getUsers(data, res);
};

// 获取最后一条消息
exports.getLastMsg = function (req, res) {
  let data = req.body;
  dbserver.getOneMsg(data, res);
};
// 获取未读消息数
exports.getunRead = function (req, res) {
  let data = req.body;
  dbserver.getunRead(data, res);
};
//点击查看后变为已读
exports.updateMsg = function (req, res) {
  let data = req.body;
  dbserver.updateMsg(data, res);
};

// 获取群列表
exports.getGroup = function (req, res) {
  let data = req.body;
  dbserver.getGroup(data, res);
};
// 按要求获取群消息
exports.getGroupMsg = function (req, res) {
  let data = req.body;
  dbserver.getGroupMsg(data, res);
};
// 群消息的状态修改
exports.updateGroupMsg = function (req, res) {
  let data = req.body;
  dbserver.updateGroupMsg(data, res);
};
// 是否在群里
exports.isGroup = function (req, res) {
  let data = req.body;
  dbserver.isInGroup(data, res);
};

// 申请入群
exports.insertGroupUser = function (req, res) {
  let data = req.body;
  dbserver.insertGroupUser(data, res);
};
