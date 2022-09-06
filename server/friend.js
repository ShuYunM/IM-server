// 好友
const dbserver = require("../dao/dbserver");

// 好友申请
exports.applyFriend = function (req, res) {
  let data = req.body;
  dbserver.applyFriend(data, res);
};

// 更新好友状态
exports.updateFriendState = function (req, res) {
  let data = req.body;
  dbserver.updateFriendState(data, res);
};

// 删除或拒绝好友
exports.deleteFriend = function (req, res) {
  let data = req.body;
  dbserver.deleteFriend(data, res);
};
