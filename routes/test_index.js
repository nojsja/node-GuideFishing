/**
 * 主页路由*/

/* 引入数据库模式 */
var AllTest = require('../models/AllTest.js');
var ReadTestType = require('../models/ReadTypeImg');

function index(app) {

    /* 获取评测主页 */
    app.get('/test/index', function (req, res) {
        res.render('test_index', {
            title: '评测系统主页'
        });
    });
    
    /* 读取评测列表,以JSON对象对象数组传递 */
    app.post('/test/readList', function (req, res) {

        var condition = {};
        // 图片地址
        var typeImgUrl = {};
        // 读取地址
        var readUrl = './public/images/testType/';
        // 返回的静态地址
        var visitUrl = '/images/testType/';
        ReadTestType(readUrl, visitUrl, function (data) {
            typeImgUrl = data;
        });
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

        console.log('read list condition' + JSON.stringify(condition));

        AllTest.readList(condition, function (err, testArray) {
           if(err) {
               console.log('readList error.');
               return res.json(JSON.stringify({
                   error: err,
               }));
           }
           console.log('readList success.');
            res.json(JSON.stringify({
                testArray: testArray,
                typeImgUrl: typeImgUrl
            }));
        });
    });

    /* 读取热门内容列表 */
    app.post('/test/readHot', function (req, res) {

    });
}

module.exports = index;
