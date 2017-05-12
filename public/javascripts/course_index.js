
/**
 * Created by yangw on 2016/11/8.
 * 课程学习主页
 */

/* 初始化函数 */
$(function () {

    CourseAction.userAgent["browser"] = nojsja["Tool"].GetBrowserType();
    // 页面事件绑定
    CourseAction.pageEventBind();

    //加载指定数量的测试题目列表
    CourseAction.readCourseList({
        courseType: CourseAction.courseType,
        limit: CourseAction.pageLimit
    });
    // 更新热门内容
    CourseAction.updateHot();
    // 滑动图片初始化
    CourseAction.buildSlideView();
    // 悬浮按钮初始化
    njj.HoverButton.init();
    CourseAction.courseTypeInit();
});

/*** 页面全局变量 ***/
var CourseAction = {
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
    courseType: "ALL",
    //是否清除页面已存数据
    isClear: false,
    // 中英文对应
    courseTypeChina: {},
    typeImgUrl: {}
};


/* 页面主要事件绑定 */
CourseAction.pageEventBind = function () {

    // 选择课程类型
    $('#courseTypeChoose, #courseTypeChoose2').click(function () {

        CourseAction.typeAction.show();
    });

    // 检查登录账户信息
    $('#userInfo').click(function () {

        window.location.href = '/userInfo';
    });

    //顶部和底部跳转
    $('#top').click(CourseAction.goTop);
    $('#bottom').click(CourseAction.goBottom);
    //高度检测

    //滑动检测函数
    $(window).scroll(function () {

        nojsja.FnDelay(function () {

           CourseAction.scrollCheck(CourseAction.readMore);
        }, 200);
    });
    //加载更多数据
    // $('#loadMore').click(CourseAction.readMore);
};

