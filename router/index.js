const dbserver = require("../dao/dbserver");
// 引入邮箱发送方法
const emailserver = require("../dao/openEmail");

// 注册页面服务
let signUp = require("../server/signup");
// 登录页面
let signin = require("../server/signin");
// 搜索页面
let search = require("../server/search");
// 用户详情页面
let userdetial = require("../server/userdetial");
// 好友申请
let friend = require("../server/friend");
// 获取好友
let getFriend = require("../server/index");
// 建立路由文件
module.exports = function (app) {
  // 邮箱测试
  app.post("/mail", (req, res) => {
    let mail = req.body.mail;
    emailserver.emailSignUp(mail, res);
  });
  // 注册页面
  app.post("/singup/add", (req, res) => {
    signUp.signUp(req, res);
  });

  // 用户或邮箱是否存在的判断
  app.post("/singup/judge", (req, res) => {
    signUp.judgeValue(req, res);
  });

  // 登录页面
  // 登录
  app.post("/singin/match", (req, res) => {
    signin.singIn(req, res);
  });

  // 搜索页面
  // 用户搜索
  app.get("/search/user", (req, res) => {
    search.searchUser(req, res);
  });
  // 判断是否为好友
  app.post("/search/isfriend", (req, res) => {
    search.isFriend(req, res);
  });
  // 搜索群
  app.get("/search/group", (req, res) => {
    search.searchGroup(req, res);
  });
  // 判断是否在群内
  app.post("/search/isingroup", (req, res) => {
    search.isInGroup(req, res);
  });

  // 用户详情
  // 详情
  app.get("/user/detial", (req, res) => {
    userdetial.userDetial(req, res);
  });
  // 用户信息修改
  app.put("/user/update", (req, res) => {
    userdetial.userUpdate(req, res);
  });
  // 获取好友的昵称
  app.get("/user/getmarkname", (req, res) => {
    userdetial.getfreendMarkName(req, res);
  });
  // 修改好友的昵称
  app.put("/user/updatemarkname", (req, res) => {
    userdetial.updatefreendMarkName(req, res);
  });

  // 好友请求
  // 申请好友
  app.post("/friend/applyfriend", (req, res) => {
    friend.applyFriend(req, res);
  });
  // 好友通过
  app.post("/friend/updateFriend", (req, res) => {
    friend.updateFriendState(req, res);
  });
  // 删除好友拒绝好友
  app.post("/friend/deleteFriend", (req, res) => {
    friend.deleteFriend(req, res);
  });

  // 主页
  // 获取好友
  app.post("/index/getfriend", (req, res) => {
    getFriend.getFriend(req, res);
  });
  // 获取最后一条消息
  app.post("/index/lastmsg", (req, res) => {
    getFriend.getLastMsg(req, res);
  });
  // 获取未读消息数
  app.post("/index/unread", (req, res) => {
    getFriend.getunRead(req, res);
  });
  // 点击查看后变为已读
  app.post("/index/readmsg", (req, res) => {
    getFriend.updateMsg(req, res);
  });

  // 获取群列表
  app.post("/index/grouplist", (req, res) => {
    getFriend.getGroup(req, res);
  });
  // 按要求获取群消息
  app.post("/index/groupmsg", (req, res) => {
    getFriend.getGroupMsg(req, res);
  });
  // 群消息的状态修改
  app.post("/index/updategroupmsg", (req, res) => {
    getFriend.updateGroupMsg(req, res);
  });
};
