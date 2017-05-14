/**
 * Created by yangw on 2016/10/19.
 * 测评题目的数据库模式
 */

/*
* 注:
* collection -- 存入的表名
* testType -- 评测类型,例如人格测试,性格测试, 情感测试, 交际测试等等
* testTags -- 测评标签(与课程标签相关，用来做课程推荐)
* testGroup -- 存储一组题目的所有题目,每个题目包含题目描述itemTitle,
* 题号itemNumber,和选项数据itemChoise,选项数据包含选号和选项两个字段
* itemTitle -- 本道题的标题, itemNumber --本道题的编号,
* itemMode -- 本小题隶属的一个类型的子类型,
* otherMode -- 本小题还可以包含的其它一般子类型,比如negative和positive(正序和倒序),
* 其它模式的得分是基于scoreValue来计算的
* itemChoise -- 本道题所包含的选项, 隶属于Common模式的每道题可以单独定制信息
* choiseTag -- 选项标志,比如ABC, choiseContent -- 各个选项的内容, 比如A:符合,B:一般,C:不符合
* choiseValue -- 自定义模式下每个选项自定义的得分
* scoreMode -- 该组题目的得分模式
* clickRate -- 点击量
* abstract -- 该组题目的简要描述
* testTitle -- 该组题目的总标题
* frequency -- 该组题目的点击量
* scoreSection -- 该组题目的得分结果分段
* scoreHead -- 该分段起始处, scoreTail -- 该分段结束处, result -- 该分段的评测结果
* date -- 创建题目的日期
* scoreValue -- 单次得分的分值,用于最后累加计算得分, 必须为绝对值
* danmu -- 每个课程包含的弹幕内容
*  text -- 弹幕文字
*  color -- 弹幕颜色
*  user -- 发送者
*  date -- 发送日期
* categorySection -- 类型分段
* categoryMode,categoryDescribe 类型和描述
* examine -- 测评检查字段
*  pass -- 是否检查通过（类型为true则正式发表）
*  adminAccount -- 检查者管理员账户
*  date -- 检查通过的日期
*  teacher -- 发布测评的人
*/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var testSchema = new Schema({

    testType: {type: String, required: true},
    testTags: [{type: String}],
    teacher: {type: String, required: true},
    date: String,
    testGroup: [{
        scoreDefine: Boolean,
        itemTitle: String,
        itemNumber: Number,
        itemMode: String,
        otherMode: String,
        itemChoise: [{choiseTag: String, choiseContent: String, choiseValue: Number}]
    }],
    scoreMode: String,
    scoreValue: Number,
    examine: {
        status: {type: String, required: true},
        adminAccount: {type: String, required: true},
        examineAccount: {type: String}
    },
    abstract: String,
    clickRate: Number,
    testTitle: {type: String, required: true, unique: true},
    frequency: Number,
    danmu: [{
        text: {type: String, required: true},
        user: {type: String, required: true},
        color: String,
        date: String,
    }],
    scoreSection: [{
        scoreHead: Number,
        scoreTail: Number,
        result: String,
    }],
    categorySection: [{
        categoryMode: String,
        categoryDescribe: String
    }]

}, {collection: 'test'});

exports.testSchema = testSchema;