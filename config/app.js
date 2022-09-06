const mongoose = require("mongoose");
// 连接本地数据库：show dbs 查看  use 数据库名  创建
const db = mongoose.createConnection("mongodb://localhost:27017/Yeshu", { useNewUrlParser: true });
// 连接成功
db.on("open", function () {
  console.log("连接Yeshu数据库成功");
});
// 连接失败
db.on("error", function () {
  console.log("连接失败！");
});

module.exports = db;
