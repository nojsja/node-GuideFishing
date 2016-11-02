/**
 * 主页路由*/

/* 引入数据库模式 */
var AllTest = require('../models/AllTest.js');

function index(app) {

    /* 获取评测主页 */
    app.get('/test', function (req, res) {
        res.render('index', {
            title: '评测系统主页'
        });
    });
    
    /* 读取评测列表,以JSON对象对象数组传递 */
    app.post('/test/readTestList', function (req, res) {

        var condition = {};
        if(req.body.testTitle) {
            condition.testTitle = req.body.testTitle;
        }
        //筛选的读取题目类型
        if(req.body.testType != "ALL"){
            condition.testType = req.body.testType;
        }
        if(req.body.skip){
            condition.skip = req.body.skip;
        }
        if(req.body.limit){
            condition.limit = req.body.limit;
        }
        if(req.body.select){
            condition.select = req.body.select;
        }
        if(req.body.testTypeArray){
            condition.testTypeArray = req.body.testTypeArray;
        }

        console.log("筛选条件: " + JSON.stringify(condition));

        AllTest.readTestList(condition, function (err, testArray) {
           if(err) {
               console.log('readTestList error.');
               return res.json(JSON.stringify({
                   error: err,
               }));
           }
           console.log('readTestList success.');
            res.json(JSON.stringify({
                testArray: testArray
            }));
        });
    });

    /* 读取热门内容列表 */
    app.post('/test/readHot', function (req, res) {
        
    });
}

module.exports = index;
