
/**
 * Created by yangw on 2016/11/8.
 * 课程学习主页
 */

/* 初始化函数 */
$(function () {

    // 页面事件绑定
    courseAction.pageEventBind();
    //加载指定数量的测试题目列表
    courseAction.readCourseList({ courseType: "ALL" });
});

/*** 页面全局变量 ***/
var courseAction = {
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
    //加载的测试类型
    courseType: "ALL",
    //是否清除页面已存数据
    isClear: false
};

/* 页面主要事件绑定 */
courseAction.pageEventBind = function () {

    $('.header-label').click(function () {
        courseAction.headerDown = !courseAction.headerDown;
        $('.type-item').slideToggle();
        if(courseAction.headerDown) {
            $('.header-label > span').prop('class', 'glyphicon glyphicon-chevron-up');
        }else {
            $('.header-label > span').prop('class', 'glyphicon glyphicon-chevron-down');
        }
    });
    //热门内容事件绑定
    $('.jump').click(courseAction.pageHotContentAction);

    //顶部和底部跳转
    $('#top').click(courseAction.goTop);
    $('#bottom').click(courseAction.goBottom);
    //高度检测
    /*windowHeightCheck();*/
    //滑动检测函数
    $(window).scroll(courseAction.scrollCheck);
    //加载更多数据
    $('.loading-info').click(courseAction.readMore);

    //指定类型的测试题目
    $('.type-item').click(function () {
        courseAction.courseTypeDefine.call(this, arguments);
    });
};

/* 读取课程列表 */
courseAction.readCourseList = function (condition) {

    var url = "/course/readCourseList";
    //请求服务器
    $.post(url, condition, function (JSONdata) {
        //更新页面
        courseAction.updatePage(JSONdata);
    }, "JSON");
};

/* 加载更多数量的测评文章 */
courseAction.readMore = function () {

    courseAction.readCourseList({
        courseType: courseAction.courseType,
        skip: courseAction.pageStart
    }, function (JSONdata) {
        //更新页面
        courseAction.updatePage(JSONdata);
    });
}

/* 更新主页事件 */
courseAction.updatePage = function (JSONdata) {

    // 课程类型对应中文
    var courseTypeChina = {

        "jobFound": "求职秘籍",
        "jobSkill": "职场技能",
        "software": "软件技巧",
        "english": "英语进阶",
        "personal": "个人提升"
    };

    //转换成JSON对象
    var parsedData = JSON.parse(JSONdata);
    //测评类型的图片url数组
    var typeImgUrl = parsedData.typeImgUrl;

    if(parsedData.error){
        return this.modalWindow("服务器发生错误: " + parsedData.error);
    }
    //清除缓存数据
    if(courseAction.isClear) {
        $('#total').children().remove();
        //重置标志位
        courseAction.isClear = false;
    }
    //没有数据提示用户
    if(parsedData.courseArray.length == 0){
        this.modalWindow('抱歉,没有更多数据!');
    }
    //遍历对象数组构造DOM对象
    for(var courseIndex in parsedData.courseArray) {
        //增加游标控制页面读取的起始位置
        courseAction.pageStart += 1;
        (function () {
            var course = parsedData.courseArray[courseIndex];
            //最外层container
            var $courseContainer = $('<div class="content-item shadow-grey">');
            //图钉图标
            var $pushPin = $('<span class="glyphicon glyphicon-pushpin push-pin"></span>');
            //内容左部分区
            var $contentLeft = $('<div class="content-item-left">');
            //内容标题
            var $contentTitle = $('<a class="content-item-title">');
            //添加超链接
            $contentTitle.prop('href','/course/courseDetail/' + course.courseType + '/' +
                course.courseName);
            $contentTitle.text(course.courseName);
            //内容摘要和图标
            var $abstract = $('<div class="content-item-abstract">');
            var $pencil = $('<span class="glyphicon glyphicon-pencil">');
            $abstract.append($pencil.text(course.abstract));
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
            $courseType.text(courseTypeChina[course.courseType]);
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
courseAction.courseTypeDefine = function () {

    //通过触发对象id获取函数执行环境下的courseType
    var courseType = $(this).prop('id');
    //重置分页数据
    courseAction.pageStart = 0;
    courseAction.pageLimit = 15;
    courseAction.courseType = courseType;
    courseAction.isClear = true;

    //读取指定类型的列表
    courseAction.readCourseList({
        courseType: courseAction.courseType,
        pageStart: courseAction.pageStart,
        pageLimit: courseAction.pageLimit

    }, function (err, JSONdata) {
        if(err){
            return this.modalWindow("发生错误: " + err);
        }
        courseAction.updatePage(JSONdata);
    });
};

/* 热门内容事件绑定 */
courseAction.pageHotContentAction = function () {

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
    courseAction.updateHot();
};

/* 更新热门内容 */
courseAction.updateHot = function (type) {

    return;
    $.post('/course/readHot', {hotType: type}, function (JSONdata){}, "JSON");
};

/* 模态弹窗 */
courseAction.modalWindow = function(text) {

    $('.modal-body').text(text);
    $('#modalWindow').modal("show", {
        backdrop : true,
        keyboard : true
    });
};

/* 页面底部和底部跳转 */
courseAction.goTop = function goTop() {
    $('html, body').animate({ scrollTop: 0 }, 'slow');
};

courseAction.goDiv = function goDiv(div) {
    var a = $("#" + div).offset().top;
    $("html, body").animate({ scrollTop: a }, 'slow');
};

courseAction.goBottom = function goBottom() {
    //两个参数分别是左上角显示的文档的x坐标和y坐标
    //scrollHeight 和 clientHeight分别是文档能够滚动的总高度和文档在当前窗口的可见高度
    window.scrollTo(0, document.documentElement.scrollHeight -
        document.documentElement.clientHeight);
};

/* 滚动侦测 */
courseAction.scrollCheck = function () {

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
        courseAction.scrollOver = true;
        if(courseAction.lastScrollOver !== courseAction.scrollOver){
            $('.page-anchor').fadeIn();
        }
        courseAction.lastScrollOver = courseAction.scrollOver;
    }else {
        courseAction.scrollOver = false;
        if(courseAction.lastScrollOver !== courseAction.scrollOver){
            $('.page-anchor').fadeOut();
        }
        courseAction.lastScrollOver = courseAction.scrollOver;
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

