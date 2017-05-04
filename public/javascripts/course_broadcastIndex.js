/**
 * Created by yangw on 2016/11/30.
 * 获取所有直播间
 */


/* 初始化函数 */
$(function () {

    // 页面事件绑定
    bcIndexAction.pageEventBind();
    // 读取直播类型中英文
    bcIndexAction.updateBroadcastType();
    //加载指定数量的测试题目列表
    bcIndexAction.readBroadcastList({});
});

/*** 页面全局变量 ***/
var bcIndexAction = {
    //heder是否降下
    headerDown: false,
    //检测页面滚动
    scrollOver: false,
    //检测上次页面滚动的状态
    lastScrollOver: false,
    //页面加载起点
    pageStart: 0,
    //页面加载条数
    pageLimit: 20,
    //是否清除页面已存数据
    isClear: false,
    // 中英切换
    broadcastTypeChina: {},
    // 直播列表缓存
    broadcastArray: []
};

/* 页面主要事件绑定 */
bcIndexAction.pageEventBind = function () {

    // 初始化悬浮按钮
    nojsja.HoverButton.init();
    //顶部和底部跳转
    $('#top').click(bcIndexAction.goTop);
    $('#bottom').click(bcIndexAction.goBottom);
    //高度检测
    /*windowHeightCheck();*/
    //滑动检测函数
    $(window).scroll(bcIndexAction.scrollCheck);
    //加载更多数据
    $('#readMore').click(bcIndexAction.readMore);
    // 绑定搜索动画
    $('#broadcastSearchButton').click(function () {

        bcIndexAction.broadcastSearch.spreadCheck();
    });

    // 初始化
    bcIndexAction.broadcastSearchInit();
};

bcIndexAction.broadcastSearchInit = function () {

    /* 讨论组搜索模块 */
    bcIndexAction.broadcastSearch = (function () {

        // 输入框收起
        var isSpread = false;
        // 查询地址
        var url = "/course/broadcast/readOne";
        // 输入框
        var $searchText = $('#broadcastSearchText');
        var searchValue = null;

        // 输入框状态检查
        function spreadCheck() {

            if(!isSpread){
                $searchText.prop('class', 'broadcast-search-text broadcast-search-animation');
                isSpread = true;
            }else {

                if(searchValue === $searchText.val().trim()){
                    return;
                }
                searchValue = $searchText.val().trim();
                if(!searchValue || searchValue == ''){
                    return bcIndexAction.modalWindow("请输入查询参数!");
                }
                sendRequest();
            }
        }

        // 发起搜索请求
        function sendRequest() {

            $.post(url, {
                courseName: searchValue
            }, function (JSONdata) {

                // 清除页面
                bcIndexAction.isClear = true;
                // 更新DOM
                bcIndexAction.updatePage(JSONdata);
            }, "JSON");
        }

        return {
            spreadCheck: spreadCheck
        };

    })();
};

/* 读取直播列表 */
bcIndexAction.readBroadcastList = function (condition) {

    var url = "/course/broadcast/readList";
    //请求服务器
    $.post(url, condition, function (JSONdata) {
        //更新页面
        bcIndexAction.updatePage(JSONdata);
    }, "JSON");
};

/* 加载更多数量的测评文章 */
bcIndexAction.readMore = function () {

    bcIndexAction.readBroadcastList({
        skip: bcIndexAction.pageStart
    });
};

/* 获取课程类型更新页面 */
bcIndexAction.updateBroadcastType = function () {

    var url = "/course/courseType";
    $.post(url, {}, function (JSONdata) {

        var JSONobject = JSON.parse(JSONdata);
        if(JSONobject.isError){
            return TestIndexAction.modalWindow('[error]: ' + JSONobject.error);
        }

        bcIndexAction.broadcastTypeChina = JSONobject.courseTypeChina;

    }, "JSON");
};

