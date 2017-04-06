/**
 * Created by yangw on 2016/11/8.
 * 课程详细内容查看页面
 * 课程分为直播课程和非直播课程
 * 直播课程是以聊天的形式来呈现的
 * 非直播课程是以一篇文章的形式来呈现的
 * 区分关键字 isBroadcast
 */

$(function () {

    // 获取课程数据
    ViewAction.readCourseContent();

    // 悬浮按钮初始化
    nojsja.HoverButton.init();
});

/* 页面全局变量
* tagNameArray -- 课程标签组
* tagTypeArray -- 课程标签类型组（course 和 test）
* filter -- 用于课程推荐时的筛选信息
* count -- 用于课程推荐时的每个每个标签的推荐的条目数
* */
var ViewAction = {
    tagNameArray: [],
    tagTypeArray: ["course"],
    filter: {
        filterContentType: null,
        filterContentName: null
    },
    courseName: null,
    courseType: null,
    count: 6
};

/* 读取一个课程的内容 */
ViewAction.readCourseContent = function () {

    var url = '/course/view/readOne';
    var courseName = $('#courseName').text().trim();
    var courseType = $('#courseType').text().trim();

    $.post(url, {
        courseName: courseName,
        courseType: courseType
    }, function (JSONdata) {

        ViewAction.updateCoursePage(JSONdata);
    }, "JSON");
};

/* 更新页面 */
ViewAction.updateCoursePage = function (JSONdata) {

    var JSONobject = JSON.parse(JSONdata);
    console.log(JSONobject);
    if(JSONobject.error){
        return ViewAction.modalWindow('Sorry,发生错误: ' + JSONobject.error);
    }

    /* 对于普通编辑类型的课程 */
    // 课程内容主体
    var $courseContent = $(JSONobject.courseContent);
    $('#courseContent').append($courseContent);
    // 讲师
    var teacher = JSONobject.teacher;
    $('#teacher').text(teacher);
    // 日期
    var date  = JSONobject.date;
    $('#date').text(date);

    // 需要缓存的数据
    ViewAction.courseType = JSONobject.courseType;
    ViewAction.courseName = JSONobject.courseName;
    ViewAction.tagNameArray = JSONobject.courseTags;
    ViewAction.filter.filterContentName = JSONobject.courseName;
    ViewAction.filter.filterContentType = JSONobject.courseType;

    // 获取推荐课程
    ViewAction.getRecommendation();

    /* 对于直播类型的课程 */
    if(ViewAction.stringToBoolean(JSONobject.isBroadcast)){

        // 更新直播数据函数操作映射
        var updateCourseOrigin = {

            // 更新页面文本 //
            texts: function () {

                // 添加DOM
                var $messageList = $('.message-list');
                var $messageItem =
                    $('<div class="message-list-item message-list-item-user">');

                var $pHead = $('<p class="p-head">');
                if(isAdmin){
                    $pHead = $('<p class="p-head p-head-admin">');
                }
                var $PH = $($pHead)
                    .text(date + " " + from);
                var $PB = $('<p>').text(msg);
                $messageItem
                    .append($PH)
                    .append($PB);

                $messageList.append($messageItem);
                // 滚到页面底部
                window.scrollTo(0,document.body.scrollHeight);
            },

            // 更新页面视频消息 //
            videos: function () {

                // 添加DOM
                var $messageList = $('.message-list');
                var $messageItem =
                    $('<div class="message-list-item message-list-item-user">');

                // 首部信息
                var $pHead = $('<p class="p-head">');
                if(isAdmin){
                    $pHead = $('<p class="p-head p-head-admin">');
                }

                // 文本消息
                var $messageItemText =
                    $pHead;
                $messageItemText.text(date + " " + from)
                    .appendTo($messageItem);

                // 视频消息
                var $messageItemVideo =
                    $('<video class="message-list-item-video">');
                $messageItemVideo
                    .prop({
                        src: path,
                        controls: 'controls'
                    })
                    .appendTo($messageItem);

                // 添加到页面
                $messageList.append($messageItem);
                // 滚到页面底部
                window.scrollTo(0,document.body.scrollHeight);
            },

            // 更新页面音频消息 //
            audios: function () {

                // 添加DOM
                var $messageList = $('.message-list');
                var $messageItem =
                    $('<div class="message-list-item message-list-item-user">');

                // 首部信息
                var $pHead = $('<p class="p-head">');
                if(isAdmin){
                    $pHead = $('<p class="p-head p-head-admin">');
                }

                // 文本消息
                var $messageItemText =
                    $pHead;
                $messageItemText.text(date + " " + from)
                    .appendTo($messageItem);

                // 音频消息, 默认是隐藏的, 是HTML5元素
                var $audio =
                    $('<audio>');

                // 媒体获取完毕后
                $audio[0].addEventListener("loadedmetadata", function(){
                    var total = parseInt(this.duration);//获取总时长
                    $(this).attr('duration', total);
                    updateDuration();
                });

                // 设置属性
                $audio
                    .prop({
                        src: path,
                        controls: 'controls',
                        style: 'display: none',
                        preload: 'metadata'
                    })
                    .appendTo($messageItem);

                // 音频DOM自定义元素
                // 音频时长
                // 获取节点对象而不是jQuery对象
                var $audioDefine = $('<div class="audio-define">');
                // 音频标志
                var $audioSpan = $('<span class="glyphicon glyphicon-volume-up">');

                // 把播放时间添加到DOM上去
                function updateDuration() {
                    // 播放时长
                    var $duration = $('<div class="audio-duration">');
                    $duration.text($audio.attr('duration') + '\'\'');
                    $duration.appendTo($audioDefine);
                }

                // 绑定点击事件
                $audioDefine.click(function () {
                    $(this).prop('class', 'audio-define audio-define-read');
                    if($audio[0].paused){
                        $audio[0].play();
                    }else {
                        $audio[0].pause();
                    }
                });


                // 添加音频消息
                $audioDefine.append($audioSpan)
                    .appendTo($messageItem);
                // 添加到页面
                $messageList.append($messageItem);
                // 滚到页面底部
                window.scrollTo(0,document.body.scrollHeight);
            },

            // 更新页面图片消息 //
            images: function () {

                // 添加DOM
                var $messageList = $('.message-list');
                var $messageItem =
                    $('<div class="message-list-item message-list-item-user">');

                // 首部信息
                var $pHead = $('<p class="p-head">');
                if(isAdmin){
                    $pHead = $('<p class="p-head p-head-admin">');
                }

                // 文本消息
                var $messageItemText =
                    $pHead;
                $messageItemText.text(date + " " + from)
                    .appendTo($messageItem);

                // 图片消息
                var $messageItemVideo =
                    $('<img class="message-list-item-image">');
                $messageItemVideo
                    .prop( {src: path} )
                    .appendTo($messageItem);

                // 添加到页面
                $messageList.append($messageItem);
                // 滚到页面底部
                window.scrollTo(0,document.body.scrollHeight);
            }
        };

        // 更新直播数据
        for (var index in JSONobject.courseOrigin){

            // 取得一个消息
            var origin = JSONobject.courseOrigin[index];
            // 直播消息参数 //
            var from = origin.from,
                msg = origin.message || origin.msg,
                path = origin.url,
                messageType = origin.messageType,
                isAdmin = ViewAction.stringToBoolean(origin.isAdmin);

            var date = origin.date || ViewAction.getDate();

            // 添加消息到DOM上
            updateCourseOrigin[messageType]();
        }
    }

};

