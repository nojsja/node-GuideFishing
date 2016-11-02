/**
 * Created by yangw on 2016/10/20.
 * 这是一个计算得分的工厂方法,
 * 得分的模式分为几个类型: MA, MB, MC
 * 工厂能根据具体指定的testType类型来创建对应的得分方法,
 * 1.testType: common -- 常规得分方式
 * (1)得分类型CA: A选项得正分,B选项不得分,C选项的负分
 * (2)得分类型CB: B选项得正分,C选项不得分,A选项得负分
 * (3)得分类型CC: C选项得正分,A选项不得分,B选型得负分
 * 2.testType: NegaPositive -- 正负得分方式,一个选项得分,另一个选项不得分
 * 3.testType: Category -- 类别得分方式,不以总分为评判标准, 分数是多个维度的, 各个维度得分最高的各自
 * 对应一种类型结果,可以自定义任意多种子类型,每个得分分值可以自己定义
 */

var mongoose = require('mongoose');
var testSchema = require('./test_schema.js').testSchema;

/* 创建工厂方法 */
var scoreFactory = function (submitData, callback) {
    /* scoreModeInfo包含几个属性:scoreMode -- 得分模式,
    *  scoreSection -- 得分段信息
    *  scoreValue -- 得分基值 */

    //查找文档条件
    var condition = {
        testType: submitData.testType,
        testTitle: submitData.testTitle
    };
    //提交的选项数据
    var choiseArray = submitData.choiseArray;
    var that = this;
    scoreFactory.getScoreModeInfo(condition, function (scoreModeInfo) {

        //读取失败
        if(!scoreModeInfo){
            return callback({
                error: true,
                totalScore: 0,
                result: "no info."
            });
        }
        //安全检测,防止用户创建错误,比如 var fac = scoreFactory(data); -- 缺少new关键字
        if(that instanceof scoreFactory) {
            //返回评测的结果信息
            var result = that[scoreModeInfo.scoreMode](choiseArray, scoreModeInfo);
            callback(result);
        }else {
            new scoreFactory(submitData);
        }
    });
};

/* 创建各个工厂中的组件,具体化来说就是各种得分方法,
 * 各个得分方法都会接收testType得分信息和一个需要被
 * 统计所得分数的提交选项对象,并最终返回一个测评结果*/
scoreFactory.prototype = {

    //常规的ABC统计方法
    //两个参数分别表示用户提交选项的对象数组,
    //scoreModeInfo里面包含用于统计得分的信息
    Common: function (choiseArray, scoreModeInfo) {
        return Common(choiseArray, scoreModeInfo);
    },

    //YES or NO 统计方法, 只有两个选项
    NegaPositive: function (choiseArray, scoreModeInfo) {
        return NegaPasitive(choiseArray, scoreModeInfo);
    },
    
    // 分类别的计算方法, 存在多个维度
    Category: function (choiseArray, scoreModeInfo) {
        return Category(choiseArray, scoreModeInfo);
    }
};

/* 得到某套题的得分方法和得分分段信息以及得分分值 */
scoreFactory.getScoreModeInfo = function (condition, callback) {

    //连接数据库准备
    var db = mongoose.connect('mongodb://localhost/QN');
    var Tests = mongoose.model('Tests', testSchema);
    //打开数据库连接
    mongoose.connection.once('open', function () {
        var query = Tests.findOne();
        //筛选条件
        query.where(condition);
        //筛选项目
        query.select({
            scoreMode: 1,
            scoreValue: 1,
            scoreSection: 1,
            categorySection: 1
        });
        //执行查询
        query.exec(function (err, doc) {
            if(err){
                console.log("getScoreModeInfo error");
                mongoose.disconnect();
                //返回空值,表示服务器内部错误
                return callback();
            }
            mongoose.disconnect();
            //返回需要的评测依赖信息
            callback({
                scoreMode: doc.scoreMode,
                scoreValue: doc.scoreValue,
                scoreSection: doc.scoreSection,
                categorySection: doc.categorySection || null
            });

        });
    });
};

/* Common算法的得分计算方式 */
var Common = function (choiseArray, scoreModeInfo) {
    var scoreValue = scoreModeInfo.scoreValue;
    var scoreSection = scoreModeInfo.scoreSection;
    //总得分
    var totalScore = 0;
    //总的评测结果
    for(var choise in choiseArray) {
        switch (choiseArray[choise].itemMode) {
            case "CA":
                if (choiseArray[choise].choiseTag == "A") {
                    totalScore += scoreValue;
                } else if (choiseArray[choise].choiseTag == "B") {
                    totalScore += 0;
                } else if (choiseArray[choise].choiseTag == "C") {
                    totalScore -= scoreValue;
                }
                break;
            case "CB":
                if (choiseArray[choise].choiseTag == "A") {
                    totalScore -= scoreValue;
                } else if (choiseArray[choise].choiseTag == "B") {
                    totalScore += scoreValue;
                } else if (choiseArray[choise].choiseTag == "C") {
                    totalScore += 0;
                }
                break;
            case "CC":
                if (choiseArray[choise].choiseTag == "A") {
                    totalScore += 0;
                } else if (choiseArray[choise].choiseTag == "B") {
                    totalScore -= scoreValue;
                } else if (choiseArray[choise].choiseTag == "C") {
                    totalScore += scoreValue;
                }
                break;
            default:
                break;
        }
    }
    //根据分数段得出统计结果
    var testResult = {
        error: false,
        totalScore: 0,
        result: "no info."
    };
    for(var section in scoreSection){
        console.log(scoreSection[section].scoreHead + ' ' + scoreSection[section].scoreTail);
        if((totalScore >= scoreSection[section].scoreHead) && (totalScore <= scoreSection[section].scoreTail)){
            /* 分布在此区间则返回相对的结果 */
            testResult.totalScore = totalScore;
            testResult.result = scoreSection[section].result;
            console.log(scoreSection[section].result);
            break;
        }
    }
    //未分布于相应的分数段
    return testResult;
};


