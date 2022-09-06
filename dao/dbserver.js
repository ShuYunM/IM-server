// 引入加密文件
const bcrypt = require("../dao/bcryptjs");
const dbmodel = require("../model/dbmoudel");
const User = dbmodel.model("User");
const Friend = dbmodel.model("Friend");
const Group = dbmodel.model("Group");
const GroupUser = dbmodel.model("GroupUser");
const Message = dbmodel.model("Message");
const jwt = require("../dao/jwt");

// 新建用户
exports.buildUser = function (name, mail, pwd, res) {
  // 对密码进行加密
  const password = bcrypt.encryption(pwd);
  // 属性必须和数据库设置的对应
  let data = {
    name: name,
    email: mail,
    psw: password,
    time: new Date(),
  };
  let user = new User(data);
  user.save(function (err, result) {
    if (err) {
      res.send({ status: 500 });
    } else {
      res.send({ status: 200, result, message: "注册成功" });
    }
  });
};

// 匹配用户表验证
exports.countUserValue = function (data, type, res) {
  let wherestr = {};
  wherestr[type] = data;
  // 获取元素个数的方法，wherestr为需要匹配的内容
  User.countDocuments(wherestr, function (err, result) {
    if (err) {
      res.send({ status: 500 });
    } else {
      res.send({ status: 200, result, message: "0为不存在，大于0位存在" });
    }
  });
};

// 用户登录验证
exports.userMatch = function (data, pwd, res) {
  // data可以使用户名，可以使邮箱
  let wherestr = { $or: [{ name: data }, { email: data }] };
  // 输出内容，1代表输出，id默认输出
  let out = { name: 1, imgurl: 1, psw: 1 };
  User.find(wherestr, out, function (err, result) {
    if (err) {
      res.send({ status: 500 });
    } else {
      if (result === "") {
        res.send({ status: 400, message: "找不到该用户" });
      }
      result.map((e) => {
        // 将输入密码和解码处对比，返回Boolean
        const pwdMatch = bcrypt.verification(pwd, e.psw);
        if (pwdMatch) {
          let token = jwt.generateToken(e._id);
          let back = {
            id: e._id,
            name: e.name,
            imgurl: e.imgurl,
            token: token,
          };
          res.send({ status: 200, back, message: "登录成功" });
        } else {
          res.send({ message: "用户名或密码错误", status: 400 });
        }
      });
    }
  });
};

// 搜索用户
exports.searchUser = function (data, res) {
  // 做一个彩蛋，当搜索shu的时候将所有的用户显示
  let wherestr = {};
  if (data == "shu") {
    wherestr = {};
  } else {
    // 名字或邮箱,$regex模糊搜索的意思
    wherestr = { $or: [{ name: { $regex: data } }, { email: { $regex: data } }] };
  }
  let out = {
    name: 1,
    email: 1,
    imgurl: 1,
  };
  User.find(wherestr, out, function (err, result) {
    if (err) {
      res.send({ status: 500 });
    } else {
      res.send({ status: 200, result });
    }
  });
};

// 判断搜索出来的用户，是否已经是好友
exports.isFriend = function (uid, fid, res) {
  let wherestr = { userID: uid, friendID: fid, state: 0 };
  // 寻找一条，也可以用前面的匹配个数来判断
  Friend.findOne(wherestr, function (err, result) {
    if (err) {
      res.send({ status: 500 });
    } else {
      if (result) {
        // 是好友
        res.send({ status: 200, result, message: 1 });
      } else {
        // 不是好友
        res.send({ status: 400, message: 0 });
      }
    }
  });
};

// 搜索群
exports.searchGroup = function (data, res) {
  // 做一个彩蛋，当搜索shu的时候将所有的用户显示
  let wherestr = {};
  if (data == "shu") {
    wherestr = {};
  } else {
    // 名字或邮箱,$regex模糊搜索的意思
    wherestr = { name: { $regex: data } };
  }
  // 输出对象
  let out = {
    name: 1,
    imgurl: 1,
  };
  Group.find(wherestr, out, function (err, result) {
    if (err) {
      res.send({ status: 500 });
    } else {
      res.send({ status: 200, result });
    }
  });
};