/* 更新相关推荐课程 */
ViewAction.getRecommendation = function () {

    var url = "/course/recommendation";
    var count = ViewAction.count;
    // 获取1 到 tagNameArray.length的随机数
    var randomNumber = nojsja["Tool"].GetRandomNum(1, ViewAction.tagNameArray.length);
    var _tagNameArray = [];
    _tagNameArray.push(ViewAction.tagNameArray[randomNumber - 1])

    $.post(url, {
        filter: ViewAction.filter,
        count: count,
        tagNameArray: _tagNameArray,
        tagTypeArray: ViewAction.tagTypeArray

    }, function (JSONdata) {
        var JSONobject = JSON.parse(JSONdata);
        if(JSONobject.isError){
            return ViewAction.modalWindow("发生错误：" + JSONobject.error);
        }
        // 更新DOM数据
        /* DOM 结构
         <div class="recommendation-item">
         <span>1</span>
         <a href="jobFound/skill" class="recommendation-item-title">Node.js入门指导</a>
         <div class="recommendation-item-type">职业技能</div>
         </div>
        */
        var $recommendationList = $('.recommendation-list');
        var index = 1;
        for(var item in JSONobject.tagContentArray){

            JSONobject.tagContentArray[item].forEach(function (tagContent) {

                var $recommendationItem = $('<div class="recommendation-item">');
                var $indexSpan = $('<span>');
                $indexSpan.text(index++);

                var $itemTitle = $('<a class="recommendation-item-title">');
                $itemTitle.prop('href', ['/course/detail/', tagContent.contentType, '/', tagContent.contentName].join(''));
                $itemTitle.text(tagContent.contentName);

                var $itemType = $('<div class="recommendation-item-type">');
                $itemType.text(tagContent.contentType);

                $recommendationItem.append($indexSpan)
                    .append($itemTitle)
                    .append($itemTitle);
                $recommendationList.append($recommendationItem);
            });
        }


    }, "JSON");
};

/* Boolean字符串转换函数 */
ViewAction.stringToBoolean = function (string) {

    if(string == "true" && typeof (string) == 'string'){
        return (string = true);
    }
    if(string === true && typeof (string) == 'boolean'){
        return (string = true);
    }
    return (string = false);
};

/* 得到现在的日期 */
ViewAction.getDate = function () {

    var date = new Date();
    var dateArray = [];
    dateArray.push(date.getHours(), ":", date.getMinutes(), ":", date.getSeconds());

    return dateArray.join('');
};

/* 模态弹窗 */
ViewAction.modalWindow = function(text) {
    nojsja.ModalWindow.show(text);
};