/* 获取课程类型更新页面 */
CourseAction.courseTypeInit = function () {

    // 测评类型选择事件
    CourseAction.typeAction = (function () {

        // 初始化标志
        var isInit = false;
        var $allCourseType = $('.all-course-type');
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
            nojsja["EventUtil"].addHandler($allCourseType[0], 'touchstart', function (event) {
                nojsja["FnDelay"](function (event) {
                    var _event = nojsja['EventUtil'].getEvent(event);
                    // 阻止浏览器默认的事件
                    nojsja['EventUtil'].preventDefault(_event);
                    // 当前事件手指的坐标
                    touchEvent.position.pageStartX = _event.changedTouches[0].pageX;
                    touchEvent.position.pageStartY = _event.changedTouches[0].pageY;

                }, 100, false, event);
            });
            nojsja["EventUtil"].addHandler($allCourseType[0], 'touchmove', function (event) {
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

            var url = "/course/courseType";
            $.post(url, {}, function (JSONdata) {

                var JSONobject = JSON.parse(JSONdata);
                if(JSONobject.isError){
                    return CourseAction.modalWindow('[error]: ' + JSONobject.error);
                }

                // 类型列表
                var $courseItemList = $('.all-course-type');
                console.log(JSONobject.courseTypeChina);
                CourseAction.courseTypeChina = JSONobject.courseTypeChina;

                for(var type in CourseAction.courseTypeChina){

                    var $courseTypeItem = $('<div class="course-type-item">');
                    var $courseType = $('<div class="course-type">');
                    $courseType.prop('id', type);

                    var $courseTypeImg = $('<img>');
                    $courseTypeImg.prop('src', CourseAction.typeImgUrl[type]);

                    var $courseTypeText = $('<span class="course-type-text">');
                    $courseTypeText.text(CourseAction.courseTypeChina[type]);

                    $courseTypeItem.append(
                        $courseType.append($courseTypeImg)
                            .append($courseTypeText)
                    );

                    $courseItemList.append($courseTypeItem);
                }
                var $typeHidden = $('<div class="course-type-hidden">');
                $typeHidden.append($('<i class="icon-double-angle-up">'));
                $typeHidden.click(hidden);

                $courseItemList.append($typeHidden);

                //指定类型的课程
                $('.course-type').click(function () {
                    hidden();
                    CourseAction.courseTypeDefine.call(this, arguments);
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
            $allCourseType.css('display', 'block');
        }

        // 隐藏
        function hidden() {
            nojsja['ScrollHandler'].enableScroll();
            if(!isInit){
                init();
            }
            $allCourseType.css('display', 'none');
        }

        // 返回调用接口
        return {
            show: show,
            hidden: hidden
        }
    })();
};

/* 创建滑动视图 */
CourseAction.buildSlideView = function () {

    var readUrl = '/course/readSlideImage';
    $.post(readUrl, function (jsonData) {
        var jsonObject = JSON.parse(jsonData);
        if(jsonObject.isError){
            return CourseAction.modalWindow(jsonObject.error);
        }

        // 滑动组件1
        var slideViewWrapperID = $('#slideDiv').prop('id');
        // 实例化一个组件
        var slideView1 = new nojsja['SlideViewFrame'](slideViewWrapperID, jsonObject.slideImageArray);
        slideView1.build();

    });
};

/* 读取课程列表 */
CourseAction.readCourseList = function (condition) {

    var url = "/course/readCourseList";
    //请求服务器
    $.post(url, condition, function (JSONdata) {
        //更新页面
        CourseAction.updatePage(JSONdata);
    }, "JSON");
};

/* 加载更多数量的测评文章 */
CourseAction.readMore = function (callback) {

    var url = "/course/readCourseList";
    //请求服务器
    $.post(url, {
        courseType: CourseAction.courseType,
        skip: CourseAction.pageStart,
        limit: CourseAction.pageLimit
    }, function (JSONdata) {
        callback();
        //更新页面
        CourseAction.updatePage(JSONdata);
    });
};

/* 更新主页事件 */
CourseAction.updatePage = function (JSONdata) {

    //转换成JSON对象
    var parsedData = JSON.parse(JSONdata);
    //测评类型的图片url数组
    CourseAction.typeImgUrl = parsedData.typeImgUrl;
    var courseTypeChina = parsedData.courseTypeChina;

    if(parsedData.error){
        return this.modalWindow("服务器发生错误: " + parsedData.error);
    }
    //清除缓存数据
    if(CourseAction.isClear) {
        $('#total').children().remove();
        //重置标志位
        CourseAction.isClear = false;
    }
    //没有数据提示用户
    if(parsedData.courseArray.length === 0){
        return $('.loading-info').text('----- 加载完毕 ----');
    }else {
        $('.loading-info').text('正在加载...');
    }

    // 创建一个虚拟的文档碎片
    var docufragment = document.createDocumentFragment();
    //遍历对象数组构造DOM对象
    for(var courseIndex in parsedData.courseArray) {
        //增加游标控制页面读取的起始位置
        CourseAction.pageStart += 1;
        (function () {
            var course = parsedData.courseArray[courseIndex];
            //最外层container
            var $courseContainer = $('<div class="content-item">');
            //图钉图标
            var $pushPin = $('<span class="glyphicon glyphicon-pushpin push-pin"></span>');
            //内容左部分区
            var $contentLeft = $('<div class="content-item-left">');
            //内容标题
            var $contentTitle = $('<a class="content-item-title">');
            var url = '/course/detail/' + course.courseType + '/' + course.courseName;
            //添加超链接
            $contentTitle.prop('href', url);
            $courseContainer.click(function () {
                window.location.href = url;
            });

            $contentTitle.text(course.courseName);
            //内容摘要和图标
            var $abstract = $('<div class="content-item-abstract">');
            var $pencil = $('<span class="glyphicon glyphicon-pencil">');
            $abstract.append($pencil.text(course.teacher));
            //DOM构造
            $contentLeft.append($contentTitle).append($abstract).append($pushPin);

            //内容右边分区
            var $contentRight = $('<div class="content-item-right">');
            //内容类型相关的图片
            var $typeImg = $('<div></div>');
            var imgUrl = CourseAction.typeImgUrl[course.courseType];
            $typeImg.prop('class', 'type-img').css({
                'background': ["url(", imgUrl, ")", " no-repeat"].join(''),
                'background-size': 'cover'
            });
            //该测评所属的类型
            var $courseType = $('<p class="type-text">');
            $courseType.text(courseTypeChina[course.courseType]);
            $contentRight.append($typeImg).append($courseType);

            //显示的日期
            var $date = $('<p class="content-item-date">');
            var $dateIcon = $('<i class="icon-time">');
            $date.append($dateIcon.text(course.date));

            //组合所有DOM
            $courseContainer.append($contentLeft)
                .append($contentRight)
                .append($date)
            //添加到虚拟节点上去
            docufragment.appendChild($courseContainer[0]);
        })();
    }

    // 修改DOM
    $('#total')[0].appendChild(docufragment);

};

/* 自定义课程类型 */
CourseAction.courseTypeDefine = function () {

    //通过触发对象id获取函数执行环境下的courseType
    var courseType = $(this).prop('id');
    //重置分页数据
    CourseAction.pageStart = 0;
    CourseAction.pageLimit = 15;
    CourseAction.courseType = courseType;
    CourseAction.isClear = true;

    //读取指定类型的列表
    CourseAction.readCourseList({
        courseType: CourseAction.courseType,
        pageStart: CourseAction.pageStart,
        pageLimit: CourseAction.pageLimit

    }, function (err, JSONdata) {
        if(err){
            return this.modalWindow("发生错误: " + err);
        }
        CourseAction.updatePage(JSONdata);
    });
};

/* 更新热门内容 */
CourseAction.updateHot = function () {

    var url = '/course/readHot';
    $.post(url, {}, function (JSONdata){

        var JSONobject = JSON.parse(JSONdata);
        if(JSONobject.isError){
            return CourseAction.modalWindow('服务器发生错误,错误码: ' + JSONobject.error);
        }

        // 更新父组件
        var $popularFather = $('.hot-item-list');
        // 清除缓存
        $popularFather.children().remove();
        // 更新页面
        for (var index in JSONobject.popularArray){
            var popular  = JSONobject.popularArray[index];
            var $li = $('<li>');
            var $a = $('<a>');
            // 课程url由前缀、课程类型和课程名字组成
            $a.text((Number(index) + 1) + ' . ' + popular.courseName)
                .prop({
                    href: [popular.preDress, popular.courseType, '/', popular.courseName].join('')
                });
            $li.append($a);
            $popularFather.append($li);
        }
    }, "JSON");
};

/* 模态弹窗 */
CourseAction.modalWindow = function (text) {
  nojsja.ModalWindow.show(text);
};

/* 页面底部和底部跳转 */
CourseAction.goTop = function goTop() {
    $('html, body').animate({ scrollTop: 0 }, 'slow');
};

CourseAction.goDiv = function goDiv(div) {
    var a = $("#" + div).offset().top;
    $("html, body").animate({ scrollTop: a }, 'slow');
};

CourseAction.goBottom = function goBottom() {
    //两个参数分别是左上角显示的文档的x坐标和y坐标
    //scrollHeight 和 clientHeight分别是文档能够滚动的总高度和文档在当前窗口的可见高度
    window.scrollTo(0, document.documentElement.scrollHeight -
        document.documentElement.clientHeight);
};

/* 滚动侦测 */
CourseAction.scrollCheck = function (callback) {

    if(nojsja['FnLocker'].check(callback)){
        return;
    }

    nojsja
        .GetDocumentHeight[CourseAction.userAgent.browser](CourseAction.userAgent, 'clientHeight');

    nojsja
        .GetDocumentHeight[CourseAction.userAgent.browser](CourseAction.userAgent, 'scrollTop');

    nojsja
        .GetDocumentHeight[CourseAction.userAgent.browser](CourseAction.userAgent, 'scrollHeight');

    nojsja.GetDocumentHeight[CourseAction.userAgent.browser](CourseAction.userAgent, 'offsetHeight');

    // console.log({
    //     Browser: CourseAction.userAgent.browser,
    //     ClientHeight: CourseAction.userAgent.clientHeight,
    //     ScrollTop: CourseAction.userAgent.scrollTop,
    //     ScrollHeight: CourseAction.userAgent.scrollHeight,
    //     OffsetHeight: CourseAction.userAgent.offsetHeight,
    // });

    if( (CourseAction.userAgent.clientHeight +
        CourseAction.userAgent.scrollTop >=
        (CourseAction.userAgent.offsetHeight || CourseAction.userAgent.scrollHeight) ) ){

        nojsja['FnLocker'].lock(callback);

        callback(function () {
            nojsja['FnLocker'].unlock(callback);
        });
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

