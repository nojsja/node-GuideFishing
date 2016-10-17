/**
 * Created by yangw on 2016/10/12.
 */
/* 初始化函数 */
$(function () {

    $('.header-label').click(function () {
        indexAction.headerDown = !indexAction.headerDown;
        $('.type-item').slideToggle();
        if(indexAction.headerDown) {
            $('.header-label > span').prop('class', 'glyphicon glyphicon-chevron-up');
        }else {
            $('.header-label > span').prop('class', 'glyphicon glyphicon-chevron-down');
        }
    });
});

/* 页面全局变量 */
var indexAction = {
    headerDown : false
};
