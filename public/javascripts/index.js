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
    //分页导航事件绑定
    indexAction.pageNavbarAction();
    //热门内容事件绑定
    $('.jump').click(indexAction.pageHotContentAction);

    //顶部和底部跳转
    $('#top').click(indexAction.goTop);
    $('#bottom').click(indexAction.goBottom);
    //高度检测
    /*windowHeightCheck();*/
    //滑动检测函数
    $(window).scroll(indexAction.scrollCheck);

});

/* 页面全局变量 */
var indexAction = {
    //heder是否降下
    headerDown: false,
    //检测页面滚动
    scrollOver: false,
    //检测上次页面滚动的状态
    lastScrollOver: false,
    //测评详细信息
    test: {
        type: "popular"
    }
};

/* 更新主页事件 */
indexAction.updatePage = function (JSONdata) {

};

/* 热门内容事件绑定 */
indexAction.pageHotContentAction = function () {

    //将要获取的热门内容
    var jumpTo = $(this).attr('jumpTo');
    //更新的测评类型
    var hotType = $(this).children(':eq(0)').text();

    $('.jump').parent().prop('class', '');
    $(this).parent().prop('class', 'active');
    $.each($('.hot-title > div'), function (index, hotObj) {
       $(hotObj).prop('class', 'hidden');
    });
    $('#' + jumpTo).prop('class', 'active');
    //更新热门内容
    indexAction.updateHot();
};

/* 更新热门内容 */
indexAction.updateHot = function (type) {

    return;
    $.post('/readHot', {
            hotType: type
        }, function (JSONdata){

        }, "JSON"
    );
};

/* 分页导航事件 */
indexAction.pageNavbarAction = function() {

    var pageStart = 0;
    var pageLimit = 10;
    var that = this;
    //点击首页按钮
    $('#first').click(function() {
        if($('.page-number:eq(0)').prop('class') == "active page-number"){
            return;
        }
        $('.page-number[class="active page-number"]').prop('class', 'page-number');
        $('.page-number:eq(0)').prop('class', 'active page-number');
        pageStart = 0;
        //读取文章列表
        getTestList();
    });
    //点击页数按钮
    $('.page-number').click(function() {
        if($(this).prop('class') == "active page-number"){
            return;
        }
        $('.page-number[class="active page-number"]').prop('class', 'page-number');
        $(this).prop('class', 'active page-number');
        pageStart = ($(this).children(0).text() - 1) * pageLimit;
        getTestList();
    });

    //点击翻页按钮
    $('#next').click(function() {
        $('.page-number[class="active page-number"]').prop('class', 'page-number');
        var $pageNumber = $('.page-number');
        $.each($pageNumber.children(0), function (index, item) {
            $(item).text( parseInt($(item).text()) + 10 );
        });
    });

    $('#last').click(function() {
        $('.page-number[class="active page-number"]').prop('class', 'page-number');
        var $pageNumber = $('.page-number');
        $.each($pageNumber.children(0), function (index, item) {
            var $num = parseInt($(item).text());
            $(item).text( ($num-10) > 0 ? ($num-10) : $num );
        });
    });

    //读取评测列表
    function getTestList(){
        $.post('/readList', {
                action : "readList",
                type : indexAction.test.type,
                number : pageLimit,
                start: pageStart
            }, function(JSONdata) {
                that.updatePage(JSONdata);
            }, "JSON"
        );
    }
};

/* 页面底部和底部跳转 */
indexAction.goTop = function goTop() {
    $('html, body').animate({ scrollTop: 0 }, 'slow');
};

indexAction.goDiv = function goDiv(div) {
    var a = $("#" + div).offset().top;
    $("html, body").animate({ scrollTop: a }, 'slow');
};

indexAction.goBottom = function goBottom() {
    //两个参数分别是左上角显示的文档的x坐标和y坐标
    //scrollHeight 和 clientHeight分别是文档能够滚动的总高度和文档在当前窗口的可见高度
    window.scrollTo(0, document.documentElement.scrollHeight - document.documentElement.clientHeight);
};

/* 滚动侦测 */
indexAction.scrollCheck = function () {

    var $this = $(this);
    //可见高度
    var clientHeight = $this.height();
    //总高度,包括不可见高度
    var totalHeight = $(document).height();
    //可滚动高度,只有不可见高度
    var scrollHeight = $this.scrollTop();

    //文档总长度比较短
    if(clientHeight >= (totalHeight * 1) / 2){
        return;
    }

    //当滑动到1/2页面处的时候就显示跳转按钮
    if(clientHeight + scrollHeight >= (totalHeight * 1) / 2){
        indexAction.scrollOver = true;
        if(indexAction.lastScrollOver !== indexAction.scrollOver){
            $('.page-anchor').fadeIn();
        }
        indexAction.lastScrollOver = indexAction.scrollOver;
    }else {
        indexAction.scrollOver = false;
        if(indexAction.lastScrollOver !== indexAction.scrollOver){
            $('.page-anchor').fadeOut();
        }
        indexAction.lastScrollOver = indexAction.scrollOver;
    }
};

/* 窗口各种高度检测函数 */
function windowHeightCheck() {
    console.log('$(window).height() = ' + $(window).height());
    console.log('document.body.clientHeight = ' + document.body.clientHeight);
    console.log('document.body.scrollHeight = ' + document.body.scrollHeight);
    console.log('$(document).height() = ' + $(document).height());
    console.log('$(window).scrollTop() = ' + $(window).scrollTop());
    console.log('window.innerHeight = ' + window.innerHeight);
    console.log('document.documentElement.clientHeight = ' + document.documentElement.clientHeight);
    console.log('document.documentElement.scrollHeight = ' + document.documentElement.scrollHeight);
}