/* 更新主页事件 */
bcIndexAction.updatePage = function (JSONdata) {

    //转换成JSON对象
    var parsedData = JSON.parse(JSONdata);
    //测评类型的图片url数组
    var typeImgUrl = parsedData.typeImgUrl;
    // url前缀
    var preAddressUser = parsedData.preAddressUser;
    var preAddressAdmin = parsedData.preAddressAdmin;

    if(parsedData.error){
        return this.modalWindow("服务器发生错误: " + parsedData.error);
    }
    //清除缓存数据
    if(bcIndexAction.isClear) {
        $('#total').children().remove();
        //重置标志位
        bcIndexAction.isClear = false;
    }
    //没有数据提示用户
    if(parsedData.broadcastArray.length === 0){
        return this.modalWindow('抱歉,没有更多数据!');
    }
    // 做DOM缓存
    bcIndexAction.broadcastArray = parsedData.broadcastArray;
    //遍历对象数组构造DOM对象
    for(var broadcastIndex in parsedData.broadcastArray) {
        //增加游标控制页面读取的起始位置
        bcIndexAction.pageStart += 1;
        (function () {
            var broadcast = parsedData.broadcastArray[broadcastIndex];
            //最外层container
            var $broadcastContainer = $('<div class="content-item shadow-grey">');
            //图钉图标
            var $pushPin = $('<span class="glyphicon glyphicon-pushpin push-pin"></span>');
            //内容左部分区
            var $contentLeft = $('<div class="content-item-left">');
            //内容标题
            var $contentTitle = $('<a class="content-item-title">');
            //添加超链接
            var url = preAddressUser + broadcast.courseName;
            $broadcastContainer.click(function () {
                window.location.href = encodeURI(url);
            });
            $contentTitle.prop('href', url);
            $contentTitle.text(broadcast.courseName);
            //内容摘要和图标
            var $abstract = $('<div class="content-item-abstract">');
            var $teacher = $('<div class="teacher"></div>');
            // var $intoRoom = $('<input type="button" class="btn btn-default btn-sm" value="管理员登入">');
            // $intoRoom.click(function () {
            //     window.location = preAddressAdmin + broadcast.courseName;
            // });
            $abstract.append($teacher.text(broadcast.teacher.name));

            // $abstract.append($intoRoom);
            //DOM构造
            $contentLeft.append($contentTitle).append($abstract).append($pushPin);

            // 内容右边分区 //
            var $contentRight = $('<div class="content-item-right">');
            //内容类型相关的图片
            var $typeImg = $('<div></div>');
            var imgUrl = typeImgUrl[broadcast.courseType];
            $typeImg.prop('class', 'type-img').css({
                'background': ["url(", imgUrl, ")", " no-repeat"].join(''),
                'background-size': 'cover'
            });
            //该测评所属的类型
            var $broadcastType = $('<p class="type-text">');
            $broadcastType.text(bcIndexAction.broadcastTypeChina[broadcast.courseType]);
            $contentRight.append($typeImg).append($broadcastType);

            //显示的日期
            var $date = $('<p class="content-item-date">');
            var $dateIcon = $('<span class="glyphicon glyphicon-time">');
            $date.append($dateIcon.text(broadcast.date));

            //组合所有DOM
            $broadcastContainer.append($contentLeft)
                .append($contentRight)
                .append($date)
                .css('display', 'none');
            //添加到页面上去
            $('#total').append($broadcastContainer);
            //以淡入淡出效果出现
            $broadcastContainer.fadeIn();
        })();
    }
};

/* 模态弹窗 */
bcIndexAction.modalWindow = function(text) {

    nojsja.ModalWindow.show(text);
};

/* 页面底部和底部跳转 */
bcIndexAction.goTop = function goTop() {
    $('html, body').animate({ scrollTop: 0 }, 'slow');
};

bcIndexAction.goDiv = function goDiv(div) {
    var a = $("#" + div).offset().top;
    $("html, body").animate({ scrollTop: a }, 'slow');
};

bcIndexAction.goBottom = function goBottom() {
    //两个参数分别是左上角显示的文档的x坐标和y坐标
    //scrollHeight 和 clientHeight分别是文档能够滚动的总高度和文档在当前窗口的可见高度
    window.scrollTo(0, document.documentElement.scrollHeight -
        document.documentElement.clientHeight);
};

/* 滚动侦测 */
bcIndexAction.scrollCheck = function () {

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
        bcIndexAction.scrollOver = true;
        if(bcIndexAction.lastScrollOver !== bcIndexAction.scrollOver){
            $('.page-anchor').fadeIn();
        }
        bcIndexAction.lastScrollOver = bcIndexAction.scrollOver;
    }else {
        bcIndexAction.scrollOver = false;
        if(bcIndexAction.lastScrollOver !== bcIndexAction.scrollOver){
            $('.page-anchor').fadeOut();
        }
        bcIndexAction.lastScrollOver = bcIndexAction.scrollOver;
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

