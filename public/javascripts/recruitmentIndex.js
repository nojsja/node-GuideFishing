/**
 * Created by yangw on 2016/11/3.
 * 企业招聘相关主页
 */

/* 初始化函数 */
$(function () {

    RecruitIndex.getAllCompany();

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

/* 页面全局变量 */
var RecruitIndex = {};

/* 获取所有公司列表 */
RecruitIndex.getAllCompany = function () {

    var url = '/recruitment/index'
    $.post(url, { action: 'getCompanyList'}, function (JSONdata) {

        // 更新页面
        RecruitIndex.updateCompanyPage(JSONdata);
    }, "JSON");
};

/* 更新公司列表 */
RecruitIndex.updateCompanyPage = function (JSONdata) {

    var JSONobject = JSON.parse(JSONdata);
    if(JSONobject.error){
        return alert('发生错误!');
    }

    var companys = JSONobject.companys;
    // 删除页面缓存
    $('.total').children().remove();

    for(var index in companys){

        var company = companys[index].company;
        var $companyBorder = $('<div class="company-border">');
        var $companyItem = $('<div class="company-item">');
        var $shadow = $('<div class="shadow">');
        var $a = $('<a class="company-title">');
        $a.attr('href', '/recruitment/detail/' + company)
            .text(company);

        $companyItem.append($shadow)
            .append($a)
            .appendTo($companyBorder);

        $('.total').append($companyBorder);

    }
};