// 判断是否在群内
exports.isInGroup = function (uid, gid) {
  let wherestr = { userID: uid, GroupID: gid };
  // 寻找一条，也可以用前面的匹配个数来判断
  GroupUser.findOne(wherestr, function (err, result) {
    if (err) {
      res.send({ status: 500 });
    } else {
      if (result) {
        // 在群内
        res.send({ status: 200, result });
      } else {
        // 不在群内
        res.send({ status: 400 });
      }
    }
  });
};

// 用户详情
exports.userDetial = function (id, res) {
  let wherestr = { _id: id };
  // 不要输出密码
  let out = { psw: 0 };
  User.findOne(wherestr, out, function (err, result) {
    if (err) {
      res.send({ status: 500 });
    } else {
      res.send({ status: 200, result });
    }
  });
};

// 用户信息修改
function update(data, update, res) {
  // 根据id修改数据findByIdAndUpdate
  User.updateOne(data.id, update, function (err, results) {
    if (err) {
      res.send({ status: 500 });
    } else {
      res.send({ status: 200, message: "修改成功" });
    }
  });
}

exports.userUpdate = function (data, res) {
  let updatestr = {};
  const types = {
    name: "用户名",
    email: "邮箱",
    pwd: "密码",
  };
  // 判断是否有密码
  if (typeof data.pwd !== "undefined") {
    // 有密码进行匹配
    User.find({ _id: data.id }, { psw: 1 }, function (err, result) {
      if (err) {
        res.send({ status: 500 });
      } else {
        if (result === "") {
          res.send({ status: 400, message: "找不到该用户" });
        }
        result.map((e) => {
          // 将输入密码和解码处对比，返回Boolean
          const pwdMatch = bcrypt.verification(data.pwd, e.psw);
          if (pwdMatch) {
            // 密码验证成功
            // 如果修改密码先加密
            if (data.type == "pwd") {
              let password = bcrypt.encryption(data.data);
              updatestr["psw"] = password;
              update(data.id, updatestr, res);
            } else {
              // 邮箱匹配
              updatestr[data.type] = data.data;
              // 获取元素个数的方法，wherestr为需要匹配的内容
              User.countDocuments(updatestr, function (err, result) {
                if (err) {
                  res.send({ status: 500 });
                } else {
                  if (result === 0) {
                    // 没有匹配项，可以修改
                    update(data.id, updatestr, res);
                  }
                  // 已存在
                  res.send({ status: 300, result, message: `${types[data.type]}已存在` });
                }
              });
            }
          } else {
            res.send({ message: "密码匹配失败", status: 400 });
          }
        });
      }
    });
  } else if (data.type === "name") {
    // 如果是用户名先进行匹配
    updatestr[data.type] = data.data;
    // 获取元素个数的方法，包括自己，wherestr为需要匹配的内容
    User.countDocuments(updatestr, function (err, result) {
      if (err) {
        res.send({ status: 500 });
      } else {
        // 没有匹配项，可以修改
        console.log("result", result);
        if (result === 0) {
          console.log("updatestr", updatestr);
          update(data.id, updatestr, res);
        } else {
          res.send({ status: 300, result, message: `${types[data.type]}已存在` });
        }
      }
    });
  } else {
    updatestr[data.type] = data.data;
    // 获取元素个数的方法，包括自己，wherestr为需要匹配的内容
    User.countDocuments(updatestr, function (err, result) {
      if (err) {
        res.send({ status: 500 });
      } else {
        // 没有匹配项，可以修改
        if (result === 0) {
          update(data.id, updatestr, res);
        }
        res.send({ status: 300, result, message: `${types[data.type]}已存在` });
      }
    });
  }
};

// 获取好友的昵称
exports.getfreendMarkName = function (data, res) {
  let wherestr = { userID: data.uid, friendID: data.fid };
  let out = { markname: 1 };
  // findByIdAndUpdate不同的是通过自定义的修改项
  Friend.findOne(wherestr, out, function (err, result) {
    if (err) {
      res.send({ status: 500 });
    } else {
      res.send({ status: 200, message: "查询好友昵称成功", result });
    }
  });
};

// 修改好友的昵称
exports.updatefreendMarkName = function (data, res) {
  let wherestr = { userID: data.uid, friendID: data.fid };
  let updatestr = { markname: data.name };
  // 修改一条，和findByIdAndUpdate不同的是通过自定义的修改项
  Friend.updateOne(wherestr, updatestr, function (err, result) {
    if (err) {
      res.send({ status: 500, message: "修改失败" });
    } else {
      res.send({ status: 200, message: "修改成功", result });
    }
  });
};

