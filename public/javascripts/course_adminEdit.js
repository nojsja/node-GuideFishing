/**
 * Created by yangw on 2016/11/8.
 * 管理员编辑课程页面
 * 富文本编辑器Ueditor
 */

$(function () {


    // 初始化编辑器
    editAction.ueditorInit();
    // 绑定页面事件
    editAction.pageEventBind();
    // 声明观察者
    editAction.watcherInit();
    // 注入观察者
    editAction.watcherActive();

    // 离开警告
    // window.addEventListener('beforeunload', function (event) {
    //     event.returnValue = "警告";
    // });

});

/* 页面全局变量 */
var editAction = {

    // 目前上传的组件
    currentType: "imgUpload",
    // 目前的预览类型
    currentPreviewType: "",
    // 指定文件上传组件的映射关系
    fileUpload: {

        "imgUpload": {
            fileListDiv: "imgListDiv",
            progressDiv: "uploadImgProgress"
        },
        "videoUpload": {
            fileListDiv: "videoListDiv",
            progressDiv: "uploadVideoProgress"
        },
        "audioUpload": {
            fileListDiv: "audioListDiv",
            progressDiv: "uploadAudioProgress"
        }
    },
    // 课程对象
    course: {
        // 数据
        info: {
            courseName: "",
            courseType: "",
            courseAbstract: "",
            courseContent: "",
            teacher: "",
            price: ""
        },
        // 观察者方法
        // 观察者列表, 注入方法和触发方法
        watch: {
            watcherList: [],
            listen: function () {},
            trigger: function () {}
        }
    }
};

/* 初始化观察者 */
editAction.watcherInit = function () {

    // 注册课程数据的观察者
    this.course.watch.watcherList = [];
    // 注入方法
    this.course.watch.listen = function (fn) {
        this.watcherList.push(fn);
        // 返回调用者
        return this;
    };
    // 触发方法
    this.course.watch.trigger = function () {

        // 绑定作用域并执行函数
        for(var index in this.watcherList){
            this.watcherList[index].apply(this);
        }
    };

};

/* 注册观察者 */
editAction.watcherActive = function () {

    // 课程观察者
    this.course.watch.listen(function () {

        // 课程概述
        if(!editAction.ueAbstract.hasContents()){
            return editAction.modalWindow('课程概述需要填写完整!');
        }
        editAction.course.info.courseAbstract = editAction.ueAbstract.getContent();

    }).listen(function () {

        // 课程讲师
        var teacher = $('#teacher').val();

        if( !teacher ){
            return editAction.modalWindow('课程讲师需要填写完整!');
        }
        editAction.course.info.teacher = teacher;

    }).listen(function () {

        // 课程价格
        var price = $('#price').val();

        if( !price ){
            return editAction.modalWindow('课程价格需要填写完整!');
        }
        editAction.course.info.price = price;

    }).listen(function () {

        // 课程内容
        if(!editAction.ueContent.hasContents()){
            return editAction.modalWindow('课程内容需要填写完整!');
        }
        editAction.course.info.courseContent = editAction.ueContent.getContent();
    }).listen(function () {

        if(!editAction.course.info.courseType){
            return editAction.modalWindow('课程类型需要填写完整!');
        }
    });
};

/* 初始化UEeditor */
editAction.ueditorInit = function() {

    //课程内容编辑器
    this.ueContent = UE.getEditor('editorContent', {

        autoHeightEnabled : true,
        autoFloatEnabled : true
    });

    // 课程概述编辑器
    this.ueAbstract = UE.getEditor('editorAbstract', {
        toolbars : [[
            "fullscreen", "source", "undo", "redo", "insertunorderedlist",
            "insertorderedlist", "link", "unlink", "help", "emotion", "pagebreak",
            "date", "bold", "italic",
            "fontborder", "strikethrough", "underline", "forecolor",
            "justifyleft", "justifycenter", "justifyright", "justifyjustify",
            "paragraph", "rowspacingbottom", "rowspacingtop", "lineheight"]],

        autoHeightEnabled : true,
        autoFloatEnabled : true
    });

};

