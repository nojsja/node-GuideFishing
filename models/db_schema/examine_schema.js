/**
 * Created by yangw on 2017/4/18.
 * text 和course 的审查表
 * contentName -- 名字
 * contentType -- 类型
 * status -- 审查状态
 *  reject -- 拒绝通过
 *  pass -- 审查通过
 *  isExaming -- 正在审查
 * examineType -- 所属审查类型
 * examineAccount -- 审查人
 * adminAccount -- 审查申请人
 * examineText -- 审查结果
 * date -- 审查日期
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

exports.examineSchema = new Schema({

    contentName: {type: String, required: true, unique: true},
    contentType: {type: String, required: true},
    status: {type: String, required: true},
    examineType: {type: String},
    examineAccount: {type: String},
    examineText: {type: String},
    adminAccount: {type: String, required: true},
    date: {type: String}

}, {collection: 'examine'});