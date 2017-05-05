/**
 * Created by yangw on 2017/5/1.
 * 存储课程和测评中英文对照信息以及其它信息
 * contentType -- 内容类型
 *  test -- 测评的一些中英文对照
 *  course -- 课程的一些中英文对照
 *  admin -- 管理员的一些中英文对照
 * pattern -- 具体的对应模式
 *  english -- 英文名称
 *  china -- 中文名称
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var infoSchema = new Schema({

    contentType: {type: String, required: true, unique: true},
    pattern: [{
        english: {type: String, required: true},
        china: {type: String, required: true}
    }]

}, {collection: "info"});

exports.infoSchema = infoSchema;
