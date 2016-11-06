/**
 * Created by yangw on 2016/11/3.
 * 企业招聘相关主页
 */

/* 初始化函数 */
$(function () {
   $('.nav-footer-item').click(function () {
       var that = this;
       // jQuery 动画
       $('.content-marker').animate({
          'width': '0'
       }, 'fast', function () {
           var content = $(that).text();
           $('.content-marker').text(content);
       });

       $('.content-marker').animate({
           'width': '100px'
       });
   }); 
});