/**
 * Created by yangw on 2016/10/19.
 * 测评题目的数据库模式
 */

/*
* 注:
* testType -- 评测类型,例如人格测试,性格测试等等
* testGroup -- 存储一组题目的所有题目,每个题目包含题目描述itemTitle,题号itemNumber,和选项数据itemChoise,选项数据包含选号和选项两个字段
* scoreMode -- 该组题目的得分模式
* abstract -- 该组题目的简要描述
* testTitle -- 该组题目的总标题
* frequency -- 该组题目的点击量
* scoreSection -- 该组题目的得分结果分段
*/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var testSchema = new Schema({
    testType: {type: String, required: true, unique: true},
    testGroup: [{
        itemTitle: String,
        itemNumber: Number,
        itemChoise: [{choiseTag: String, choiseContent: String}]
    }],
    scoreMode: String,
    abstract: String,
    testTitle: String,
    frequency: Number,
    scoreSection: [{
        score: Number,
        result: String,
    }]
}, {collection: 'tests'});

exports.testSchema = testSchema;