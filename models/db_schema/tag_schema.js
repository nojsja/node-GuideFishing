/**
 * Created by yangw on 2017/3/30.
 */

/* 内容标签的mongoose模式  -- 用于做课程和测评相关推荐
 * tagName -- 标签名字
 * tagContent -- 包含的所有内容的title 和 name
 *  tagType -- test/course
 *  contentType -- 内容类型
 *  contentName -- 内容名字
 * */

var Schema = require('mongoose').Schema;

var tagSchema = new Schema({
    tagName: { type: String, unique: true, required: true},
    tagContent: [{
        tagType: String,
        contentType: { type: String, required: true },
        contentName: { type: String, required: true }
    }]

}, { collection: "tag" });

exports.tagSchema = tagSchema;