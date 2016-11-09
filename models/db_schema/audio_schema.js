/**
 * Created by yangw on 2016/11/8.
 * 存储课程数据的数据库模式
 */

/*
* 注:
*
 * */

/* 引入mongoose */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var audioSchema = new Schema({

    name: {type: String, required: true},
    url: {type: String , required: true}

}, { collection: "audio" });

exports.audioSchema = audioSchema;