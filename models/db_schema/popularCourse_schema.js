/**
 * Created by yangw on 2016/12/5.
 * 热门的课程模式
 * courseName -- 课程名字(主键)
 * courseType -- 课程类型
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var popularCourseSchema = new Schema({

   courseName: {
       type: String,
       required: true,
       unique: true
   },
    courseType: String
}, { collection: "popular_course" });

exports.popularCourseSchema = popularCourseSchema;
