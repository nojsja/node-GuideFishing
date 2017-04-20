/**
 * Created by yangw on 2016/11/11.
 * app应用入口文件
 */
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// 定时器
var schedule = require('node-schedule');

//数据库定时任务
var MongoSchedule = require('./models/MongoSchedule.js');

// 初始化数据库
// 引入的时候模块就已经被初始化了
var Mongoose = require('./models/tools/Mongoose');
// 引入MongoSession
var MongoSession = require('./models/tools/MongoSession');

/* 引入路由 */
var test_index = require('./routes/test_index');
var test = require('./routes/test');
var test_admin = require('./routes/test_admin');
var recruitment = require('./routes/recruitment');
var course = require('./routes/course');
var course_admin = require('./routes/course_admin');
var course_broadcast = require('./routes/course_broadcast');
var user = require('./routes/user');
var admin = require('./routes/admin');
var GuideFishing_index = require('./routes/GuideFishing_index');
// 测试路由
var TEMP = require('./routes/TEMP');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon3.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// session 持久化
MongoSession(app);

//建立路由规则
GuideFishing_index(app);
user(app);
test_index(app);
test(app);
test_admin(app);
recruitment(app);
course(app);
course_admin(app);
course_broadcast(app);
admin(app);
TEMP(app);

//node-schedule定时执行任务,更新popolar表,每天的凌晨零点
var rule = new schedule.RecurrenceRule()
rule.dayOfWeek = new schedule.Range(0,6);
rule.hour = 0;
rule.minute = 0;
var scheduleJob = schedule.scheduleJob(rule, MongoSchedule);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
