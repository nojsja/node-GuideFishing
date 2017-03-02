/**
 * Created by yangw on 2016/10/12.
 * index索引页面相关的脚本,
 * 主要包括获取评测列表,
 * 获取热门内容等操作.
 */

/* 初始化函数 */
$(function () {

    $('.header-label').click(function () {
        TestIndexAction.headerDown = !TestIndexAction.headerDown;
        $('.type-item').slideToggle();
        if(TestIndexAction.headerDown) {
            $('.header-label > span').prop('class', 'glyphicon glyphicon-chevron-up');
        }else {
            $('.header-label > span').prop('class', 'glyphicon glyphicon-chevron-down');
        }
    });

    //顶部和底部跳转
    $('#top').click(TestIndexAction.goTop);
    $('#bottom').click(TestIndexAction.goBottom);
    //高度检测
    /*windowHeightCheck();*/
    //滑动检测函数
    $(window).scroll(function () {
        nojsja.FnDelay(TestIndexAction.scrollCheck, 500);
    });
    //加载更多数据
    $('.loading-info').click(TestIndexAction.readMore);
    //加载指定数量的测试题目列表
    TestIndexAction.readTestList({ testType: "ALL" });
    // 读取热门的评测
    TestIndexAction.updateHot();
    //指定类型的测试题目
    $('.type-item').click(function () {
        TestIndexAction.testTypeDefine.call(this, arguments);
    });
    // 轮播图片初始化
    TestIndexAction.bulidSlideView();
});

/*** 页面全局变量 ***/
var TestIndexAction = {
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

/* 轮播图片初始化 */
TestIndexAction.bulidSlideView = function () {
    
    var readUrl = "/test/readSlideImage";
    // 请求加载图片数组
    $.post(readUrl, function (jsonData) {

        var data = JSON.parse(jsonData);

        if(data.isError){
            return TestIndexAction.modalWindow('发生错误：' + data.error);
        }
        nojsja.SlideView.init(data.slideImageArray);

    });
};

/* 读取测试列表 */
TestIndexAction.readTestList = function (condition) {

    var url = "/test/readList";
    //请求服务器
    $.post(url, condition, function (JSONdata) {
        //更新页面
        TestIndexAction.updatePage(JSONdata);
    }, "JSON");
};

/* 加载更多数量的测评文章 */
TestIndexAction.readMore = function () {

    TestIndexAction.readTestList({
        testType: TestIndexAction.testType,
        skip: TestIndexAction.pageStart
    }, function (JSONdata) {
        //更新页面
        TestIndexAction.updatePage(JSONdata);
    });
};

/* 更新主页事件 */
TestIndexAction.updatePage = function (JSONdata) {

    // 测试类型对应中文
    var testTypeChina = {
        "character": "性格测试",
        "personality": "人格测试",
        "emotion": "情感测试",
        "communication": "交际测试",
        "potential": "潜能测试"
    };

    //转换成JSON对象
    var parsedData = JSON.parse(JSONdata);
    //测评类型的图片url数组
    var typeImgUrl = parsedData.typeImgUrl;

    if(parsedData.error){
        return this.modalWindow("服务器发生错误: " + parsedData.error);
    }
    //清除缓存数据
    if(TestIndexAction.isClear) {
        $('#total').children().remove();
        //重置标志位
        TestIndexAction.isClear = false;
    }
    //没有数据提示用户
    if(parsedData.testArray.length === 0){
        this.modalWindow('抱歉,没有更多数据!');
    }
    //遍历对象数组构造DOM对象
    for(var testIndex in parsedData.testArray) {
        //增加游标控制页面读取的起始位置
        TestIndexAction.pageStart += 1;
        (function () {
            var test = parsedData.testArray[testIndex];
            //最外层container
            var $testContainer = $('<div class="content-item">');
            //图钉图标
            var $pushPin = $('<span class="glyphicon glyphicon-pushpin push-pin"></span>');
            //内容左部分区
            var $contentLeft = $('<div class="content-item-left">');
            //内容标题
            var $contentTitle = $('<a class="content-item-title">');
            //添加超链接
            $contentTitle.prop('href','/test/testDetail/' + test.testType + '/' + test.testTitle);
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
                'background': ["url(", imgUrl, ")", " no-repeat"].join(''),
                'background-size': 'cover'
            });
            //该测评所属的类型
            var $testType = $('<p class="type-text">');
            $testType.text(testTypeChina[test.testType]);
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
TestIndexAction.testTypeDefine = function () {

    //通过触发对象id获取函数执行环境下的testType
    var testType = $(this).prop('id');
    //重置分页数据
    TestIndexAction.pageStart = 0;
    TestIndexAction.pageLimit = 15;
    TestIndexAction.testType = testType;
    TestIndexAction.isClear = true;

    //读取指定类型的列表
    TestIndexAction.readTestList({
        testType: TestIndexAction.testType,
        pageStart: TestIndexAction.pageStart,
        pageLimit: TestIndexAction.pageLimit
    }, function (err, JSONdata) {
        if(err){
            return this.modalWindow("发生错误: " + err);
        }
        TestIndexAction.updatePage(JSONdata);
    });
};

/* 更新热门内容 */
TestIndexAction.updateHot = function () {

    var url = '/test/readHot';
    $.post(url, {}, function (JSONdata){

        var JSONobject = JSON.parse(JSONdata);
        if(JSONobject.isError){
            return TestIndexAction.modalWindow('服务器发生错误,错误码: ' + JSONobject.error);
        }

        // 更新父组件
        var $popularFather = $('.hot-item-list');
        // 清除缓存
        $popularFather.children().remove();
        // 更新页面
        for (var index in JSONobject.popularArray){
            var popular  = JSONobject.popularArray[index];
            console.log(popular.preDress);
            var $li = $('<li>');
            var $a = $('<a>');
            // 课程url由前缀、课程类型和课程名字组成
            $a.text(popular.testTitle)
                .prop({
                    href: [popular.preDress, popular.testType, '/', popular.testTitle].join('')
                });
            $li.append($a);
            $popularFather.append($li);
        }
    }, "JSON");
};

/* 模态弹窗 */
TestIndexAction.modalWindow = function(text) {

    nojsja.ModalWindow.show(text);
};

/* 页面底部和底部跳转 */
TestIndexAction.goTop = function goTop() {
    $('html, body').animate({ scrollTop: 0 }, 'slow');
};

TestIndexAction.goDiv = function goDiv(div) {
    var a = $("#" + div).offset().top;
    $("html, body").animate({ scrollTop: a }, 'slow');
};

TestIndexAction.goBottom = function goBottom() {
    //两个参数分别是左上角显示的文档的x坐标和y坐标
    //scrollHeight 和 clientHeight分别是文档能够滚动的总高度和文档在当前窗口的可见高度
    window.scrollTo(0, document.documentElement.scrollHeight -
        document.documentElement.clientHeight);
};

/* 滚动侦测 */
TestIndexAction.scrollCheck = function () {

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
        TestIndexAction.scrollOver = true;
        if(TestIndexAction.lastScrollOver !== TestIndexAction.scrollOver){
            $('.page-anchor').fadeIn();
        }
        TestIndexAction.lastScrollOver = TestIndexAction.scrollOver;
    }else {
        TestIndexAction.scrollOver = false;
        if(TestIndexAction.lastScrollOver !== TestIndexAction.scrollOver){
            $('.page-anchor').fadeOut();
        }
        TestIndexAction.lastScrollOver = TestIndexAction.scrollOver;
    }
};
