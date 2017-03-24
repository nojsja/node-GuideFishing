/**
 * Created by yangw on 2017/2/20.
 * 存储用户信息的结构模式
 * account: 邮箱账户
 * nickName: 昵称
 * password: 密码
 * purchasedItem: 已购项目
 * root: 是否具有管理员权限
 * itemType: 所属内容类型
 * _type: 分为course 和 test
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({

    account: {type: String, required: true, unique: true},
    nickName: {type: String, required: true},
    password: {type: String, required: true},
    root: Boolean,
    purchasedItem: [{
        itemType: String,
        itemName: String,
        date: String,
        _type: String
    }],
}, {collection: 'user'});

exports.userSchema = userSchema;