/**
 * Created by yangw on 2016/11/8.
 * 存储图片的数据库模式
 */

/**
 * 注:
 * imageName -- 图片名字
 * imageUrl -- 图片地址
 * courseName -- 所属课程名
 * */

/* 引入mongoose */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var imageSchema = new Schema({

    name: { type: String, required: true },
    url: {type: String, required: true},
    courseName: {type: String, required: true}

}, { collection: "image" });

exports.imageSchema = imageSchema;