/* NegaPositive算法的得分计算方式 */
var NegaPasitive = function (choiseArray, scoreModeInfo) {

    var scoreValue = scoreModeInfo.scoreValue;
    var scoreSection = scoreModeInfo.scoreSection;
    //总得分
    var totalScore = 0;
    //总的评测结果
    for(var choise in choiseArray) {
        switch (choiseArray[choise].itemMode) {
            case "Negative":
                if (choiseArray[choise].choiseTag == "A") {
                    totalScore += scoreValue * 5;
                } else if (choiseArray[choise].choiseTag == "B") {
                    totalScore += scoreValue * 4;
                } else if (choiseArray[choise].choiseTag == "C") {
                    totalScore += scoreValue * 3;
                }else if (choiseArray[choise].choiseTag == "D") {
                    totalScore += scoreValue * 2;
                }else if (choiseArray[choise].choiseTag == "E") {
                    totalScore += scoreValue * 1;
                }
                break;
            case "Positive":
                if (choiseArray[choise].choiseTag == "A") {
                    totalScore += scoreValue * 1;
                } else if (choiseArray[choise].choiseTag == "B") {
                    totalScore += scoreValue * 2;
                } else if (choiseArray[choise].choiseTag == "C") {
                    totalScore += scoreValue * 3;
                } else if (choiseArray[choise].choiseTag == "D") {
                    totalScore += scoreValue * 4;
                }else if (choiseArray[choise].choiseTag == "E") {
                    totalScore += scoreValue * 5;
                }
                break;
            default:
                break;
        }
    }
    //根据分数段得出统计结果
    var testResult = {
        error: false,
        totalScore: 0,
        result: "no info."
    };
    for(var section in scoreSection){
        console.log(scoreSection[section].scoreHead + ' ' + scoreSection[section].scoreTail);
        if((totalScore >= scoreSection[section].scoreHead) && (totalScore <= scoreSection[section].scoreTail)){
            /* 分布在此区间则返回相对的结果 */
            testResult.totalScore = totalScore;
            testResult.result = scoreSection[section].result;
            console.log(scoreSection[section].result);
            break;
        }
    }
    //未分布于相应的分数段
    return testResult;
};

/* 分类别的得分模式(自由度最高,最复杂) */
var Category = function (choiseArray, scoreModeInfo) {

    // 得分权值
    var scoreValue = scoreModeInfo.scoreValue;

    // 子模式分类信息,数组类型,里面存了每种类型的名字和描述
    var categorySection = scoreModeInfo.categorySection;
    // 正向得分的数组和反向得分的数组
    var positiveScoreArray = {
        A: 1, B: 2, C: 3, D: 4, E: 5
    };
    var negativeScoreArray = {
        A: 5, B: 4, C: 3, D: 2, E: 1
    };
    // 得分统计结果的对象
    var scoreResult = {};

    //总的评测结果
    // 遍历所有选择结果
    for(var index in choiseArray) {
        // 判断是否是自定义得分模式
        if(choiseArray[index].scoreDefine){
            console.log('defined');
            // 自定义得分
            // itemMode 子类型
            var itemMode = choiseArray[index].itemMode;
            if(!scoreResult[itemMode]){
                scoreResult[itemMode] = {
                    score: choiseArray[index].choiseValue
                };
            }else {
                scoreResult[itemMode].score += choiseArray[index].choiseValue;
            }

        }else {
            // 普通得分模式
            // 得分所属类型
            var itemMode = choiseArray[index].itemMode;
            // 计算得分的方法
            var otherMode = choiseArray[index].otherMode;
            // 选项标签
            var choiseTag = choiseArray[index].choiseTag;
            switch (otherMode){
                // 反向得分
                case 'negativeType':
                    if(!scoreResult[itemMode]){
                        scoreResult[itemMode] = {
                            score: negativeScoreArray[choiseTag] * scoreValue
                        };
                    }else {
                        scoreResult[itemMode].score += negativeScoreArray[choiseTag] * scoreValue;
                    }
                    break;
                // 正向计分
                case 'positiveType':
                    if(!scoreResult[itemMode]){
                        scoreResult[itemMode] = {
                            score: positiveScoreArray[choiseTag] * scoreValue
                        };
                    }else {
                        scoreResult[itemMode].score += positiveScoreArray[choiseTag] * scoreValue;
                    }
                    break;
                default:
                    break;
            }
        }
    }


    //根据分数段得出统计结果
    var testResult = {
        error: false,
        totalScore: 0,
        result: "no info."
    };

    // 比较统计结果
    // 记录最大结果的子类型
    var maxItemMode = null;
    var maxScore = 0;
    // 选出最大的
    for(var itemMode in scoreResult){
        (function (itemMode) {
            console.log(itemMode + " " + scoreResult[itemMode].score);
            if(parseInt(scoreResult[itemMode].score) > parseInt(maxScore)) {
                maxScore = scoreResult[itemMode].score;
                maxItemMode = itemMode;
                console.log('max score.' + maxItemMode);
            }
        })(itemMode);
    }

    // 返回最大结果
    for(var index in categorySection){
        if(categorySection[index].categoryMode == maxItemMode){
            testResult.result = categorySection[index].categoryDescribe;
            break;
        }
    }

    //未分布于相应的分数段
    return testResult;
};

module.exports = scoreFactory;












































