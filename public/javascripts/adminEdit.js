/**
 * Created by yangw on 2016/10/24.
 * 功能:创建评测题目和编辑已有的评测题目
 * 通过传入不同的模板参数可以实现两种功能切换
 */

/*** 初始化函数 ***/
$(function () {

    // 初始化观察者
    editAction.initWatcher();
    // 注册观察者
    editAction.activeWatcher();

    // 导航条
    $('#create').parent().prop('class', 'active');
    //选择题目类型
    $('.test-type').click(function () {
        $('.test-type').css({'background-color': '#3541a2', 'color': 'white'});
        $(this).css({'background-color': '#790000', 'color': '#d2d6d1'});
        editAction.testType = $(this).prop('id');
    });
    // 选择得分类型
    $('.score-mode').click(function () {
        $('.score-mode').css({'background-color': '#3541a2', 'color': 'white'});
        $(this).css({'background-color': '#790000', 'color': '#d2d6d1'});
        editAction.scoreMode.value = $(this).prop('id');
        // 触发观察者事件
        editAction.scoreMode.trigger();
    });
    // 添加一道题目
    $('.edit-add').click(editAction.addTestItem);
    // 确认题目编辑
    $('#editConfirm').click(editAction.editConfirm);
    // 删除本题
    $('#editCancel').click(editAction.editCancel);
    // 选择题目的选项数目
    $('.item-number').click(editAction.choiseNumberSet);
    // 添加和删除分段得分结果统计数据
    $('#scoreConfirm').click(editAction.addScoreSection);
    $('#scoreCancel').click(function () {
        //推出最后一个数据
        editAction.scoreSection.pop();
        //更新DOM
        // 父元素
        var $list = $('.info-list');
        $list.children().remove();
        for(var index in editAction.scoreSection) {
            //分段
            var scoreSec = editAction.scoreSection[index];
            // 分数段
            var section = "分数段" + scoreSec.scoreHead + "~" + scoreSec.scoreTail + ":";
            // 添加DOM元素
            var $div = $('<div class="info-list-item">');
            var $label = $('<div class="item-label">');
            $label.text(section);
            var $result = $('<div class="item-text">');
            $result.text(scoreSec.result);
            $div.append($label).append($result);

            $list.append($div);
        }
    });

    // 完成创建绑定
    $('#submit').click(editAction.submitCheck);

    /*测试*/
    autoFillTest();

});

/*** 页面变量 ***/
var editAction = {
    // 题目类型 标题
    testType: null,
    testTitle: null,
    // 题目集合
    testGroup: {
        group: [], listen: null, trigger: null, watcherList: []
    },
    // 本组题目的当前题号,表示没有添加任何题目
    currentNumber: -1,
    // 本组题目总的数量
    itemNumber: 0,
    // 简要介绍
    abstract: null,
    // 单次记分分值
    scoreValue: null,
    // 分段信息
    scoreSection: [],
    // 记分模式
    scoreMode: {
        value: null, watcherList: [], trigger: null, listen: null,
    },
    // 记分模式组合用于创建题目
    scoreModeGroup: {
        Common: ["CA","CB","CC"],
        NegaPositive: ["Negative", "Positive"]
    }
};

/* 分数模式的简单观察者 */
editAction.initWatcher = function () {

    // 定义分数模式的观察者回调函数
    this.scoreMode.watcherList = [];
    // 为分数模式注册新的观察者
    this.scoreMode.listen = function (fn) {
        this.watcherList.push(fn);
    };
    // 被观察者事件触发
    this.scoreMode.trigger = function () {
        for(var index in this.watcherList){
            this.watcherList[index].apply(this);
        }
    };

    // 定义题目集合的观察者模式
    this.testGroup.listen = function (fn) {
        this.watcherList.push(fn);
    }
    this.testGroup.trigger = function () {
        for(var index in this.watcherList){
            // this -> testGroup
            this.watcherList[index].apply(this);
        }
    };
};

