/**
 * Created by yangw on 2017/4/21.
 */

var MongoSchedule = require('../models/MongoSchedule');

function TEMP(app) {

    /* 新建管理员账号 */
    app.get('/admin/create', function (req, res) {

        var newAdmin = new Admin({
            account: "yangwei@outlook.com",
            password: "yangwei020154",
            nickName: "Johnson2",
            rank: 0,
            examineType: null
        });

        newAdmin.save(function (err, isPass) {

            if(err){
                return res.json( JSON.stringify({
                    isError: true,
                    error: err
                }) );
            }
            if(isPass){
                console.log('0级管理员创建成功！');
                res.json( JSON.stringify({
                    isError: false,
                    isPass: true
                }) );
            }else {
                console.log('0级管理员创建失败！');
                res.json( JSON.stringify({
                    isError: true,
                    isPass: false
                }) );
            }
        });
    });

    // 测试更新热门数据
    app.get('/admin/updateHot', function (req, res) {
        MongoSchedule();
    });

    // 浏览器console数据
    app.post('/mconsole', function (req, res) {

        console.log('-----------------MCONSOLE_START----------------');

        function objLog(obj) {
            if(typeof obj == 'string'){
                return console.log(obj);
            }
            for(var attr in obj){
                console.log(attr + ": " + obj[attr]);
            }

        }
        objLog(req.body.data);

        console.log('-----------------MCONSOLE_END-----------------');

        res.send('ok');
    });

}

module.exports = TEMP;