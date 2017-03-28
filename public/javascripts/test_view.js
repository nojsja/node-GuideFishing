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
    TestViewAction.pageInit();

    //下一道题目事件绑定
    $('#next').click(TestViewAction.nextItem);
    //上一道题目
    $('#last').click(TestViewAction.lastItem);
    //提交结果
    $('#submitDiv').click(TestViewAction.submit);

});

/* 页面存储变量
* 选项数组 -- choiseArray
* currentNumber -- 当前题号
* choiseTag -- 选项的标志ABC
* itemMode -- 选项模式
* testArray -- 本组题目信息
* */

var TestViewAction = {
    currentNumber: 1,
    //填写选项的对象数组
    choiseArray: [],
    //一组题里面的所有题目对象数组
    testGroup: [],
    testType: null,
    testTitle: null
};

/* 模态弹窗 */
TestViewAction.modalWindow = function(text) {

    nojsja.ModalWindow.show(text);
};

/* 页面初始化 */
TestViewAction.pageInit = function () {


    //获取本套题的所有数据
    var url = ["/test/view/", $('.test-type').text().trim(),
        "/", $('.test-title').text().trim()].join('');

    $.post(url, {}, function (JSONdata) {

        var JSONobject = JSON.parse(JSONdata);
        // 发生错误
        if(JSONobject.isError){
            return TestViewAction.modalWindow('服务器发生错误,错误码: ' +
                JSONobject.error);
        }
        //本组题目列表
        TestViewAction.testGroup = JSONobject.testGroup
        TestViewAction.testType = $('.test-type').text().trim();
        TestViewAction.testTitle = $('.test-title').text().trim();
        if(TestViewAction.testGroup.length == 0){
            return TestViewAction.modalWindow("抱歉没有任何数据!");
        }
        TestViewAction.checkAndUpdate();
        // 初始化悬浮按钮
        nojsja.HoverButton.init();

    }, "JSON");
};

/* 共有的更新页面函数 */
TestViewAction.checkAndUpdate = function () {

    // 判断编号增加后的当前题目是否已经被选择过了
    if(TestViewAction.choiseArray[TestViewAction.currentNumber - 1]){
        $('#' + TestViewAction.choiseArray[TestViewAction.currentNumber   - 1].choiseTag)
            .prop('class', 'choise choise_click');
    }
    //重新更新页面
    //题目
    $('.item-title').text(TestViewAction.testGroup[TestViewAction.currentNumber - 1].itemTitle);
    $('.item-number').text(TestViewAction.testGroup[TestViewAction.currentNumber - 1].itemNumber);
    //遍历选项结果
    var $itemChoises = $('.item-choises');
    //移除前一道题的选择项
    $itemChoises.children().remove();

    for(var index in TestViewAction.testGroup[TestViewAction.currentNumber - 1].itemChoise){

        // 目前的选择项
        var currentTestGroup = TestViewAction.testGroup[TestViewAction.currentNumber - 1];
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
    if(TestViewAction.choiseArray[TestViewAction.currentNumber - 1]){

        $('#' + TestViewAction.choiseArray[TestViewAction.currentNumber   - 1].choiseTag)
            .prop('class', 'choise choise_click');
    }

    //为点击选项绑定函数
    $('.choise').click(function () {
        $('.choise').prop('class', 'choise choise_origin');
        $(this).prop('class', 'choise choise_click');

        TestViewAction.choiseArray[TestViewAction.currentNumber - 1] = {
            choiseTag: $(this).prop('id'),
            scoreDefine: $(this).attr('scoreDefine'),
            itemMode: $(this).attr('itemMode'),
            otherMode: $(this).attr('otherMode') || null,
            choiseValue: $(this).attr('choiseValue') || null,
        }
    });
}

/* 切换到下一道题目 */
TestViewAction.nextItem = function () {

    // 判断是否存在下一道题目
    if(!TestViewAction.testGroup[TestViewAction.currentNumber - 1 + 1]){
        TestViewAction.modalWindow('已经是最后一道题目');
        return;
    }
    //判断当前题目是否已经被选择答案
    if(TestViewAction.choiseArray[TestViewAction.currentNumber - 1]){
        //增加当前题目的编号
        TestViewAction.currentNumber += 1;

        TestViewAction.checkAndUpdate();

        //判断是否已经到最后一道题目
        if(!TestViewAction.testGroup[TestViewAction.currentNumber - 1 + 1]){
            $('#submitDiv').fadeIn();
        }
    }else {
        TestViewAction.modalWindow('在选择本道题的答案后才能进入下一道题.');
    }
};

/* 切换到上一道题目 */
TestViewAction.lastItem = function () {

    if(TestViewAction.choiseArray[TestViewAction.currentNumber - 1 - 1]){
        /* 检测当前题目是否已经选择 */
        if(!TestViewAction.choiseArray[TestViewAction.currentNumber - 1]){
            TestViewAction.modalWindow('请选择当前题目的答案...');
            return;
        }
        TestViewAction.currentNumber -= 1;

        TestViewAction.checkAndUpdate();

    }else {
        TestViewAction.modalWindow("已经位于第一道题目!");
    }
};

/* 提交结果 */
TestViewAction.submit = function () {

    /* 检测当前题目是否已经选择 */
    if(!TestViewAction.choiseArray[TestViewAction.currentNumber - 1]){
        TestViewAction.modalWindow('请选择当前题目的答案...');
        return;
    }
    $.post('/test/submit', {
        submitData: {
            testType: TestViewAction.testType,
            testTitle: TestViewAction.testTitle,
            choiseArray: TestViewAction.choiseArray
        }
    }, function (JSONdata) {
        var JSONobject = JSON.parse(JSONdata);
        //获取结果错误
        if(JSONobject.error){
            TestViewAction.modalWindow('抱歉,服务器发生错误!');
        }
        //返回评测结果,更新页面
        $('.test-result').text(JSONobject.result);
        $('.test-result-border').slideDown();
    }, "JSON");
};
