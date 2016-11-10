/**
 * Created by yangw on 2016/11/8.
 * 课程后台管理页面
 */

// 文件上传
var UploadAction = require('../models/CourseUploadAction');
// 文件存储
var UploadData = require('../models/CourseUploadData');

function course_admin(app) {
    
    // 进入所有课程管理后台
    app.get('/course/admin/manager', function (req, res) {

        res.render('course_adminManager', {
            title: "课程管理"
        });
    });

    app.get('/course/admin/edit', function (req, res) {

        res.render('course_adminEdit', {
            title: "课程编辑"
        });
    });
    
    // 课程数据文件上传
    app.post('/course/data/upload/:courseName', function (req, res) {

        UploadAction(req, res);
    });

    // 指定类型的上传文件预览
    app.post('/course/data/preview/:courseName', function (req,res) {

        // 预览数据的类型和所属课程
        var type = req.body.type;
        var courseName = req.params.courseName;

        var condition = {
            type: type,
            courseName: courseName
        };
        
        UploadData.previewData(condition, function (err, dataArray) {
            if(err){
                return res.json( JSON.stringify({
                    error: err,
                    dataArray: dataArray
                }) );
            }
            res.json( JSON.stringify({
                error: null,
                type: condition.type,
                dataArray: dataArray
            }) );
        });

    });
}

module.exports = course_admin;