/* 页面事件绑定,DOM操作 */
editAction.pageEventBind = function () {

    $('#uploadAudioProgress, #uploadImgProgress, #uploadVideoProgress').hide();
    // 清除标题
    $('#courseName').val('');

    // 选择类型
    $('.type-item').click(function () {
        $('.type-item').prop('class', 'type-item');
        $(this).prop('class', 'type-item type-item_click');
        var type = $(this).attr('type');
        editAction.course.info.courseType = type;
    });

    // 获取课程名字
    $('#courseName').bind('input propertychange', function() {

        editAction.course.info.courseName = $(this).val();
        // 上传事件绑定
        editAction.uploadEventBind();
    });

    // 提交课程数据
    $('#sendCourse').click(function () {
        // 触发观察者回调函数
        editAction.course.watch.trigger();

        // 提交数据
        $.post('/course/admin/save',
            {
                courseName: editAction.course.info.courseName,
                courseType: editAction.course.info.courseType,
                courseAbstract: editAction.course.info.courseAbstract,
                courseContent: editAction.course.info.courseContent,
                teacher: editAction.course.info.teacher,
                price: editAction.course.info.price
            },
            function (JSONdata) {

                var JSONobject = JSON.parse(JSONdata);
                if(JSONobject.error){
                    return editAction.modalWindow('Sorry,发生错误: ' + err);
                }
                editAction.modalWindow('发布成功!');

            }, "JSON");
    });

    // 编辑和预览窗口的显示和隐藏
    $('.self-trigger').click(function () {

        if(!editAction.course.info.courseName){

            return editAction.modalWindow('在填写课程标题信息后才能进行上传数据和预览数据操作');
        }

        // 触发的窗口
        var target = $(this).attr('triggerTarget');
        var $target = $('.' + target);
        // 隐藏所有窗口
        $target.fadeOut('fast');
        if($target.css('display') != 'block'){
            $target.fadeIn('fast');
        }
    });

    // 预览类型选中
    $('.preview-type').click(function () {

        // 切换特效
        $('.preview-type').prop('class', 'preview-type');
        $(this).prop('class', 'preview-type preview-type_click');

        // 获取预览数据
        var previewType = $(this).attr('preview');
        editAction.currentPreviewType = previewType;
        var url = '/course/data/preview/' + editAction.course.info.courseName;

        $.post(url, { type: previewType }, function (JSONdata) {

            editAction.updatePreview(JSONdata);
        }, "JSON");

    });

};

/* 更新页面的预览窗口 */
editAction.updatePreview = function (JSONdata) {

    var JSONobject = JSON.parse(JSONdata);
    if(JSONobject.error){
        return editAction.modalWindow('Sorry,发生错误: ' + JSONobject.error);
    }

    // 确定当前预览类型
    if(JSONobject.type != editAction.currentPreviewType){
        editAction.currentPreviewType = JSONobject.type;
    }
    // 更新页面
    editAction.updatePreview[editAction.currentPreviewType](JSONobject);
};

