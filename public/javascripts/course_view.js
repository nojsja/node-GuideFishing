/**
 * Created by yangw on 2016/11/8.
 * 课程参阅界面
 */

$(function () {

    // 获取课程数据
    ViewAction.readCourseContent();
});

/* 页面全局变量 */
var ViewAction = {};

/* 读取一篇文章的内容 */
ViewAction.readCourseContent = function () {

    var url = '/course/view/readOneCourse';
    var courseName = $('#courseName').text().trim();
    var courseType = $('#courseType').text().trim();

    $.post(url, {
        courseName: courseName,
        courseType: courseType
    }, function (JSONdata) {
        ViewAction.updateCourse(JSONdata);
    }, "JSON");
};

/* 更新课程内容 */
ViewAction.updateCourse = function (JSONdata) {

    var JSONobject = JSON.parse(JSONdata);
    console.log(JSONobject);
    if(JSONobject.error){
        return ViewAction.modalWindow('Sorry,发生错误: ' + JSONobject.error);
    }
    /* 课程内容主体 */
    var $courseContent = $(JSONobject.courseContent);
    $('#courseContent').append($courseContent);
    /* 讲师 */
    var teacher = JSONobject.teacher;
    $('#teacher').text(teacher);
    /* 日期 */
    var date  = JSONobject.date;
    $('#date').text(date);
};

/* 模态弹窗 */
ViewAction.modalWindow = function(text) {

    $('.modal-body').text(text);
    $('#modalWindow').modal("show", {
        backdrop : true,
        keyboard : true
    });
};