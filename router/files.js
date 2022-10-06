// 引入附件上传插件
const multer = require("multer");
const mkdir = require("../dao/mkdir");

const storage = multer.diskStorage({
  //保存路径
  destination: function (req, file, cb) {
    // 处理路径，如头像，群头像，聊天的文件都是不同的路径
    let url = req.body.url;
    // 先创建文件夹，然后在进行上传
    mkdir.mkdirs("../data/" + url, (err) => {
      console.log(err);
    });
    cb(null, "./data/" + url);
    //注意这里的文件路径,不是相对路径，直接w填写从项目根路径开始写就行了
  },
  //保存在 destination 中的文件名
  filename: function (req, file, cb) {
    // 如果上传的是头像，就覆盖原来的，就不能使用时间戳
    if (req.body.url === "user") {
      let type = file.originalname.replace(/.+\./, ".");
      console.log("type", type);
      cb(null, req.body.name + type);
    } else {
      // 通过正则改变文件名字
      let type = file.originalname.replace(/.+\./, ".");
      cb(null, Date.now() + type);
    }
  },
});
const upload = multer({ storage: storage });
module.exports = function (app) {
  app.post("/files/upload", upload.array("file", 10), function (req, res, next) {
    // req.files 是 `files` 文件数组的信息
    //线上的也就是服务器中的图片的绝对地址
    // __dirname.replace("router", "") + req.files[0].pat
    res.send({
      msg: "success",
      data: req.files,
    });
    // req.body 将具有文本域数据，如果存在的话
  });
};