// <div class="list-item-audio">
//     <div class="audio-text">我是audio-text</div>
//     <audio src="/temp/test.mp3" title="音频2" controls="controls"></audio>
// </div>
editAction.updatePreview['audio'] = function (JSONobject) {

    // 清除子节点数据
    var $previewList = $('.preview-list');
    $previewList.children().remove();
    // 获取数据列表
    var audioList = JSONobject.dataArray;
    // 遍历更新DOM
    // 有回调函数的情况下要用闭包
    for(var index in audioList){
        (function () {
            var audio = audioList[index],
                name = audio.name,
                url = audio.url;

            // 外层border
            var $listItemAudio = $('<div class="list-item-audio">');

            // 播放控件
            var $audio = $('<audio controls="controls">');
            $audio.prop('title', name)
                .prop('src', url);

            // 提示文字
            var $audioText = $('<div class="audio-text">');
            // 绑定点击事件
            $audioText.text(name);
            // 初始化状态
            $audioText.isClicked = false;
            $audioText.click(function () {

                this.isClicked = !this.isClicked;
                // 被点击
                if(this.isClicked){
                    $(this).prop('class', 'audio-text audio-text_click');
                    // html字符串
                    // 不能使用$audio对象, 这是引用类型, 会有耦合
                    var $$content = $('<p></p>')
                        .append(
                            $('<audio controls="controls">')
                                .prop('title', name)
                                .prop('src', url)
                        )
                        .append($('<br/>'))
                        .html();
                    editAction.ueContent.setContent($$content, true);
                }else {
                    $(this).prop('class', 'audio-text');
                }
            });

            // 添加DOM
            $listItemAudio.append($audioText);
            $listItemAudio.append($audio);

            // 添加到DOM
            $listItemAudio.appendTo($previewList);
        })(index);
    }
};

// <div class="list-item-video">
//     <video src="/temp/test.mp4" title="视频"></video>
// </div>
editAction.updatePreview['video'] = function (JSONobject) {

    // 清除子节点数据
    var $previewList = $('.preview-list');
    $previewList.children().remove();
    // 获取数据列表
    var videoList = JSONobject.dataArray;
    // 遍历更新DOM
    // 闭包
    for(var index in videoList){

        (function (index) {
            var video = videoList[index],
                name = video.name,
                url = video.url;

            var $listItemVideo = $('<div class="list-item-video">');

            var $video = $('<video>');
            $video.prop('title', name)
                .prop('src', url);

            // 绑定点击事件
            $video.isClicked = false;
            $video.click(function () {
                this.isClicked = !this.isClicked;
                // 被选中
                if(this.isClicked){
                    $(this).prop('class', 'video_click');
                    $listItemVideo.prop('class', 'list-item-video list-item-video_click');

                    // 添加内容到富文本编辑器
                    var $$content = $('<p></p>')
                        .append(
                            $('<video controls="controls">')
                                .prop('title', name)
                                .prop('src', url)
                        )
                        .append($('<br/>'))
                        .html();
                    editAction.ueContent.setContent($$content, true);

                }else {
                    $(this).prop('class', '');
                    $listItemVideo.prop('class', 'list-item-video');
                }
            });

            $listItemVideo.append($video);

            $previewList.append($listItemVideo);
        })(index);
    }

};

// <div class="list-item-image">
//     <img src="/temp/test.png" title="图片">
// </div>
editAction.updatePreview['image'] = function (JSONobject) {

    // 清除子节点数据
    var $previewList = $('.preview-list');
    $previewList.children().remove();
    // 获取数据列表
    var imageList = JSONobject.dataArray;
    // 遍历更新DOM
    for(var index in imageList){

        (function () {
            var image = imageList[index],
                name = image.name,
                url = image.url;

            var $listItemImage = $('<div class="list-item-image">');

            var $image = $('<img>');
            $image.prop('src', url)
                .prop('title', name);

            // 绑定点击事件
            $image.isClicked = false;
            $image.click(function () {
                this.isClicked = !this.isClicked;
                // 被选中
                if(this.isClicked){
                    $(this).prop('class', 'img_click');
                    $listItemImage.prop('class', 'list-item-image list-item-image_click');

                    // 添加到富文本编辑器
                    var $$content = $('<p></p>')
                        .append(
                            $('<img>')
                                .prop('title', name)
                                .prop('src', url)
                        )
                        .append($('<br/>'))
                        .html();
                    editAction.ueContent.setContent($$content, true);
                }else {
                    $(this).prop('class', '');
                    $listItemImage.prop('class', 'list-item-image list-item-image_click');
                }
            });

            $listItemImage.append($image);

            $previewList.append($listItemImage);
        })();
    }
};



