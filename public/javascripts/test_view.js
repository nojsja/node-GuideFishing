/**
 * Created by yangw on 2016/10/19.
 * 某一个测评组的测评页面,
 * 用户可以在此页面进行测评,
 * 页面主要包括载入某一个测评题目
 * 和提交用户的测评结果,
 * 最后将服务器统计的结果展示给用户.
 */

$(function () {

    //初始化页面
    viewAction.pageInit();

    //下一道题目事件绑定
    $('#next').click(viewAction.nextItem);
    //上一道题目
    $('#last').click(viewAction.lastItem);
    //提交结果
    $('#submitDiv').click(viewAction.submit);

});

/* 页面存储变量
* 选项数组 -- choiseArray
* currentNumber -- 当前题号
* choiseTag -- 选项的标志ABC
* itemMode -- 选项模式
* testArray -- 本组题目信息
* */

var viewAction = {
    currentNumber: 1,
    //填写选项的对象数组
    choiseArray: [],
    //一组题里面的所有题目对象数组
    testArray: [],
    courseType: null,
    testTitle: null
};

/* 模态弹窗 */
viewAction.modalWindow = function(text) {

    $('.modal-body').text(text);
    $('#modalWindow').modal("show", {
        backdrop : true,
        keyboard : true
    });
};

/* 页面初始化 */
viewAction.pageInit = function () {

    //获取本套题的所有数据
    var url = "/test/testView/" + $('.test-type').text().trim() + "/" + $('.test-title').text().trim();
    $.post(url, {}, function (JSONdata) {
        var JSONobject = JSON.parse(JSONdata);
        //本组题目列表
        viewAction.testGroup = JSONobject.testGroup
        viewAction.courseType = $('.test-type').text().trim();
        viewAction.testTitle = $('.test-title').text().trim();
        if(viewAction.testGroup.length == 0){
            return viewAction.modalWindow("抱歉没有任何数据!");
        }
        viewAction.checkAndUpdate();

    }, "JSON");
};

/* 共有的更新页面函数 */
viewAction.checkAndUpdate = function () {

    // 判断编号增加后的当前题目是否已经被选择过了
    if(viewAction.choiseArray[viewAction.currentNumber - 1]){
        $('#' + viewAction.choiseArray[viewAction.currentNumber   - 1].choiseTag).css({
            'background-color': '#7f948c',
            'color': 'white'
        });
    }
    //重新更新页面
    //题目
    $('.item-title').text(viewAction.testGroup[viewAction.currentNumber - 1].itemTitle);
    $('.item-number').text(viewAction.testGroup[viewAction.currentNumber - 1].itemNumber);
    //遍历选项结果
    var $itemChoises = $('.item-choises');
    //移除前一道题的选择项
    $itemChoises.children().remove();

    for(var index in viewAction.testGroup[viewAction.currentNumber - 1].itemChoise){

        // 目前的选择项
        var currentTestGroup = viewAction.testGroup[viewAction.currentNumber - 1];
        //其中一个选项
        var $choiseDiv = $('<div class="choise">');
        //选项标签和选项内容
        var choiseTag = currentTestGroup.itemChoise[index].choiseTag;
        var choiseContent = currentTestGroup.itemChoise[index].choiseContent;
        // 判断当前题是否是自定义得分
        if(currentTestGroup.scoreDefine){
            var choiseValue = currentTestGroup.itemChoise[index].choiseValue;
            $choiseDiv.attr('choiseValue', choiseValue);
            $choiseDiv.attr('scoreDefine', currentTestGroup.scoreDefine);
        }
        // 判断当前题目的第二种计分模式
        if(currentTestGroup.otherMode){
            var otherMode = currentTestGroup.otherMode;
            $choiseDiv.attr('otherMode', otherMode);
        }
        $choiseDiv.attr('itemMode', currentTestGroup.itemMode);
        $choiseDiv.prop('id', choiseTag);
        $choiseDiv.text(choiseTag + "." + choiseContent);
        //添加到页面上
        $itemChoises.append($choiseDiv);
    }

    //判断是否已经被选择过
    if(viewAction.choiseArray[viewAction.currentNumber - 1]){

        $('#' + viewAction.choiseArray[viewAction.currentNumber   - 1].choiseTag).css({
            'background-color': '#7f948c',
            'color': 'white'
        });
    }

    //为点击选项绑定函数
    $('.choise').click(function () {
        $('.choise').css({
            'color': '#7f948c',
            'background-color': 'white'
        });
        $(this).css({
            'background-color': '#7f948c',
            'color': 'white'
        });

        viewAction.choiseArray[viewAction.currentNumber - 1] = {
            choiseTag: $(this).prop('id'),
            scoreDefine: $(this).attr('scoreDefine'),
            itemMode: $(this).attr('itemMode'),
            otherMode: $(this).attr('otherMode') || null,
            choiseValue: $(this).attr('choiseValue') || null,
        }
    });
}

/* 切换到下一道题目 */
viewAction.nextItem = function () {

    // 判断是否存在下一道题目
    if(!viewAction.testGroup[viewAction.currentNumber - 1 + 1]){
        viewAction.modalWindow('已经是最后一道题目');
        return;
    }
    //判断当前题目是否已经被选择答案
    if(viewAction.choiseArray[viewAction.currentNumber - 1]){
        //增加当前题目的编号
        viewAction.currentNumber += 1;

        viewAction.checkAndUpdate();

        //判断是否已经到最后一道题目
        if(!viewAction.testGroup[viewAction.currentNumber - 1 + 1]){
            $('#submitDiv').fadeIn();
        }
    }else {
        viewAction.modalWindow('在选择本道题的答案后才能进入下一道题.');
    }
};

/* 切换到上一道题目 */
viewAction.lastItem = function () {

    if(viewAction.choiseArray[viewAction.currentNumber - 1 - 1]){
        /* 检测当前题目是否已经选择 */
        if(!viewAction.choiseArray[viewAction.currentNumber - 1]){
            viewAction.modalWindow('请选择当前题目的答案...');
            return;
        }
        viewAction.currentNumber -= 1;

        viewAction.checkAndUpdate();

    }else {
        viewAction.modalWindow("已经位于第一道题目!");
    }
};

/* 提交结果 */
viewAction.submit = function () {

    /* 检测当前题目是否已经选择 */
    if(!viewAction.choiseArray[viewAction.currentNumber - 1]){
        viewAction.modalWindow('请选择当前题目的答案...');
        return;
    }
    $.post('/test/submit', {
        submitData: {
            courseType: viewAction.courseType,
            testTitle: viewAction.testTitle,
            choiseArray: viewAction.choiseArray
        }
    }, function (JSONdata) {
        var JSONobject = JSON.parse(JSONdata);
        //获取结果错误
        if(JSONobject.error){
            viewAction.modalWindow('抱歉,服务器发生错误!');
        }
        //返回评测结果,更新页面
        $('.test-result').text(JSONobject.result);
        $('.test-result-border').slideDown();
    }, "JSON");
};
