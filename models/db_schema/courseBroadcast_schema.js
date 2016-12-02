/**
 * Created by yangw on 2016/11/24.
 * 课程直播数据模式
 * courseName -- 课程名字
 * date -- 创建日期
 * learner -- 参与学习者
 * teacher -- 教师的名字
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var courseBroadcast_schema = new Schema({

    courseName: {
        type: String,
        unique: true,
        required: true
    },
    courseType: {
        type: String,
        required: true
    },
    date: String,
    learners: [{
        name: String
    }],
    teacher: {
        name: String,
        password: String
    }

}, { collection: "broadcast" });

exports.courseBroadcast_schema = courseBroadcast_schema;

