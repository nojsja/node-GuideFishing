/**
 * Created by yangw on 2016/10/19.
 * 管理员相关的路由.
 */

/* 引入数据库模式 */
var AllTest = require('../models/AllTest.js');

function admin(app) {

    /* 获取管理员页面 */
    app.get('/admin', function (req, res) {
        res.render('admin', {
            title: '管理'
        });
    });

    /* 存储一个文档 */
    app.post('/save', function (req, res) {
        var testGroup = {
            testType: "character",
            date: getDate(),
            scoreMode: "MA",
            abstract: "这是一组性格测试的题目集合",
            testTitle: "这是这组性格测试的标题",
            frequency: 2,
            scoreValue: 40,
            scoreSection: [
                {
                    scoreHead: 0,
                    scoreTail: 40,
                    result: "40分和40分以下的结果"
                },{
                    scoreHead: 41,
                    scoreTail: 100,
                    result: "41分到100分的结果"
                }
            ],
            testGroup: [
                {
                    itemTitle: "请选择一个",
                    itemNumber: 1,
                    itemMode: "CA",
                    itemChoise: [
                        {
                            choiseTag: "A",
                            choiseContent: "选项A"
                        },{
                            choiseTag: "B",
                            choiseContent: "选项B"
                        }
                    ]
                },{
                    itemTitle: "请选择一个",
                    itemNumber: 2,
                    itemMode: "CB",
                    itemChoise: [
                        {
                            choiseTag: "A",
                            choiseContent: "选项A"
                        },{
                            choiseTag: "B",
                            choiseContent: "选项B"
                        },
                    ]
                }
            ],
        };
        //创建数据库模式对象
        var newTest = new AllTest(testGroup);
        newTest.save(function (err) {
            if(err){
                console.log("it's error!");
                res.send('ok');
            }else {
                console.log('存储成功!');
                res.send('ok');
            }
        });

        //获取当前日期字符串函数
        function getDate() {
            var dateArray = [];
            var date = new Date();
            var getMonth = (date.getMonth() + 1 < 10) ? ("0" + date.getMonth() + 1) : ("" + date.getMonth() + 1);
            var getDate = (date.getDate() < 10) ? ("0" + date.getDate()) : ("" +date.getDate());

            dateArray.push(date.getFullYear(), "-", getMonth, "-", getDate,
                " ", date.getHours(), ":", date.getMinutes(), ":", date.getSeconds());

            return (dateArray.join(""));
        }
    });

    /* 删除一个文档 */
    app.post('/deleteOne', function (req, res) {

        //必须要获取的文档主键,数据模拟
        var testType = "character";
        var testTitle = "这是这组性格测试的标题";

        AllTest.deleteOneDoc({
            testType: testType,
            testTitle: testTitle
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

    /* 删除多个文档 */
    app.post('/deleteSome', function (req, res) {

        //必须要获取的文档主键,数据模拟
        var testType = "character";
        var testTitle = "这是这组性格测试的标题";

        AllTest.deleteSomeDoc({
            testType: testType,
            testTitle: testTitle
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