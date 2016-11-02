/**
 * Created by yangw on 2016/10/19.
 * 测评题目详情介绍页面,
 * 可以获取某一个测评集合的详细信息,
 * 把轮廓题目类型,描述,创建日期,点击量等等
 */

$(function () {
    //开始测试
    $('#startDiv').click(function () {
        var testType = $('.detail-head-type').text();
        var testTitle = $('.detail-head-title').text();
        window.location.href = "/test/testView/" + testType + "/" + testTitle;
    });
});

/* 页面action对象 */
var detailAction = {};