/* 个人思路：
          0,1,2代表已为好友，待同意(对方)，申请中(己方)，添加好友时分别我方发送state:2，对方发送1
          如果我们点击了同意，那么久更新两边的状态为0，我们可以以0 && id为渲染好友列表条件，以1为渲染待同意的通知条件
 */
// 好友操作
// 好友申请后，添加好友表
exports.bulidFriend = function (uid, fid, state, res) {
  let data = {
    userID: uid,
    friendID: fid,
    state: state,
    time: new Date(),
    lastTime: new Date(),
  };
  let friend = new Friend(data);
  friend.save(function (err, result) {
    if (err) {
      console.log("申请好友表");
    } else {
      // res.send({ status: 200, result, message: "添加成功" });
    }
  });
};

// 好友最后通讯时间
exports.upFriendLastTime = function (data) {
  let wherestr = {
    $or: [
      { userID: data.uid, friendID: data.fid },
      { userID: data.fid, friendID: data.uid },
    ],
  };
  let updatestr = { lastTime: new Date() };
  // updateMany
  Friend.updateMany(wherestr, updatestr, function (err, result) {
    if (err) {
      console.log("更新最后通讯时间出错");
      // res.send({ status: 500 });
    } else {
      // res.send({ status: 200 });
    }
  });
};

// 添加一对一消息
exports.insertMsg = function (uid, fid, msg, types, res) {
  let data = {
    userID: uid, //用户id
    friendID: fid, //好友id
    message: msg, //内容
    types: types, //内容类型(0文字，1图片链接，2音频链接)
    time: new Date(), //发送时间
    state: 1, //消息状态(0已读，1未读)
  };

  let message = new Message(data);
  message.save(function (err, result) {
    if (err) {
      res.send({ status: 500 });
    } else {
      res.send({ status: 200, result, message: "发送消息" });
    }
  });
};

// 好友申请
exports.applyFriend = function (data, res) {
  // 判断是否已经申请过
  let wherestr = { userID: data.uid, friendID: data.fid };
  Friend.countDocuments(wherestr, (err, result) => {
    if (err) {
      res.send({ status: 500 });
    } else {
      // 初次申请
      if (result === 0) {
        this.bulidFriend(data.uid, data.fid, 2); //申请方
        this.bulidFriend(data.fid, data.uid, 1);
      } else {
        // 已经申请过好友了
        this.upFriendLastTime(data.uid, data.fid);
        // this.upFriendLastTime(data.fid, data.uid);
      }
      // 添加消息
      this.insertMsg(data.uid, data.fid, data.msg, 0, res);
    }
  });
};

// 更新好友状态
exports.updateFriendState = function (data, res) {
  let wherestr = {
    $or: [
      { userID: data.uid, friendID: data.fid },
      { userID: data.fid, friendID: data.uid },
    ],
  };
  Friend.updateMany(wherestr, { state: 0 }, function (err, result) {
    if (err) {
      res.send({ status: 500 });
    } else {
      res.send({ status: 200 });
    }
  });
};

// 拒绝或删除好友
exports.deleteFriend = function (data, res) {
  let wherestr = {
    $or: [
      { userID: data.uid, friendID: data.fid },
      { userID: data.fid, friendID: data.uid },
    ],
  };
  Friend.deleteMany(wherestr, function (err, result) {
    if (err) {
      res.send({ status: 500 });
    } else {
      res.send({ status: 200, message: "好友删除成功" });
    }
  });
};

// 按要求获取用户列表
exports.getUsers = function (uid, state, res) {
  let query = Friend.find({});
  // 查询条件
  query.where({ userID: uid, state: state });
  // 查找friendID  关联的user对象
  query.populate("friendID");
  // 排序方式，-1倒序，1相反
  query.sort({ lastTime: -1 });
  // 查询结果
  query
    .exec()
    .then(function (e) {
      let result = e.map((itme) => {
        return {
          id: itme.friendID._id, //通过关联可以取得user表中的_id
          name: itme.friendID.name,
          markname: itme.markname,
          imgurl: itme.friendID.imgurl,
          lastTime: itme.lastTime,
        };
      });
      res.send({ status: 200, result });
    })
    .catch((err) => {
      res.send({ status: 500 });
    });
};
