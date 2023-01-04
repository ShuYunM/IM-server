// 引入加密文件
const bcrypt = require("../dao/bcryptjs");
const dbmodel = require("../model/dbmoudel");
const User = dbmodel.model("User");
const Friend = dbmodel.model("Friend");
const Group = dbmodel.model("Group");
const GroupUser = dbmodel.model("GroupUser");
const Message = dbmodel.model("Message");
const GroupMsg = dbmodel.model("GroupMsg");
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

// 注册页匹配用户表验证(邮箱和用户名是否存在)
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

// 用户登录验证(输入用户名或者密码，查找出对应的密码，进行密码的验证)
exports.userMatch = function (data, pwd, res) {
  // data可以使用户名，可以使邮箱
  let wherestr = { $or: [{ name: data }, { email: data }] };
  // 输出内容，1代表输出，id默认输出
  let out = { name: 1, imgurl: 1, psw: 1 };
  User.findOne(wherestr, out, function (err, result) {
    if (err) {
      res.send({ status: 500 });
    } else {
      if (!result) {
        res.send({ status: 400, message: "找不到该用户" });
        return;
      }
      result = [result];
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
  const datas = {
    userList: [],
    groupList: [],
  };
  User.find(wherestr, out, function (err, result) {
    if (err) {
      // res.send({ status: 500 });
    } else {
      // res.send({ status: 200, result });
      datas.userList = result;
      Group.find(wherestr, out, function (errs, results) {
        if (errs) {
          res.send({ status: 500, message: "获取不到群" });
        } else {
          datas.groupList = results;
          res.send({ status: 200, datas });
        }
      });
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
function update(data, updatestr, res) {
  // 根据id修改数据findByIdAndUpdate
  console.log("修改数据");
  User.updateOne({ _id: data }, updatestr, function (err, results) {
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
    phone: "手机号",
  };
  // 判断是否有密码

  if (data.type === "pwd") {
    // 有密码进行匹配
    User.find({ _id: data.id }, { psw: 1 }, function (err, result) {
      if (err) {
        res.send({ status: 500 });
      } else {
        if (result === "") {
          res.send({ status: 400, message: "找不到该用户" });
        }

        result.map((e) => {
          // 将输入旧密码密码和解码处对比，返回Boolean
          const pwdMatch = bcrypt.verification(data.pwd, e.psw);

          if (pwdMatch) {
            // 密码验证成功
            // 如果修改密码先加密
            if (data.type === "pwd") {
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
  } else if (data.type === "name" || data.type === "email" || data.type === "phone") {
    // 如果是用户名先进行匹配
    updatestr[data.type] = data.data;
    // 获取元素个数的方法，包括自己，wherestr为需要匹配的内容
    User.countDocuments(updatestr, function (err, result) {
      if (err) {
        res.send({ status: 500 });
      } else {
        // 没有匹配项，可以修改
        if (result === 0) {
          console.log("updatestr", updatestr);
          update(data.id, updatestr, res);
        } else {
          res.send({ status: 300, result, message: `${types[data.type]}已存在` });
        }
      }
    });
  } else {
    // 其他的不管有没有都可以更新
    updatestr[data.type] = data.data;
    // 获取元素个数的方法，包括自己，wherestr为需要匹配的内容
    User.findOne({ _id: data.id }, function (err, result) {
      if (err) {
        res.send({ status: 500 });
      } else {
        // 没有匹配项，可以修改
        update(data.id, updatestr, res);
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
      if (res) {
        res.send({ status: 500 });
      }
    } else {
      if (res) {
        res.send({ status: 200, result, message: "发送消息" });
      }
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
exports.getUsers = function (data, res) {
  let query = Friend.find({});
  // 查询条件
  query.where({ userID: data.uid, state: data.state });
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
          state: itme.state,
          type: 0,
        };
      });
      res.send({ status: 200, result });
    })
    .catch((err) => {
      res.send({ status: 500 });
    });
};

// 按要求获取一对一消息(最后一条消息)
exports.getOneMsg = function (data, res) {
  let query = Message.findOne({});
  // 查询条件
  query.where({
    $or: [
      { userID: data.uid, friendID: data.fid },
      { userID: data.fid, friendID: data.uid },
    ],
  });
  // 查找friendID  关联的user对象
  query.populate("friendID");
  // 排序方式，-1倒序，1相反
  query.sort({ time: -1 });
  // 查询结果
  query
    .exec()
    .then(function (e) {
      let result = {
        message: e.message, //通过关联可以取得user表中的_id
        time: e.time,
        types: e.types,
      };
      res.send({ status: 200, result });
    })
    .catch((err) => {
      res.send({ status: 500 });
    });
};

// 汇总一对一消息未读数
exports.getunRead = function (data, res) {
  let wherestr = { userID: data.fid, friendID: data.uid, state: 1 };
  Message.countDocuments(wherestr, (err, result) => {
    if (err) {
      res.send({ status: 500 });
    } else {
      res.send({ status: 200, result });
    }
  });
};

// 点击查看后变为已读
exports.updateMsg = function (data, res) {
  let wherestr = { userID: data.uid, friendID: data.fid, state: 1 };
  let updatestr = { state: 0 };
  Message.updateMany(wherestr, updatestr, (err, result) => {
    if (err) {
      res.send({ status: 500 });
    } else {
      res.send({ status: 200, result });
    }
  });
};

// 新建群
exports.createGroup = function (data, res) {
  return new Promise((resolve, reject) => {
    let groupData = {
      userID: data.uid,
      name: data.groupname,
      imgurl: data.imgurl,
      time: new Date(),
    };
    const group = new Group(groupData);
    group.save((err, result) => {
      if (err) {
        reject({ status: 500 });
      } else {
        resolve(result);
      }
    });
  })
    .then((value) => {
      for (let index = 0; index < data.userid.length; index++) {
        // 添加新成员及自己到群，需要在前端将自己uid push到userid数组中
        let udata = {
          GroupID: value._id, //群id
          userID: data.userid[index].id, //用户id,此时我拿的是当前用户的所有信息
          time: new Date(), //加入时间
          lastTime: new Date(), //最后通讯时间
          userList: data.userid[index],
        };
        this.insertGroupUser(udata, res);
      }
      res.send({ status: 200, message: "创建成功" });
    })
    .catch((err) => {
      res.send(err);
    });
};
// 添加群成员
exports.insertGroupUser = function (data, res) {
  let groupuser = new GroupUser(data);
  groupuser.save(function (err, result) {
    if (err) {
      res.send({ status: 500 });
    } else {
      console.log("添加群成员成功");
    }
  });
};


// 获取群用户列表
exports.getGroup = async function (data, res) {
  let query = GroupUser.find({});
  // 查询条件
  query.where({ userID: data.uid });
  // 查找friendID  关联的user对象
  query.populate("GroupID");
  // 排序方式，-1倒序，1相反
  query.sort({ lastTime: -1 });
  // 查询结果
  const resonpe = await query.exec();
  if (!resonpe) {
    res.send({ status: 500 });
  }
  let result = resonpe.map((item) => {
    return {
      gid: item.GroupID._id, //通过关联可以取得群表中的_id
      name: item.GroupID.name,
      imgurl: item.GroupID.imgurl,
      markname: item.name,
      lastTime: item.lastTime,
      notice: item.GroupID.notice,
      tip: item.tip,
      type: 1,
    };
  });
  result.forEach(async (item, value) => {
    // console.log(item);
    const resw = await this.getGroupMsg(item, res);
    result[value] = { ...result[value], ...resw };
    setTimeout(() => {
      if (value === result.length - 1) {
        res.send({ status: 200, result });
      }
    }, 100);
  });
};

// 按要求获取群最后一条消息
exports.getGroupMsg = async function (data, res) {
  let query = GroupMsg.findOne({});
  // 查询条件
  query.where({ GroupID: data.gid });
  // 查找friendID  关联的user对象
  // query.populate("friendID");
  // 查找friendID  关联的user对象
  query.populate("userID");
  // 排序方式，-1倒序，1相反
  query.sort({ time: -1 });
  // 查询结果

  const ress = await query.exec();
  if (ress === null) {
    return;
    // res.send({ status: 500 });
  }
  let result = {
    message: ress.message, //通过关联可以取得user表中的_id
    time: ress.time,
    types: ress.types,
    name: ress.userID.name, //最后一条消息的发送者
    imgurl: ress.userID.imgurl,
    tip: ress.tip,
  };
  return { message: result.name + " : " + result.message, types: result.types };
  // res.send({ status: 200, result });
};

// 群消息的状态修改
exports.updateGroupMsg = function (data, res) {
  let wherestr = { GroupID: data.gid, userID: data.uid };
  let updatestr = { tip: 0 };
  GroupMsg.updateMany(wherestr, updatestr, (err, result) => {
    if (err) {
      res.send({ status: 500 });
    } else {
      res.send({ status: 200, result });
    }
  });
};

// 分页获取一对一聊天数据
exports.msg = function (data, res) {
  let skipNum = data.page * data.pageSize;
  let query = Message.find({});
  // 查询条件
  query.where({
    $or: [
      { userID: data.uid, friendID: data.fid },
      { userID: data.fid, friendID: data.uid },
    ],
  });
  // 查找friendID  关联的user对象
  query.populate("userID");
  // 跳过的条数
  query.skip(skipNum);
  // 每页多少条
  query.limit(data.pageSize);
  // 排序方式，-1倒序，1相反
  query.sort({ time: -1 });
  // 查询结果
  query
    .exec()
    .then(function (e) {
      let result = e.map((item) => {
        return {
          id: item._id, //通过关联可以取得user表中的_id
          message: item.message,
          types: item.types,
          fromname: item.userID.name, //最后一条消息的发送者
          fromid: item.userID._id,
          time: item.time,
          imgurl: item.userID.imgurl, //发送者头像
        };
      });
      res.send({ status: 200, result });
    })
    .catch((err) => {
      res.send({ status: 500 });
    });
};

// 分页获取群聊天数据
exports.GroupTalkMsg = function (data, res) {
  let skipNum = data.page * data.pageSize;
  let query = GroupMsg.find({});
  // 查询条件
  query.where({ userID: data.uid, GroupID: data.gid });
  // 查找friendID  关联的user对象
  query.populate("userID");
  // 跳过的条数
  query.skip(skipNum);
  // 每页多少条
  query.limit(data.pageSize);
  // 排序方式，-1倒序，1相反
  query.sort({ time: -1 });
  // 查询结果
  query
    .exec()
    .then(function (e) {
      let result = e.map((item) => {
        return {
          id: item._id, //通过关联可以取得user表中的_id
          message: item.message,
          types: item.types,
          fromname: item.userID.name, //最后一条消息的发送者
          fromid: item.userID._id,
          time: item.time,
          imgurl: item.userID.imgurl, //发送者头像
        };
      });
      res.send({ status: 200, result });
    })
    .catch((err) => {
      res.send({ status: 500 });
    });
};

// 判断是否在群内(添加群时判断)
exports.isInGroup = function (data, res) {
  let wherestr = { userID: data.uid, GroupID: data.gid };
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

// 添加群消息
exports.createGroupMsg = function (data, res) {
  let datas = {
    GroupID: data.gid,
    userID: data.uid, //用户id
    message: data.message, //内容
    types: data.types, //内容类型(0文字，1图片链接，2音频链接)
    time: new Date(), //发送时间
    tip: 1, //消息状态(0已读，1未读)
  };
  let message = new GroupMsg(datas);
  message.save(function (err, result) {
    if (err) {
      if (res) {
        res.send({ status: 500 });
      } else {
        console.log("失败");
      }
    } else {
      res ? res.send({ status: 200, result, message: "添加群消息成功" }) : console.log("");
    }
  });
};

// 最后通讯时间更新（最后一条消息的时间也可以用做时间？）
exports.updateGroupTime = function (data) {
  let wherestr = { GroupID: data.gid };
  let updatestr = { lastTime: new Date() };
  // updateMany
  GroupUser.update(wherestr, updatestr, function (err, result) {
    if (err) {
      console.log("更新最后通讯时间出错");
      // res.send({ status: 500 });
    } else {
      // res.send({ status: 200 });
    }
  });
};
