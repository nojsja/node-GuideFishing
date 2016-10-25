/**
 * Created by yangw on 2016/10/19.
 * 管理员管理评测题目页面
 * 管理员能够在本页面查看所有题目,筛选查看题目,删除题目.
 * 也能够进入下一级页面编辑更新某套评测
 */


/* 页面初始化 */
$(function () {

});

/* 页面对象 */
var adminAction = {};

/* 存入一组数据 */
adminAction.saveTest = function () {
    $.post('/save', {}, function (JSONdata) {
        alert(JSONdata);
    }, "JSON");
};
