/**
 * Created by yangw on 2016/11/8.
 * 课程参阅界面
 */

$(function () {



    // 离开警告
    // window.addEventListener('beforeunload', function (event) {
    //     event.returnValue = "警告";
    // });

});

/* 页面全局变量 */
var viewAction = {};

/* 初始化UEeditor */
viewAction.ueditorInit = function() {

    //课程内容编辑器
    this.ueContent = UE.getEditor('editorContent', {

        autoHeightEnabled : true,
        autoFloatEnabled : true
    });

};

/* 模态弹窗 */
viewAction.modalWindow = function(text) {

    $('.modal-body').text(text);
    $('#modalWindow').modal("show", {
        backdrop : true,
        keyboard : true
    });
};