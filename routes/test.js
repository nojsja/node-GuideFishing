
/**
 * Created by yangw on 2016/10/19.
 * 评测题目相关的路由
 */

/**
 * 评测结果数据格式:
 * submitData.choiseArray = [
    {choiseTag: "A", itemMode: "CA"},
    {choiseTag: "B", itemMode: "CB"},
    {choiseTag: "C", itemMode: "CC"}
 ];
 */

/* 引入工厂模式 */
var scoreFactory = require('../models/ScoreFactory.js');
var AllTest = require('../models/AllTest.js');

/* 测试题目路由 */
function test(app) {

    /* 获取测试detail页面 */
    app.get('/test/testDetail/:testType/:testTitle', function (req, res) {

        var condition = {
            testTitle: req.params.testTitle,
            testType: req.params.testType
        };
        AllTest.getDetail(condition, function (err, doc) {
            // 数据监测
           if(err || !doc.testTitle || !doc.testType) {
               return res.render('testDetail', {
                   title: '评测详情',
                   testTitle: 'error!!!',
                   testType: 'error!!!',
                   abstract: 'error!!!',
                   date: 'error!!!',
                   frequency: 'error!!!'
               });
           }
            res.render('testDetail', {
                title: '评测详情',
                testTitle: doc.testTitle,
                testType: doc.testType,
                abstract: doc.abstract,
                date: doc.date,
                frequency: doc.frequency
            });
        });
    });

    /* 获取测试视图主页*/
    app.get('/test/testView/:testType/:testTitle', function (req, res) {

        //评测类型
        var testType = req.params.testType;
        var testTitle = req.params.testTitle;
        //跳转到页面
        res.render('testView', {
            title: '评测页面',
            testType: testType,
            testTitle: testTitle
       });
    });

    /* 获取一组测试题目 */
    app.post('/test/testView/:testType/:testTitle', function (req, res) {

        //筛选条件
        var condition = {
            testType: req.params.testType,
            testTitle: req.params.testTitle
        };
        //得到题目信息
        AllTest.getDetail(condition, function (err, doc) {
            if(err){
                return res.json( JSON.stringify({
                    error: true
                }) );
            }
            //成功读取到后返回本组题目
            return res.json( JSON.stringify({
                testGroup: doc.testGroup
            }) );
        })
    });

    /* 提交评测结果 */
    app.post('/test/submit', function (req, res) {

         // 上传的选项结果
        var submitData = req.body.submitData;

        var testResult = new scoreFactory(submitData, function (resultData) {
            //返回评测结果的json数据,包括评测得分和结果分析
            res.json(JSON.stringify(resultData));
        });
    });
}

module.exports = test;