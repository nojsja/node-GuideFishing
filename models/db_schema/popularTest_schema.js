/**
 * Created by yangw on 2016/10/21.
 * 受欢迎的评测题目模式
 * testType -- 测试类型
 * testTitle -- 测试题目(主键)
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var popularTestSchema = new Schema({

    testType: String,
    testTitle: {
        type: String,
        unique: true,
        required: true
    }
},{collection: 'popular_test'});

exports.popularTestSchema = popularTestSchema;