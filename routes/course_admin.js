/**
 * Created by yangw on 2016/11/8.
 * 课程后台管理页面
 */

// 文件上传
var UploadAction = require('../models/CourseUploadAction');
// 文件存储
var UploadData = require('../models/CourseUploadData');
// 存储课程
var Course = require('../models/Course');

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
    
    // 单个课程数据存储
    app.post('/course/admin/save', function (req, res) {

        // 字段数组
        var elementArary = ['courseName', 'courseType', 'courseAbstract',
        'courseContent', 'teacher', 'price'];
        // 课程数据
        var course = {};
        // 加载条件数据
        for(var part in req.body){
            if(arrayContain(elementArary, part)){
                course[part] = req.body[part];
            }
        }

        var newCourse = new Course(course);
        newCourse.save(function (err) {
            if(err){
                return res.json( JSON.stringify({
                    error: err
                }) );
            }
            res.json( JSON.stringify({
                error: null
            }) );
        });

        function arrayContain(array, element) {

            for(var i = 0; i < array.length; i++){
                if(array[i] == element){
                    return true;
                }
            }
            return false;
        };
    });
    
    // 获取需要导入的课程数据
    app.post('/course/admin/load/:courseName', function (req, res) {

        // 筛选条件
        var condition = {
            courseName: req.params.courseName
        };
        Course.getLoadData(condition, function (err, courseData) {

            if(err){
                console.log('获取导入课程的数据出错!');
                return res.json(JSON.stringify({
                    isError: true,
                    error: err
                }));
            }
            // 向客户端发回数据
            res.json(JSON.stringify({
                isError: false,
                loadData: courseData
            }));
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

        console.log('condition: ' + condition);

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
