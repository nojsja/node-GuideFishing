/**
 * Created by yangw on 2017/4/5.
 * 管理员模式
 * account -- 账户(邮箱)
 * nickName -- 昵称
 * password -- 密码
 * rank -- 管理员权限等级
 *  0 -- 大管理员，拥有最高权限，可以分配给其它账户权限
 *  1 -- 1级管理员，拥有次级权限，可以审核内容和删除内容，本级别内还分为course和test管理员
 *  2 -- 2级管理员，拥有最低级管理权限，可以编写内容，内容的发布需要提交给1级管理员审核
 *  所有管理级别的管理员都可以自由查看所有付费和免费内容
 * examineType -- 审查类型，本系统的主要审查类型有course和test
 * examineContent -- 审查内容，分为course和test，两个条目分别存储name/title和type主键，实际内容位于相对应的course和test表中
 *
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var adminSchema = new Schema({
    account: {type: String, required: true, unique: true},
    nickName: {type: String, required: true},
    password: {type: String, required: true},
    rank: {type: Number, required: true},
    examineType: {
        type: String
    },
    examineContent: {
        course: [{
            courseName: {type: String, required: true, unique: true},
            courseType: {type: String, required: true}
        }],
        test: [{
            testTitle: {type: String, required: true, unique: true},
            testType: {type: String, required: true}
        }]
    }
}, { collection: "admin" });

exports.adminSchema = adminSchema;
