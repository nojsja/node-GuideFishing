/**
 * Created by yangw on 2016/11/8.
 * 获取课程详情
 */


$(function () {

    //开始测试
    $('#startDiv').click(function () {
        var courseType = $('.detail-head-type').text();
        var courseName = $('.detail-head-title').text();
        window.location.href = "/course/courseView/" + courseType + "/" + courseName;
    });
});

/* 页面action对象 */
var detailAction = {};