/* jQuery上传插件事件绑定和回调函数指定 */
editAction.uploadEventBind = function () {

    // 重新创建节点, 绑定事件, jQuery fileupload中只能传入静态参数
    $('#imgUpload, #videoUpload, #audioUpload').each(function (index, element) {

        var $father = $(element).parent();
        var id = $father.attr('child');
        var $newChild = $('<input type="file" multiple=true size="5" value="选择" class="btn btn-default">');
        $newChild.prop('id', id);

        $newChild.click(function () {
            editAction.currentType = $(this).prop('id');
        });

        $(element).remove();
        $father.append($newChild);

    });

    // 绑定三个文件上传组件的上传事件并移除之前的事件
    // 只能传入静态参数
    var $jqXHR = $('#imgUpload, #videoUpload, #audioUpload').fileupload({

        url : '/course/data/upload/' + editAction.course.info.courseName,
        dataType : 'json',
        //autoUpload: false,
        //acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
        maxFileSize : 2000000000,
        // Enable image resizing, except for Android and Opera,
        // which actually support image resizing, but fail to
        // send Blob objects via XHR requests:
        disableImageResize : /Android(?!.*Chrome)|Opera/
            .test(window.navigator.userAgent),
        previewMaxWidth : 100,
        previewMaxHeight : 100,
        previewCrop : true

        //文件加载
    }).on('fileuploadadd', function (e, data) {

        var progress = editAction.fileUpload[editAction.currentType].progressDiv;
        // fileListDiv
        var $fileListDiv = $('#' + editAction.fileUpload[editAction.currentType].fileListDiv);

        $('#' + progress + ' > .progress-bar').css('width', '0%');
        data.context = $('<div></div>').appendTo($fileListDiv);
        $.each(data.files, function (index, file) {
            var node = $('<p></p>').text(file.name);
            node.appendTo(data.context);
            $('#' + progress).show();
        });

    }).on('fileuploadprocessalways', function(e, data) {

        var index = data.index,
            file = data.files[index],
            node = $(data.context.children()[index]);
        if (file.preview) {
            node.prepend('<br>')
                .prepend(file.preview);
        }
        if (file.error) {
            node.append('<br>')
                .append($('<span class="text-danger"/>').text(file.error));
        }
        if (index + 1 === data.files.length) {
            data.context.find('button')
                .text('Upload')
                .prop('disabled', !!data.files.error);
        }

        //上传进度
    }).on('fileuploadprogressall', function(e, data) {

        // progressDiv 的id
        var progress = editAction.fileUpload[editAction.currentType].progressDiv;

        var progressValue = parseInt(data.loaded / data.total * 100, 10);
        console.log(progressValue);
        console.log('#' + progress + ' > .progress-bar');
        $('#' + progress + ' > .progress-bar').css(
            'width',
            progressValue + '%'
        );

        //上传完成
    }).on('fileuploaddone', function (e, data) {

        $.each(data.result.files, function (index, file) {
            if (file.url) {
                var link = $('<a>')
                    .attr('target', '_blank')
                    .prop('href', file.url);
                $(data.context.children()[index])
                    .wrap(link);
            } else if (file.error) {
                var error = $('<span class="text-danger"/>').text(file.error);
                $(data.context.children()[index])
                    .append('<br>')
                    .append(error);
            }
        });

        //上传失败
    }).on('fileuploadfail', function (e, data) {

        $.each(data.files, function (index, file) {
            var error = $('<span class="text-danger"/>').text('文件上传失败!');
            $(data.context.children()[index])
                .append('<br>')
                .append(error);
        });

    }).prop('disabled', !$.support.fileInput)
        .parent().addClass($.support.fileInput ? undefined : 'disabled');

    //取消上传
    $('#cancel').click(function () {
        $jqXHR.abort();
    });
};

/* 模态弹窗 */
editAction.modalWindow = function(text) {

    $('.modal-body').text(text);
    $('#modalWindow').modal("show", {
        backdrop : true,
        keyboard : true
    });
};