/* 注册观察者 */
editAction.activeWatcher = function () {

    /**
     * 注册得分模式观察者
     * <div class="type-item score-child" id="CA">CA</div>
     * <div class="type-item score-child" id="CB">CB</div>
     * <div class="type-item score-child" id="CC">CC</div>
     * */
    editAction.scoreMode.listen(function () {

        $('.score-child-div').children().remove();
        var childModes = editAction.scoreModeGroup[editAction.scoreMode.value];
        var scoreChildDiv = $('.score-child-div');
        // 添加DOM
        for(var index in childModes){
            (function () {
                var $div = $('<div class="type-item score-child">');
                $div.prop('id', childModes[index])
                    .text(childModes[index]);

                scoreChildDiv.append($div);
            })();
        }
        // 选择得分子类型
        $('.score-child').click(function () {
            console.log(editAction.currentNumber);
            editAction.testGroup.group[editAction.currentNumber].itemMode = $(this).prop('id');
            $('.score-child').css({'background-color': '#3541a2', 'color': 'white'});
            $(this).css({'background-color': '#790000', 'color': '#d2d6d1'});
        });
    });

    /**
     * 注册题目组合观察者
     * **/
    editAction.testGroup.listen(function () {
        // 题目列表
        var $totalList = $('.total-list');
        $totalList.children().remove();

        // 数组变化后更新页面DOM
        for(var index in editAction.testGroup.group){
            // border
            var $editNew = $('<div class="edit-new">');
            // 标题
            var $newTitle = $('<div class="new-title">');
            // 当前题目的编号, index从零开始的
            var thisGroup = editAction.testGroup.group[index];

            ////****
            thisGroup.itemNumber = parseInt(index) + 1;
            $newTitle.text(thisGroup.itemTitle);
            // 选项信息
            var $newChoises = $('<div class="new-choises">');
            for(var i in thisGroup.itemChoise){
                (function (index) {
                    var $choise = $('<div class="choise">');
                    $choise.attr('choose', thisGroup.itemChoise[index].choiseTag)
                        .text(thisGroup.itemChoise[index].choiseContent);
                    //添加DOM
                    $newChoises.append($choise);
                })(i);
            }

            //绑定点击事件
            $editNew.click(function () {
                $('.edit-new').css({'border-left': 'double 4px #8483e6'});
                $(this).css({'border-left': 'double 4px red'});
                // 当前的题号
                //注意题号和目前的编号不一样, 题号大一点
                editAction.currentNumber = thisGroup.itemNumber - 1;
                $('#editNumber').val(thisGroup.itemNumber);
                $('#editTitle').val(thisGroup.itemTitle);

            });

            // 添加到页面上去
            $editNew.append($newTitle)
                .append($newChoises);
            $totalList.prepend($editNew);
        }
    });

};

/**
 * 题目伪数据
 * <div class="edit-new">
 * <!--标题-->
 * <div class="new-title">1.这是题目</div>
 * <!--题目选项-->
 * <div class="new-choises">
 * <div class="choise" choose="A">A选项</div>
 * <div class="choise" choose="B">B选项</div>
 * <div class="choise" choose="C">C选项</div>
 * </div>
 * </div>
 * */

/* 增加一道题目 */
editAction.addTestItem = function () {

    // 添加检查
    if(editAction.scoreMode.value == null){
        return editAction.modalWindow("请先完善上面的'得分类型'一项");
    }

    // 总题目数量增加
    editAction.itemNumber++;
    // 当前题目的题号,用于各个模块之间通信的属性
    var thisNumber = editAction.currentNumber++;
    //初始化一道题的信息
    var initItem = {
        itemTitle: "--请输入标题信息--",
        itemNumber: thisNumber,
        itemMode: null,
        itemChoise: [{
            choiseTag: "A",
            choiseContent: "选项A"
        }, {
            choiseTag: "B",
            choiseContent: "选项B"
        },{
            choiseTag: "C",
            choiseContent: "选项C"
        }]
    };
    // 处理数据依赖
    editAction.testGroup.group.push(initItem);
    // 触发观察者函数
    editAction.testGroup.trigger();

};

/* 提交这道题的编辑结果 */
editAction.editConfirm = function () {

    // 保存选项
    // 所有选择
    var choises = [];
    // 当前编辑项
    var currentGroup = editAction.testGroup.group[editAction.currentNumber];
    console.log(editAction.currentNumber);
    console.log("currentGroup: ", currentGroup);
    $('.input-choise').each(function (index, obj) {
        if(!$(obj).val()){
            return editAction.modalWindow("请填写完整所有的题目选项!");
        }
        choises.push({
            choiseTag: $(obj).attr('choose'),
            choiseContent: $(obj).val()
        });
    });
    currentGroup.itemChoise = choises;

    // 检测输入的题目
    if(!$('#editTitle').val()){
        return editAction.modalWindow('请输入当前题项的题目!');
    }else {
        currentGroup.itemTitle = $('#editTitle').val();
    }

    //检测得分子类型
    if(!currentGroup.itemMode){
        return editAction.modalWindow("选择当前题目得分子类型!");
    }

    //检测题目的选项填写情况
    if(!currentGroup.itemChoise.length){
        return editAction.modalWindow("请添加完整的选项信息!");
    }

    // 触发更新事件
    editAction.testGroup.trigger();
    console.log(currentGroup);
};

/* 删除已经创建的题目 */
editAction.editCancel = function () {

    // 推出一个题目,并且更新数据
    // 数组删除
    editAction.testGroup.group.splice(editAction.currentNumber, 1);
    editAction.testGroup.trigger();
};

