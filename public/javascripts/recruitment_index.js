/**
 * Created by yangw on 2016/11/3.
 * 企业招聘相关主页
 */

/* 初始化函数 */
$(function () {

    // 页面事件绑定
    RecruitIndexAction.pageEventBand();
    // 获取所有公司数据
    RecruitIndexAction.getAllCompany();

});

/* 页面全局变量 */
var RecruitIndexAction = {};

/* 页面事件绑定 */
RecruitIndexAction.pageEventBand = function () {

    // 页脚点击事件
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
        }, 'fast', function () {

            var action = $(that).attr('target');
            // 跳转页面
            RecruitIndexAction.redirect(action);
        });
    });


};

/* 页面跳转 */
RecruitIndexAction.redirect = function (action) {

    // 动作映射
    var actionCast = {
        test: {
            url: '/test/index'
        },
        company: {
            url: '/recruitment/index'
        },
        course: {
            url: '/course/index'
        }
    };

    // 跳转到相应的页面
    window.location.href = actionCast[action].url;
};

/* 获取所有公司列表 */
RecruitIndexAction.getAllCompany = function () {

    var url = '/recruitment/index';
    $.post(url, { action: 'getCompanyList'}, function (JSONdata) {

        // 更新页面
        RecruitIndexAction.updateCompanyPage(JSONdata);
    }, "JSON");
};

/* 更新公司列表 */
RecruitIndexAction.updateCompanyPage = function (JSONdata) {

    var JSONobject = JSON.parse(JSONdata);
    if(JSONobject.error){
        return alert('发生错误!');
    }

    var companys = JSONobject.companys;
    // 删除页面缓存
    $('.total').children().remove();

    // 遍历创建DOM
    for(var index in companys){

        var company = companys[index].company;
        var $companyBorder = $('<div class="company-border">');
        var $companyItem = $('<div class="company-item">');
        var $shadow = $('<div class="shadow">');
        var $a = $('<a class="company-title">');
        $a.attr('href', '/recruitment/' + company)
            .text(company);

        $companyItem.append($shadow)
            .append($a)
            .appendTo($companyBorder);

        $('.total').append($companyBorder);

    }
};