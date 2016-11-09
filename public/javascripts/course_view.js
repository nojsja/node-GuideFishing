/**
 * Created by yangw on 2016/11/8.
 * 课程参阅界面
 */

$(function () {

});

/* 页面全局变量 */
var viewAction = {};

/* 模态弹窗 */
viewAction.modalWindow = function(text) {

    $('.modal-body').text(text);
    $('#modalWindow').modal("show", {
        backdrop : true,
        keyboard : true
    });
};