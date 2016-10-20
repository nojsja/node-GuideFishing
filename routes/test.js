
/**
 * Created by yangw on 2016/10/19.
 * 评测题目相关的路由
 */

/* 引入工厂模式 */
var scoreFactory = require('../models/ScoreFactory.js');

function test(app) {

    /* 获取测试detail页面 */
    app.get('/testDetail/:testType/:testTitle', function (req, res) {

        res.render('testDetail', {
            title: '评测详情'
        });
    });

    /* 获取测试视图主页*/
    app.get('/testView/:testType/:testTitle', function (req, res) {

       res.render('testView', {
           title: '评测页面'
       });
    });

    /* 提交评测结果 */
    app.post('/submit', function (req, res) {

        /* 评测结果伪数据 */
        var submitData = {};
        submitData.choiseArray = [
            {
                choiseTag: "A",
                itemMode: "CA"
            },
            {
                choiseTag: "B",
                itemMode: "CB"
            },
            {
                choiseTag: "C",
                itemMode: "CC"
            }
        ];
        submitData.testType = "character";
        submitData.testTitle = "这是这组性格测试的标题";

        var testResult = new scoreFactory(submitData);
        console.log('评测结果: ' + testResult);
        //返回评测结果的json数据,包括评测得分和结果分析
        res.json(JSON.stringify(testResult));
    });
}

module.exports = test;