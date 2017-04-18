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
 * examineProgress -- 审查进度
 *  course/test -- 审查类型
 *  course.status/test.status -- 审查状态
 *   审查状态: pass -- 通过，reject -- 驳回, examining -- 正在审查
 *  examineText -- 审查文字
 *  adminAccount -- 申请审查人
 *  examineAccount -- 审查人
 *  contentName -- 标题
 *  contentType -- 所属类型
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
    examineProgress: [{
        contentName: {type: String, unique: true, required: true},
        contentType: {type: String, required: true},
        examineType: {type: String, required: true},
        examineText: {type: String},
        adminAccount: {type: String},
        examineAccount: {type: String},
        status: {type:String},
        date: {type: String}
    }]
}, { collection: "admin" });

exports.adminSchema = adminSchema;
