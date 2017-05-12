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

        TestIndexAction.typeAction.show();

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

    // 读取测评类型
    TestIndexAction.testTypeInit();
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
    testTypeChina: {},
    // 类型图片信息
    typeImgUrl: {}
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
        // 滑动组件1
        var slideDivID = $('#slideDiv').prop('id');
        // 实例化一个组件
        var slideView1 = new nojsja['SlideViewFrame'](slideDivID, data.slideImageArray);
        slideView1.build();

    });
};

/* 获取课程类型更新页面 */
TestIndexAction.testTypeInit = function () {

    // 测评类型选择事件
    TestIndexAction.typeAction = (function () {

        // 初始化标志
        var isInit = false;
        var $allTestType = $('.all-test-type');
        // 触摸事件对象
        var touchEvent = {
            position: {
                pageStartX: 0,      // 触摸开始的X坐标
                pageStartY: 0,      // 触摸开始的Y坐标
                pageEndX: 0,        // 触摸结束的X坐标
                pageEndY: 0        // 触摸结束的Y坐标
            },
            moveCheck: function () {
                // 上滑
                if( Math.abs(this.position.pageEndY - this.position.pageStartY) >
                    Math.abs(this.position.pageEndX - this.position.pageStartX) ){

                    if(this.position.pageEndY - this.position.pageStartY < 0){
                        hidden();
                    }
                }
            }
        };

        // 初始化
        var init = function () {

            // 绑定上滑动取消事件
            nojsja["EventUtil"].addHandler($allTestType[0], 'touchstart', function (event) {
                nojsja["FnDelay"](function (event) {
                    var _event = nojsja['EventUtil'].getEvent(event);
                    // 阻止浏览器默认的事件
                    nojsja['EventUtil'].preventDefault(_event);
                    // 当前事件手指的坐标
                    touchEvent.position.pageStartX = _event.changedTouches[0].pageX;
                    touchEvent.position.pageStartY = _event.changedTouches[0].pageY;

                }, 100, false, event);
            });
            nojsja["EventUtil"].addHandler($allTestType[0], 'touchmove', function (event) {
                nojsja["FnDelay"](function (event) {

                    var _event = nojsja['EventUtil'].getEvent(event);
                    // 阻止浏览器默认的事件
                    nojsja['EventUtil'].preventDefault(_event);
                    // 当前事件手指的坐标
                    touchEvent.position.pageEndX = _event.changedTouches[0].pageX;
                    touchEvent.position.pageEndY = _event.changedTouches[0].pageY;
                    // 位置检查
                    touchEvent.moveCheck();
                }, 200, false, event);
            });

            var url = "/test/testType";
            $.post(url, {}, function (JSONdata) {

                var JSONobject = JSON.parse(JSONdata);
                if(JSONobject.isError){
                    return TestIndexAction.modalWindow('[error]: ' + JSONobject.error);
                }

                // 类型列表
                var $typeItemList = $('.all-test-type');
                TestIndexAction.testTypeChina = JSONobject.testTypeChina;

                for(var type in TestIndexAction.testTypeChina){

                    var $testTypeItem = $('<div class="test-type-item">');
                    var $testType = $('<div class="test-type">');
                    $testType.prop('id', type);

                    var $testTypeImg = $('<img>');
                    $testTypeImg.prop('src', TestIndexAction.typeImgUrl[type]);

                    var $testTypeText = $('<span class="test-type-text">');
                    $testTypeText.text(TestIndexAction.testTypeChina[type]);

                    $testTypeItem.append(
                        $testType.append($testTypeImg)
                            .append($testTypeText)
                    );

                    $typeItemList.append($testTypeItem);
                }
                var $typeHidden = $('<div class="test-type-hidden">');
                $typeHidden.append($('<i class="icon-double-angle-up">'));
                $typeHidden.click(hidden);

                $typeItemList.append($typeHidden);

                //指定类型的课程
                $('.test-type').click(function () {
                    hidden();
                    TestIndexAction.testTypeDefine.call(this, arguments);
                });

                isInit = true;

            }, "JSON");
        };

        // 显示
        function show() {
            nojsja['ScrollHandler'].disableScroll();
            if(!isInit){
                init();
            }
            $allTestType.css('display', 'block');
        }

        // 隐藏
        function hidden() {
            nojsja['ScrollHandler'].enableScroll();
            if(!isInit){
                init();
            }
            $allTestType.css('display', 'none');
        }

        // 返回调用接口
        return {
            show: show,
            hidden: hidden
        }
    })();
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
TestIndexAction.readMore = function (callback) {

    var url = "/test/readList";
    //请求服务器
    $.post(url, {
        testType: TestIndexAction.testType,
        skip: TestIndexAction.pageStart

    }, function (JSONdata) {

        callback();
        //更新页面
        TestIndexAction.updatePage(JSONdata);

    }, "JSON");
};

/* 更新主页事件 */
TestIndexAction.updatePage = function (JSONdata) {

    //转换成JSON对象
    var parsedData = JSON.parse(JSONdata);
    //测评类型的图片url数组
    TestIndexAction.typeImgUrl = parsedData.typeImgUrl;
    var testTypeChina = parsedData.testTypeChina;

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

    // 创建一个虚拟的文档碎片
    var docufragment = document.createDocumentFragment();
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
            $abstract.append($pencil.text(test.teacher));
            //DOM构造
            $contentLeft.append($contentTitle).append($abstract).append($pushPin);

            //内容右边分区
            var $contentRight = $('<div class="content-item-right">');
            //内容类型相关的图片
            var $typeImg = $('<div></div>');
            var imgUrl = TestIndexAction.typeImgUrl[test.testType];
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
            var $dateIcon = $('<i class="icon-time">');
            $date.append($dateIcon.text(test.date));

            //组合所有DOM
            $testContainer.append($contentLeft)
                .append($contentRight)
                .append($date)
            //添加到虚拟节点上去
            docufragment.appendChild($testContainer[0]);
        })();
    }

    // 修改DOM
    $('#total')[0].appendChild(docufragment);
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

    // 上一次的callback任然未结束
    if(nojsja['FnLocker'].check(callback)){
        return;
    }
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

        // 锁住函数
        nojsja['FnLocker'].lock(callback);

        callback(function () {
            nojsja['FnLocker'].unlock(callback);
        });
    }

};