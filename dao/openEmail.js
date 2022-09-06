// 引用发送邮件插件
const nodemailer = require("nodemailer");
// 引入证书
const credentials = require("../config/credentials");
// 创建传输方式
const transporter = nodemailer.createTransport({
  service: "qq",
  auth: {
    user: credentials.qq.user,
    pass: credentials.qq.pass,
  },
});

exports.emailSignUp = function (email, res) {
  // 发送信息内容
  let options = {
    from: "1003823477@qq.com",
    to: email,
    subject: "您好！欢迎您在Yeshu注册，欢迎您的使用",
    html: "<span>Yeshu欢迎您的加入</span><a href='http://localhost:8080/'>点击</a>",
  };

  //   发送邮件
  transporter.sendMail(options, function (err, msg) {
    if (err) {
      res.send("邮件发送错误！");
      console.log("邮件发送错误！");
    } else {
      res.send("邮件发送成功！");
      console.log("邮件发送成功！");
    }
  });
};
