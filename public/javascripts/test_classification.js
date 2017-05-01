/**
 * Created by yangw on 2017/5/1.
 */

$(function () {

    // 初始化悬浮按钮
    nojsja["HoverButton"].init();

    // 获取课程类型信息
    ClassificationAction.getTestType();
});

/* 页面全局变量 */
var ClassificationAction = {};

/* 获取所有课程类型信息 */
ClassificationAction.getTestType = function () {

    var url = '/test/classification';
    $.post(url, {}, function (JSONdata) {

        var JSONobject = JSON.parse(JSONdata);
        if(JSONobject.isError){
            return nojsja["ModalWindow"].show('发生错误：' + JSONobject.error);
        }
        ClassificationAction.updateTestType(JSONobject);
    }, "JSON")
};

/* 更新页面课程信息 */
ClassificationAction.updateTestType = function (JSONobject) {

    var $classificationContainer = $('.classification-container');
    $classificationContainer.children().remove();

    // 课程类型信息
    var classificationInfo = JSONobject.classificationInfo;
    // 中英翻译
    var testTypeChina = JSONobject.testTypeChina;
    // 类型图片地址
    var testTypeImage = JSONobject.testTypeImage;

    for(var classification in classificationInfo){

        // 一个类型条目
        var $classificationItem = $('<div class="classification-item">');

        // 类型图片
        var $classificationImage = $('<a class="classification-item-image">');
        $classificationImage.append(
            $('<img>').prop('src', testTypeImage[classification])
        );

        // 类型标题
        var $classificationTitle = $('<div class="classification-item-title">');
        $classificationTitle.append(
            $('<span>').text(testTypeChina[classification])
        );

        // 类型数目
        var $classificationNumber = $('<div class="classification-item-number">');
        $classificationNumber.text(classificationInfo[classification] + ' total');

        // 指向箭头
        var $classificationPointer = $('<div class="classification-item-pointer">');
        $classificationPointer.append(
            $('<i class="icon-double-angle-right">')
        );

        (function (classification) {

            // 绑定事件
            nojsja["EventUtil"].addHandler($classificationItem[0], 'click', function () {

                window.location.href = "/test/index/" + classification;
            });

        })(classification)

        // 添加到DOM
        $classificationItem
            .append($classificationImage)
            .append($classificationTitle)
            .append($classificationNumber)
            .append($classificationPointer);

        $classificationContainer.append($classificationItem);
    }
};