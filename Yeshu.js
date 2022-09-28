const express = require("express");
const jwt = require("./dao/jwt");
const app = express();
// 引入socket.io
const server = app.listen(8082);
const io = require("socket.io").listen(server);
require("./dao/socket")(io);
// 引入跨域处理
const cors = require("cors");
app.use(cors());
app.use("/data", express.static(__dirname + "/data"));

// 引入前端req.body插件
const bodyParser = require("body-parser");
// 解析前端数据，同时设置上传的文件限制
// app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
// app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// token判断，每一次请求都会判断
app.use((req, res, next) => {
  if (typeof req.body.token !== "undefined" || typeof req.query.token !== "undefined") {
    // 处理token匹配
    let token = req.body.token || req.query.token;
    let tokenMatch = jwt.verifyToken(token);
    if (tokenMatch) {
      // token正确
      next();
    } else {
      res.send({ status: 401, message: "没有访问权限，需要进行身份认证" });
    }
  } else {
    next();
  }
});

// 引入路由
require("./router/index")(app);
require("./router/files")(app);
// 当所有路径都错误时返回404并报错
app.use(function (req, res, next) {
  let err = new Error("Not Found");
  err.status = 404;

  next(err);
});

// 出现错误处理
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send(err.message);
});

app.listen(3000, () => {
  console.log("服务器开启成功");
});
