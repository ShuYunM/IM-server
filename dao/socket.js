let dbserver = require("./dbserver");
module.exports = function (io) {
  let users = {};
  io.on("connection", (socket) => {
    // 用户登录注册
    socket.on("login", (id) => {
      // id是用户的id
      socket.name = id;
      //记录当前登录用户的socket.id，后面可以通过用户id找到对应的socket.id来实现一一对应
      users[id] = socket.id;
      // socket.emit("msg", socket.id);
    });

    // 一对一消息发送
    socket.on("msg", (msg, fromid, toid) => {
      // 更新最后通讯时间
      dbserver.upFriendLastTime({ uid: fromid, fid: toid });
      // 存储一对一消息
      dbserver.insertMsg(fromid, toid, msg.message, msg.types);
      if (users[toid]) {
        socket.to(users[toid]).emit("msg", msg, fromid, 0);
      }
      // 给自己也发一份，保证消息栏同时也可以渲染我们自己的消息
      // 当我们给对方发消息时，退出来后，消息也会同步在消息栏
      socket.emit("msg", msg, toid, 1);
    });

    // 加入群聊
    socket.on("group", function (gid) {
      socket.join(gid);
    });

    // 接收群消息
    socket.on("groupMsg", function (msg, fromid, gid, user) {
      socket.to(gid).emit("groupmsg", msg, gid, 0, user);
    });

    // 断开
    socket.on("disconnect", () => {
      if (users.hasOwnProperty(socket.name)) {
        delete users[socket.name];
      }
      console.log(socket.id + "与服务其断开");
    });

    socket.on("reconnect", function () {
      console.log("重新连接到服务器");
    });
  });
};
