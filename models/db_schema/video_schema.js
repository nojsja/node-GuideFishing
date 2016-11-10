/**
 * Created by yangw on 2016/11/8.
 * 存储视频地址数据的数据库模式
 */

/**注:
 * videoName -- 视频名字
 * videoUrl -- 视频地址
 * courseName -- 所属课程名
 * */

/* 引入mongoose */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var videoSchema = new Schema({

    name: {type: String, required: true},
    url: {type: String, required: true},
    courseName: {type: String, required: true}

}, { collection: "video" });

exports.videoSchema = videoSchema;