/**
 * <div class="info-list-item">
 * <div class="item-label">分数段0-30: </div>
 * <div class="item-text">这是分段在0-30分的统计结果</div>
 * </div>
 * */
/* 增加一个统计分段 */
editAction.addScoreSection = function () {

    // 父元素
    var $list = $('.info-list');
    // 获取分段段首
    var scoreHead = $('#scoreHeadDiv > input').val();
    // 获取分段段尾
    var scoreTail = $('#scoreTailDiv > input').val();
    // 获取统计结论
    var scoreResult = $('#scoreResultDiv > textarea').val();

    if(!(scoreResult && scoreHead && scoreTail)) {
        return editAction.modalWindow("请输入完整的分段信息...");
    }

    // 更新数据依赖
    editAction.scoreSection.push({
        scoreHead: scoreHead,
        scoreTail: scoreTail,
        result: scoreResult
    });

    //移除缓存
    $list.children().remove();

    //更新DOM
    for(var index in editAction.scoreSection) {
        //分段
        var scoreSec = editAction.scoreSection[index];
        // 分数段
        var section = "分数段" + scoreSec.scoreHead + "~" + scoreSec.scoreTail + ":";
        // 添加DOM元素
        var $div = $('<div class="info-list-item">');
        var $label = $('<div class="item-label">');
        $label.text(section);
        var $result = $('<div class="item-text">');
        $result.text(scoreSec.result);
        $div.append($label).append($result);

        $list.append($div);
    }
};

/* 选项个数绑定 */
/** DOM
 * <div class="input-group">
 * <label class="input-group-addon">A</label>
 * <input type="text" class="form-control" id="inputA">
 * </div>
 * **/
editAction.choiseNumberSet = function () {
    var number = $(this).text() || 3;
    // 可供选择的标签数组
    var choiseTagArray = ["A", "B", "C", "D"];
    // 父元素
    var $choises = $('.choises');
    $choises.children().remove();
    $choises.css('display', 'block');
    for(var i = 0; i < number; i++){
        (function (index) {
            var $div = $('<div class="input-group">');
            var $label = $('<label class="input-group-addon">');
            $label.text(choiseTagArray[index]);
            var $input = $('<input type="text" class="form-control input-choise">');
            $input.attr('choose', choiseTagArray[index]);
            // 添加DOM
            $div.append($label)
                .append($input);
            $choises.append($div);
        })(i);
    }
};

/* 创建完成提交检查 */
editAction.submitCheck = function () {

    // 获取所有数据
    var submitData = {};
    // 标题
    var testTitle = $('#testTitle').val();
    if(!testTitle){
        return editAction.modalWindow("请输入测评标题!");
    }else {
        submitData.testTitle = testTitle;
    }
    // 测评类型
    var testType = editAction.testType;
    if(!testType){
        return editAction.modalWindow("请输入测评类型!")
    }else {
        submitData.testType = testType;
    }
    // 测评单个得分分值
    var scoreValue = $('#scoreValue').val();
    if(!scoreValue) {
        return  editAction.modalWindow("请输入得分分值!");
    }else {
        submitData.scoreValue = scoreValue;
    }
    // 得分模式
    var scoreMode = editAction.scoreMode;
    if(!scoreMode) {
        return editAction.modalWindow("请选择得分模式!");
    }else {
        submitData.scoreMode = scoreMode.value;
    }
    // 分数段信息
    if(!editAction.scoreSection.length) {
        return editAction.modalWindow("请至少添加一个分段!");
    }else {
        submitData.scoreSection = editAction.scoreSection;
    }
    // 题目简介
    var abstract = $('#abstract').val();
    if(!abstract) {
        return editAction.modalWindow("请输入简介信息!");
    }else {
        submitData.abstract = abstract;
    }
    // 题目集合检测
    if(!editAction.testGroup.group.length){
        return editAction.modalWindow("请至少添加一道题目!");
    }else {
        submitData.testGroup = editAction.testGroup.group;
    }

    console.log(submitData);
    return;
    $.post('/save', submitData, function (JSONdata) {
        var JSONobject = JSON.parse(JSONdata);
        if(JSONobject.error){
            return editAction.modalWindow("创建出错!请重试...");
        }
        editAction.modalWindow("创建成功!");

    }, "JSON");
};

/* 模态弹窗 */
editAction.modalWindow = function(text) {

    $('.modal-body').text(text);
    $('#modalWindow').modal("show", {
        backdrop : true,
        keyboard : true
    });
}

//测试脚本
function autoFillTest() {
    $('#testTitle').val('测试标题');
    $('#scoreValue').val('10');
    $('#character').click();
    $('#Common').click();
    $('#scoreHeadDiv > input').val('0');
    $('#scoreTailDiv > input').val('50');
    $('#scoreResultDiv > textarea').val('测试分段');
    $('#scoreConfirm').click();
    $('#abstract').val('测试描述信息');

}
