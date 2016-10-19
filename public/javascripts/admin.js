/**
 * Created by yangw on 2016/10/19.
 * 管理员操作页面脚本,
 * 管理员能够创建,修改,删除和更新题目.
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
