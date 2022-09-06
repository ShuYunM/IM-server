const bcrypt = require("bcryptjs");
// 生成hash密码随机的salt
exports.encryption = function (e) {
  const salt = bcrypt.genSaltSync(10);
  //   生成hash密码
  let hash = bcrypt.hashSync(e, salt);
  return hash;
};

// 解密
exports.verification = function (e, hash) {
  const verif = bcrypt.compareSync(e, hash);
  return verif;
};
