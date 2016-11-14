/**
 * Created by yangw on 2016/11/6.
 * 用于表示公司招聘的模式
 * 包含公司信息和招聘信息
 */

/**
 * 注:
 * company -- 公司名称
 * introduction -- 公司介绍
 * position -- 公司位置
 * imageUrls -- 公司介绍图片
 * videoUrls -- 公司的视频介绍
 * */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var companySchema = new Schema( {

    company: {type: String, required: true, unique: true},
    introduction: String,
    position: String,
    imageUrls: [{image: String}],
    videoUrls: [{video: String}],

}, {collection: 'company'} );

exports.companySchema = companySchema;