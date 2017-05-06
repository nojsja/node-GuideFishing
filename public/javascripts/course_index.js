
/**
 * Created by yangw on 2016/11/8.
 * 课程学习主页
 */

/* 初始化函数 */
$(function () {

    CourseAction.userAgent["browser"] = nojsja["Tool"].GetBrowserType();
    // 页面事件绑定
    CourseAction.pageEventBind();
    // 更新课程类型
    CourseAction.updateCourseType();
    //加载指定数量的测试题目列表
    CourseAction.readCourseList({
        courseType: CourseAction.courseType,
        limit: CourseAction.pageLimit
    });
    // 更新热门内容
    CourseAction.updateHot();
    // 滑动图片初始化
    // CourseAction.buildSlideView();
    // 悬浮按钮初始化
    njj.HoverButton.init();
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
    courseTypeChina: {}
};


/* 页面主要事件绑定 */
CourseAction.pageEventBind = function () {

    // 选择课程类型
    $('#courseTypeChoose, #courseTypeChoose2').click(function () {
        CourseAction.headerDown = !CourseAction.headerDown;
        $('.type-item').slideToggle();
        if(CourseAction.headerDown) {
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
CourseAction.updateCourseType = function () {

    var url = "/course/courseType";
    $.post(url, {}, function (JSONdata) {

        var JSONobject = JSON.parse(JSONdata);
        if(JSONobject.isError){
            return CourseAction.modalWindow('[error]: ' + JSONobject.error);
        }

        // 类型列表
        var $typeItemList = $('.type-item-list');
        CourseAction.courseTypeChina = JSONobject.courseTypeChina;

        for(var type in CourseAction.courseTypeChina){
            var $type = $('<div class="type-item">');
            $type.text(CourseAction.courseTypeChina[type])
                .prop('id', type);

            $typeItemList.append($type);
        }
        $typeItemList.append(
            $('<div class="type-item">').text('全部')
                .prop('id', 'ALL')
        );

        //指定类型的课程
        $('.type-item').click(function () {
            CourseAction.courseTypeDefine.call(this, arguments);
        });

    }, "JSON");
};

/* 创建滑动视图 */
CourseAction.buildSlideView = function () {

    var readUrl = '/course/readSlideImage';
    $.post(readUrl, function (jsonData) {
        var jsonObject = JSON.parse(jsonData);
        if(jsonObject.isError){
            return CourseAction.modalWindow(jsonObject.error);
        }
        nojsja.SlideView.init(jsonObject.slideImageArray);
    });
};

/* 读取课程列表 */
CourseAction.readCourseList = function (condition) {

    var url = "/course/readCourseList";
    console.log(condition);
    //请求服务器
    $.post(url, condition, function (JSONdata) {
        //更新页面
        CourseAction.updatePage(JSONdata);
    }, "JSON");
};

/* 加载更多数量的测评文章 */
CourseAction.readMore = function () {

    CourseAction.readCourseList({
        courseType: CourseAction.courseType,
        skip: CourseAction.pageStart,
        limit: CourseAction.pageLimit
    }, function (JSONdata) {
        //更新页面
        CourseAction.updatePage(JSONdata);
    });
};

/* 更新主页事件 */
CourseAction.updatePage = function (JSONdata) {

    //转换成JSON对象
    var parsedData = JSON.parse(JSONdata);
    //测评类型的图片url数组
    var typeImgUrl = parsedData.typeImgUrl;

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
            var imgUrl = typeImgUrl[course.courseType];
            $typeImg.prop('class', 'type-img').css({
                'background': ["url(", imgUrl, ")", " no-repeat"].join(''),
                'background-size': 'cover'
            });
            //该测评所属的类型
            var $courseType = $('<p class="type-text">');
            $courseType.text(CourseAction.courseTypeChina[course.courseType]);
            $contentRight.append($typeImg).append($courseType);

            //显示的日期
            var $date = $('<p class="content-item-date">');
            var $dateIcon = $('<span class="glyphicon glyphicon-time">');
            $date.append($dateIcon.text(course.date));

            //组合所有DOM
            $courseContainer.append($contentLeft)
                .append($contentRight)
                .append($date)
                .css('display', 'none');
            //添加到页面上去
            $('#total').append($courseContainer);
            //以淡入淡出效果出现
            $courseContainer.fadeIn();
        })();
    }
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

    // if(nojsja['FnLocker'].check(callback)){
    //     console.log('locker stil exists.');
    //     return;
    // }
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

        // mconsole.log('on the bottom.');
        // nojsja['FnLocker'].lock(callback);

        // callback(function () {
        //     console.log('unlock');
        //     nojsja['FnLocker'].unlock(callback);
        // });
        callback();
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

