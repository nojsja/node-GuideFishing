/**
 * Created by yangw on 2016/10/12.
 * index索引页面相关的脚本,
 * 主要包括获取评测列表,
 * 获取热门内容等操作.
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
    //热门内容事件绑定
    $('.jump').click(indexAction.pageHotContentAction);

    //顶部和底部跳转
    $('#top').click(indexAction.goTop);
    $('#bottom').click(indexAction.goBottom);
    //高度检测
    /*windowHeightCheck();*/
    //滑动检测函数
    $(window).scroll(indexAction.scrollCheck);
    //加载更多数据
    $('.loading-info').click(indexAction.readMore);
    //加载指定数量的测试题目列表
    indexAction.readTestList({ testType: "ALL" });
    //指定类型的测试题目
    $('.type-item').click(function () {
        indexAction.testTypeDefine.call(this, arguments);
    });
});

/*** 页面全局变量 ***/
var indexAction = {
    //heder是否降下
    headerDown: false,
    //检测页面滚动
    scrollOver: false,
    //检测上次页面滚动的状态
    lastScrollOver: false,
    //页面加载起点
    pageStart: 0,
    //页面加载条数
    pageLimit: 15,
    //加载的测试类型
    testType: "ALL",
    //是否清除页面已存数据
    isClear: false
};

/* 读取测试列表 */
indexAction.readTestList = function (condition) {

    var url = "/readTestList";
    //请求服务器
    $.post(url, condition, function (JSONdata) {
        //更新页面
        indexAction.updatePage(JSONdata);
    }, "JSON");
};

/* 加载更多数量的测评文章 */
indexAction.readMore = function () {

    indexAction.readTestList({
        testType: indexAction.testType,
        skip: indexAction.pageStart
    }, function (JSONdata) {
        //更新页面
        indexAction.updatePage(JSONdata);
    });
}

/* 更新主页事件 */
indexAction.updatePage = function (JSONdata) {

    //转换成JSON对象
    var parsedData = JSON.parse(JSONdata);
    //测评类型的图片url数组
    var typeImgUrl = {
        "character": 'url("/images/testType/character.jpg") no-repeat',
        "personality": 'url("/images/testType/personality.jpg") no-repeat',
        "emotion": 'url("/images/testType/emotion.jpg") no-repeat',
        "communication": 'url("/images/testType/communication.jpg") no-repeat',
        "potential": 'url("/images/testType/potential.jpg") no-repeat'
    };

    if(parsedData.error){
        return this.modalWindow("服务器发生错误: " + parsedData.error);
    }
    //清除缓存数据
    if(indexAction.isClear) {
        $('#total').children().remove();
        //重置标志位
        indexAction.isClear = false;
    }
    //没有数据提示用户
    if(parsedData.testArray.length == 0){
        this.modalWindow('抱歉,没有更多数据!');
    }
    //遍历对象数组构造DOM对象
    for(var testIndex in parsedData.testArray) {
        //增加游标控制页面读取的起始位置
        indexAction.pageStart += 1;
        (function () {
            var test = parsedData.testArray[testIndex];
            //最外层container
            var $testContainer = $('<div class="content-item shadow-grey">');
            //图钉图标
            var $pushPin = $('<span class="glyphicon glyphicon-pushpin push-pin"></span>');
            //内容左部分区
            var $contentLeft = $('<div class="content-item-left">');
            //内容标题
            var $contentTitle = $('<a class="content-item-title">');
            //添加超链接
            $contentTitle.prop('href','/testDetail/' + test.testType + '/' + test.testTitle);
            $contentTitle.text(test.testTitle);
            //内容摘要和图标
            var $abstract = $('<div class="content-item-abstract">');
            var $pencil = $('<span class="glyphicon glyphicon-pencil">');
            $abstract.append($pencil.text(test.abstract));
            //DOM构造
            $contentLeft.append($contentTitle).append($abstract).append($pushPin);

            //内容右边分区
            var $contentRight = $('<div class="content-item-right">');
            //内容类型相关的图片
            var $typeImg = $('<div></div>');
            var imgUrl = typeImgUrl[test.testType];
            $typeImg.prop('class', 'type-img').css({
                'background': imgUrl,
                'background-size': 'cover'
            });
            //该测评所属的类型
            var $testType = $('<p class="type-text">');
            $testType.text(test.testType);
            $contentRight.append($typeImg).append($testType);

            //显示的日期
            var $date = $('<p class="content-item-date">');
            var $dateIcon = $('<span class="glyphicon glyphicon-time">');
            $date.append($dateIcon.text(test.date));

            //组合所有DOM
            $testContainer.append($contentLeft)
                .append($contentRight)
                .append($date)
                .css('display', 'none');
            //添加到页面上去
            $('#total').append($testContainer);
            //以淡入淡出效果出现
            $testContainer.fadeIn();
        })();
    }
};

/* 自定义评测类型 */
indexAction.testTypeDefine = function () {

    //通过触发对象id获取函数执行环境下的testType
    var testType = $(this).prop('id');
    //重置分页数据
    indexAction.pageStart = 0;
    indexAction.pageLimit = 15;
    indexAction.testType = testType;
    indexAction.isClear = true;

    //读取指定类型的列表
    indexAction.readTestList({
        testType: indexAction.testType,
        pageStart: indexAction.pageStart,
        pageLimit: indexAction.pageLimit
    }, function (err, JSONdata) {
        if(err){
            return this.modalWindow("发生错误: " + err);
        }
        indexAction.updatePage(JSONdata);
    });
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
    $.post('/readHot', {hotType: type}, function (JSONdata){}, "JSON");
};

/* 分页导航事件 */
/*indexAction.pageNavbarAction = function() {

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
};*/

/* 模态弹窗 */
indexAction.modalWindow = function(text) {

    $('.modal-body').text(text);
    $('#modalWindow').modal("show", {
        backdrop : true,
        keyboard : true
    });
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

    //可见高度
    var clientHeight = $(window).height();
    //总高度,包括不可见高度
    var totalHeight = $(document).height();
    //可滚动高度,只有不可见高度
    var scrollHeight = $(window).scrollTop();

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
