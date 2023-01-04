// 创建表对象，也就是数据
const mongoose = require("mongoose");
const db = require("../config/app");
var Schema = mongoose.Schema;

// 用户表
var userSchema = new Schema({
  name: { type: String },
  psw: { type: String },
  email: { type: String },
  sex: { type: String, default: "asexual" },
  birth: { type: Date }, //生日
  phone: { type: Number },
  explain: { type: String }, //介绍
  imgurl: { type: String, default: "user.png" },
  time: { type: Date }, //注册事件
});

// 好友表
var FriendSchema = new Schema({
  userID: { type: Schema.Types.ObjectId, ref: "User" }, //用户id
  friendID: { type: Schema.Types.ObjectId, ref: "User" }, //好友id
  state: { type: String }, //好友状态(0已是好友，1有申请(待同意)，2表示申请方，对方还未同意)
  markname: { type: String },
  time: {
    type: Date,
  }, //生成时间
  lastTime: { type: Date }, //最后通讯时间
});

// 一对一消息表
var MessageSchema = new Schema({
  userID: { type: Schema.Types.ObjectId, ref: "User" }, //用户id
  friendID: { type: Schema.Types.ObjectId, ref: "User" }, //好友id
  message: { type: String }, //内容
  types: { type: String }, //内容类型(0文字，1图片链接，2音频链接)
  time: { type: Date }, //发送时间
  state: { type: Number }, //消息状态(0已读，1未读)
});

// 群表
var GroupSchema = new Schema({
  userID: { type: Schema.Types.ObjectId, ref: "User" }, //用户id(创建者)
  name: { type: String }, //群名称
  imgurl: { type: String, default: "group.png" }, //群头像
  time: { type: Date }, //创建时间
  notice: { type: String }, //公告
});

//群成员表
var GroupUserSchema = new Schema({
  GroupID: { type: Schema.Types.ObjectId, ref: "Group" }, //群id
  userID: { type: Schema.Types.ObjectId, ref: "User" }, //用户id
  name: { type: String }, //群内名称
  tip: { type: Number, default: 0 }, //未读消息数，0已读读，1未读
  time: { type: Date }, //加入时间
  lastTime: { type: Date }, //最后通讯时间
  shield: { type: String }, //是否屏蔽群消息(0不屏蔽，1屏蔽)
  state: { type: String }, //添加状态(0已经加入群聊，1有申请(待同意)，2表示申请方，对方还未同意)
  userList: { type: Object },
});

//群消息表
var GroupMsgSchema = new Schema({
  GroupID: { type: Schema.Types.ObjectId, ref: "Group" }, //群id
  userID: { type: Schema.Types.ObjectId, ref: "User" }, //用户id
  message: { type: String }, //内容
  types: { type: String }, //内容类型(0文字，1图片链接，2音频链接)
  time: { type: Date }, //发送时间
  tip: { type: Number, default: 0 }, //未读消息数，0已读读，1未读
});
// 将数据模型暴露出去,users即为集合名称
// 如创建的集合名称不带s。则会补上s
module.exports = db.model("User", userSchema);
module.exports = db.model("Friend", FriendSchema);
module.exports = db.model("Message", MessageSchema);
module.exports = db.model("Group", GroupSchema);
module.exports = db.model("GroupUser", GroupUserSchema);
module.exports = db.model("GroupMsg", GroupMsgSchema);
