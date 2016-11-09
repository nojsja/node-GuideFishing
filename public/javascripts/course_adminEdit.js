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

    // 离开警告
    // window.addEventListener('beforeunload', function (event) {
    //     event.returnValue = "警告";
    // });

});

/* 页面全局变量 */
var editAction = {};

/* 初始化UEeditor */
editAction.ueditorInit = function() {

    //课程内容编辑器
    this.ueContent = UE.getEditor('editorContent', {

        autoHeightEnabled : true,
        autoFloatEnabled : true
    });

};

/* 页面事件绑定,DOM操作 */
editAction.pageEventBind = function () {

    // 编辑和预览窗口的显示和隐藏
    $('.self-trigger').click(function () {

        // 触发的窗口
        var target = $(this).attr('triggerTarget');
        var $target = $('.' + target);
        // 隐藏所有窗口
        $target.fadeOut('fast');
        if($target.css('display') != 'block'){
            $target.fadeIn('fast');
        }
    });
};

/* jQuery上传插件事件绑定和回调函数指定 */
editAction.uploadEventBind = function () {

        $('#progress').hide();

        var $jqXHR = $('#fileUpload').fileupload({

            url : '/course/data/upload',
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

            $('.progress-bar').css('width', '0%');
            data.context = $('<div></div>').appendTo($('#fileListDiv'));
            $.each(data.files, function (index, file) {
                var node = $('<p></p>').text(file.name);
                node.appendTo(data.context);
                $('#progress').show();
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

            var progress = parseInt(data.loaded / data.total * 100, 10);
            $('#progress .progress-bar').css(
                'width',
                progress + '%'
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
                var error = $('<span class="text-danger"/>').text('File upload failed.');
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
