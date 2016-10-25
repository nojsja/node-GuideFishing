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
 * 3.testType: .....后期逐步补充,所以要求程序可拓展
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
    }
    ,
    //YES or NO 统计方法, 只有两个选项
    NegaPositive: function (choiseArray, scoreModeInfo) {

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
            scoreSection: 1
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
                scoreSection: doc.scoreSection
            });

        });
    });
};

module.exports = scoreFactory;