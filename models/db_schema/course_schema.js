/**
 * Created by yangw on 2016/11/8.
 * 存储课程数据的数据库模式
 */

/*
* 注:
* courseName -- 课程名字
 * courseType -- 课程类型, 课程类型如下:
 * jobFound(求职秘籍), jobSkill(职场技能),
 * software(软件技巧), english(英语进阶), personal(个人提升)
 * courseAbstract -- 课程概述
 * courseContent -- 课程内容(富文本格式)
 * teacher -- 课程讲师
 * date -- 发布日期
 * price -- 课程价格
 * clickRate -- 课程点击量
 * */

/* 引入mongoose */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var courseSchema = new Schema({

    courseName: { type: String, unique: true, required: true },
    courseType: String,
    courseAbstract: String,
    courseContent: String,
    teacher: String,
    date: String,
    price: String,
    clickRate: String

}, { collection: "course" });

exports.courseSchema = courseSchema;