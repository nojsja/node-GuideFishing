/**
 * Created by yangw on 2016/11/8.
 * 存储课程数据的数据库模式
 */

/*
* 注:
* name -- 音频名
* url -- 地址
* courseName -- 所属课程名
*
 * */

/* 引入mongoose */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var audioSchema = new Schema({

    name: {type: String, required: true},
    url: {type: String , required: true},
    courseName: {type: String, required: true}

}, { collection: "audio" });

exports.audioSchema = audioSchema;