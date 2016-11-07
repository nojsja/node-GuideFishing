/**
 * Created by yangw on 2016/11/6.
 * 存储招聘信息模式
 */

/**
 * 注:
 * company -- 公司名
 * recruitments -- 提供的所有职位
 * job -- 职位名称
 * dutys -- 所有职责
 * skills -- 所有所需技能
 * treatments -- 所有福利待遇
 * other -- 其它要求信息
 * */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var recruitmentSchema = new Schema( {

    company: String,
    date: String,
    recruitments: [{
        job: String,
        dutys: [{duty: String}],
        skills: [{skill: String}],
        treatments: [{treatment: String}],
        other: String
    }]

} , { collection: 'recruitment' });

exports.recruitmentSchema = recruitmentSchema;
