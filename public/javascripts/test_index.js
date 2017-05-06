/**
 * Created by yangw on 2016/10/12.
 * index索引页面相关的脚本,
 * 主要包括获取评测列表,
 * 获取热门内容等操作.
 */

/* 初始化函数 */
$(function () {

    TestIndexAction.userAgent["browser"] = nojsja["Tool"].GetBrowserType();

    $('#testTypeChoose, #testTypeChoose2').click(function () {
        TestIndexAction.headerDown = !TestIndexAction.headerDown;
        $('.type-item').slideToggle();
        if(TestIndexAction.headerDown) {
            $('.header-label > i').prop('class', 'icon-angle-up');
        }else {
            $('.header-label > i').prop('class', 'icon-angle-down');
        }
    });

    // 检查登录账户信息
    $('#userInfo').click(function () {

        window.location.href = '/userInfo';
    });

    //顶部和底部跳转
    $('#top').click(TestIndexAction.goTop);
    $('#bottom').click(TestIndexAction.goBottom);
    //滑动检测函数
    $(window).scroll(function () {

        nojsja.FnDelay(function () {
            TestIndexAction.scrollCheck(TestIndexAction.readMore);
        }, 200);
    });
    //加载更多数据
    // $('.loading-info').click();
    // 读取测评类型
    TestIndexAction.updateTestType();
    //加载指定数量的测试题目列表
    TestIndexAction.readTestList({
        testType: TestIndexAction.testType,
        limit: TestIndexAction.pageLimit
    });
    // 读取热门的评测
    TestIndexAction.updateHot();
    // 初始化按钮
    nojsja.HoverButton.init();
    // 轮播图片初始化
    TestIndexAction.bulidSlideView();
});

/*** 页面全局变量 ***/
var TestIndexAction = {
    // 浏览器信息
    userAgent: {
        scrollTop: 0,
        scrollHeight: 0,
        clientHeight: 0
    },
    //heder是否降下
    headerDown: false,
    //检测页面滚动
    scrollOver: false,
    //检测上次页面滚动的状态
    lastScrollOver: false,
    //页面加载起点
    pageStart: 0,
    //页面加载条数
    pageLimit: 2,
    //加载的测试类型
    testType: "ALL",
    //是否清除页面已存数据
    isClear: false,
    // 测评类型中文
    testTypeChina: {}
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

/* 获取课程类型更新页面 */
TestIndexAction.updateTestType = function () {

    var url = "/test/testType";
    $.post(url, {}, function (JSONdata) {

        var JSONobject = JSON.parse(JSONdata);
        if(JSONobject.isError){
            return TestIndexAction.modalWindow('[error]: ' + JSONobject.error);
        }

        // 类型列表
        var $typeItemList = $('.type-item-list');
        TestIndexAction.testTypeChina = JSONobject.testTypeChina;

        for(var type in TestIndexAction.testTypeChina){
            var $type = $('<div class="type-item">');
            $type.text(TestIndexAction.testTypeChina[type])
                .prop('id', type);

            $typeItemList.append($type);
        }
        $typeItemList.append(
          $('<div class="type-item">')
              .text('所有')
              .prop('id', 'ALL')
        );

        //指定类型的课程
        $('.type-item').click(function () {
            TestIndexAction.testTypeDefine.call(this, arguments);
        });

    }, "JSON");
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

        console.log('lockerCallback');
        //更新页面
        TestIndexAction.updatePage(JSONdata);
    });
};

/* 更新主页事件 */
TestIndexAction.updatePage = function (JSONdata) {

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
        return $('.loading-info').text('----- 加载完毕 ----');
    }else {
        $('.loading-info').text('正在加载...');
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
            var url = '/test/detail/' + test.testType + '/' + test.testTitle;
            $testContainer.click(function () {
               window.location.href = url;
            });
            //添加超链接
            $contentTitle.prop('href',url);
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
            $testType.text(TestIndexAction.testTypeChina[test.testType]);
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
    TestIndexAction.pageLimit = 2;
    TestIndexAction.testType = testType;
    TestIndexAction.isClear = true;

    //读取指定类型的列表
    TestIndexAction.readTestList({
        testType: TestIndexAction.testType,
        skip: TestIndexAction.pageStart,
        limit: TestIndexAction.pageLimit
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
            $a.text((Number(index) + 1) + ' . ' + popular.testTitle)
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
TestIndexAction.scrollCheck = function (callback) {

    // if(nojsja['FnLocker'].check(callback)){
    //     console.log('locker stil exists.');
    //     return;
    // }
    nojsja
        .GetDocumentHeight[TestIndexAction.userAgent.browser](TestIndexAction.userAgent, 'clientHeight');

    nojsja
        .GetDocumentHeight[TestIndexAction.userAgent.browser](TestIndexAction.userAgent, 'scrollTop');

    nojsja
        .GetDocumentHeight[TestIndexAction.userAgent.browser](TestIndexAction.userAgent, 'scrollHeight');

    nojsja.GetDocumentHeight[TestIndexAction.userAgent.browser](TestIndexAction.userAgent, 'offsetHeight');

    // console.log({
    //     Browser: TestIndexAction.userAgent.browser,
    //     ClientHeight: TestIndexAction.userAgent.clientHeight,
    //     ScrollTop: TestIndexAction.userAgent.scrollTop,
    //     ScrollHeight: TestIndexAction.userAgent.scrollHeight,
    //     OffsetHeight: TestIndexAction.userAgent.offsetHeight,
    // });

    if( (TestIndexAction.userAgent.clientHeight +
        TestIndexAction.userAgent.scrollTop >=
        (TestIndexAction.userAgent.offsetHeight || TestIndexAction.userAgent.scrollHeight) ) ){

        // mconsole.log('on the bottom.');
        // nojsja['FnLocker'].lock(callback);

        // callback(function () {
        //     console.log('unlock');
        //     nojsja['FnLocker'].unlock(callback);
        // });
        callback();
    }

};