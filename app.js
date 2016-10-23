var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var format = require('util').format;
var bodyParser = require('body-parser');
//定时器
var schedule = require('node-schedule');
//持久化session信息
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
//数据库定时器
var MongoSchedule = require('./models/MongoSchedule.js');
//项目设置
var settings = require('./settings');

/* 引入路由 */
var index = require('./routes/index');
var test = require('./routes/test');
var admin = require('./routes/admin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//session持久化
app.use(session({
        secret: settings.cookieSecret,
        key:settings.db,
        cookie:{
            maxAge:1000*60*60*24*3,
            secure: false
        },
        store: new MongoStore(
            {url:format("mongodb://%s:%s@%s:%s/%s",settings.user, settings.password, settings.host, settings.port, settings.db)}
        ),
        resave: false,
        saveUninitialized: true
    }
));

//建立路由规则
index(app);
test(app);
admin(app);

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
