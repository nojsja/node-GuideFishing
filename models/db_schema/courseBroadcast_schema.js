/**
 * Created by yangw on 2016/11/24.
 * 课程直播数据模式
 * courseName -- 课程名字
 * date -- 创建日期
 * learner -- 参与学习者
 * teacher -- 教师的名字
 * admin -- 课程管理员
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var courseBroadcast_schema = new Schema({

    courseName: {
        type: String,
        unique: true,
        required: true
    },
    date: String,
    learner: [{
        name: String
    }],
    teacher: [{
        name: String
    }],
    admin: [{
        name: String,
        password: String
    }]

}, { collection: "courseBroadcast" });

exports.courseBroadcast_schema = courseBroadcast_schema;

