/**
 * Created by yangw on 2016/10/19.
 * 管理员操作相关的路由
 */

/**
 *  获取的题目伪数据
 *  var test = {
    testType: "potential",
    date: getDate(),
    scoreMode: "Common",
    abstract: "这是一组性格测试的题目集合",
    testTitle: "这是这组性格测试的标题4",
    frequency: 2,
    scoreValue: 40,
    scoreSection:
        [{scoreHead: 0, scoreTail: 40, result: "40分和40分以下的结果"},
        {scoreHead: 41, scoreTail: 100, result: "41分到100分的结果"}],
    testGroup:
        [
            {itemTitle: "请选择一个", itemNumber: 1, itemMode: "CA",
            itemChoise: [{choiseTag: "A", choiseContent: "选项A"},{choiseTag: "B", choiseContent: "选项B"}]
            },
            {itemTitle: "请选择一个", itemNumber: 2, itemMode: "CB",
            itemChoise: [{choiseTag: "A", choiseContent: "选项A"},{choiseTag: "B", choiseContent: "选项B"}]
            }
        ],
};
*/

/* 引入数据库模式 */
var AllTest = require('../models/AllTest.js');
var color = require('colors-cli');
var getDate = require('../models/tools/GetDate.js');

/**
 * console.log(color.cyan_bt('颜色测试'));
 * console.log(color.red_bt('颜色测试'));
 * console.log(color.green_bt('颜色测试'));
*/

function admin(app) {

    /* 获取管理员创建页面 */
    app.get('/test/admin/create', function (req, res) {
        res.render('test_adminEdit', {
            title: '创建新的评测'
        });
    });

    /* 获取管理员管理页面 */
    app.get('/test/admin/manager', function (req, res) {
        res.render('test_adminManager', {
            title: '管理所有评测'
        });
    });

    /* 存储一个文档 */
    app.post('/test/save', function (req, res) {

        //文档对象
        var test = {};
        test.testType = req.body.testType;
        test.date = getDate();
        test.scoreMode = req.body.scoreMode;
        test.abstract = req.body.abstract;
        test.testTitle = req.body.testTitle;
        test.frequency = 0;
        test.scoreValue = req.body.scoreValue;
        if(req.body.scoreSection){
            test.scoreSection = req.body.scoreSection;
        }
        if(req.body.categorySection){
            test.categorySection = req.body.categorySection;
        }
        test.testGroup = req.body.testGroup;

        //创建数据库模式对象
        var newTest = new AllTest(test);
        newTest.save(function (err) {
            if(err){
                console.log("it's error!");
                res.json(JSON.stringify({
                    error: true
                }));
            }else {
                console.log('存储成功!');
                /* 成功后返回跳转需要的数据 */
                res.json(JSON.stringify({
                    error: false,
                    courseType: test.courseType,
                    testTitle: test.testTitle
                }));
            }
        });
    });

    /* 删除一个文档 */
    app.post('/test/deleteOne', function (req, res) {

        //必须要获取的文档主键,数据模拟
        var testType = req.body.testType;
        var testTitle = req.body.testTitle;

        AllTest.deleteOneDoc({
            testType: testType,
            testTitle: testTitle
        }, function (err) {
            if(err){
                return res.json(JSON.stringify( {
                    error: err
                } ));
            }
            //成功返回JSON字符串信息
            res.json(JSON.stringify( {
                error: null
            } ));
        });
    });

    /* 删除多个文档 */
    app.post('/test/deleteSome', function (req, res) {

        //必须要获取的文档主键,数据模拟
        var testType = "character";

        AllTest.deleteSomeDoc({
            testType: testType
        }, function (err) {
            if(err){
                return res.json(JSON.stringify( {
                    err: err
                } ));
            }
            //成功返回JSON字符串信息
            res.json(JSON.stringify( {
                err: null
            } ));
        });
    });
}

module.exports = admin;