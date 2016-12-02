/**
 * Created by yangw on 2016/11/8.
 * 存储课程数据的数据库模式
 */

/*
* 注:
* courseName -- 课程名字
 * courseType -- 课程类型, 课程类型如下:
 *  jobFound(求职秘籍), jobSkill(职场技能),
 *  software(软件技巧), english(英语进阶), personal(个人提升)
 * courseAbstract -- 课程概述
 * courseOrigin -- 未经编辑的课程数据对象(课程直播的时候录制,包含音频,视频,图片和文本对象的地址)
 * courseOrigin 在编辑课程和直播课程预览的时候可以用到, 多媒体对象包括三个属性: 名字,
 *  地址和发布日期, 普通文本对象包含两个属性: 文本内容和发布时间
 * isReady -- 课程是否可见,课程分为三个状态:直播状态,
 *  可编辑状态(用户不可见,非正式课程)和完成状态(用户可见, 正式发布的课程)
 * isBroadcast -- 普通的课程和直播课程(呈现形式不一样)
 * courseContent -- 课程内容(富文本格式)
 * teacher -- 课程讲师
 * passworsd -- 讲师登录密码
 * date -- 发布日期
 * price -- 课程价格
 * clickRate -- 课程点击量
 * */

/* 引入mongoose */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var courseSchema = new Schema({

    courseName: {
        type: String,
        unique: true,
        required: true
    },
    courseType: String,
    courseAbstract: String,
    isReady: {
        type: Boolean,
        required: true
    },
    isBroadcast: {
        type: Boolean,
        required: true
    },
    courseOrigin: [{
        messageType: String,
        date: String,
        from: String,
        msg: String,
        url: String
    }],

    courseContent: String,
    teacher: String,
    password: String,
    date: String,
    price: String,
    clickRate: String

}, { collection: "course" });

exports.courseSchema = courseSchema;