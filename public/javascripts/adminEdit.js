/**
 * Created by yangw on 2016/10/24.
 * 功能:创建评测题目和编辑已有的评测题目
 * 通过传入不同的模板参数可以实现两种功能切换
 */

/* 初始化函数 */
$(function () {
    // 添加一道题目
    $('.edit-add').click(editAction.addTestItem);
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
});

/* 页面变量 */
var editAction = {
    // 题目类型
    testType: null,
    // 标题
    testTitle: null,
    // 题目集合
    testGroup: [],
    // 本组题目的当前题号
    itemNumber: 1,
    // 简要介绍
    abstract: null,
    // 单次记分分值
    scoreValue: null,
    // 分段信息
    scoreSection: [],
    // 记分模式
    scoreMode: null,
    // 记分模式组合用于创建题目
    scoreModeGroup: {
        Common: ["CA,CB,CC"],
        NegaPositive: ["Negative", "Positive"]
    }
};

/**
 * 题目伪数据
 * <div class="edit-new">
 * <!--标题-->
 * <div class="new-title">1.这是题目</div>
 * <!--题目选项-->
 * <div class="new-choises">
 * <div class="choise" choose="choiseA">A选项</div>
 * <div class="choise" choose="choiseB">B选项</div>
 * <div class="choise" choose="choiseC">C选项</div>
 * </div>
 * </div>
 * */

/* 增加一道题目 */
editAction.addTestItem = function () {
    // 题目列表
    var $totalList = $('.total-list');
    // border
    var $editNew = $('<div class="edit-new">');

    //绑定数据依赖

    // 标题
    var $newTitle = $('<div class="new-title">');
    $newTitle.text("--请输入标题信息--");
    // 选项信息
    var $newChoises = $('<div class="new-choises">');
    var choiseArray = ["A", "B", "C"];
    for(var i in  choiseArray){
        (function (index) {
            var $choise = $('<div class="choise">');
            $choise.attr('choose', 'choise'+choiseArray[index])
                .text('选项'+choiseArray[index]);
            //添加DOM
            $newChoises.append($choise);
        })(i);
    }

    // 添加dom
    $editNew.append($newTitle)
        .append($newChoises);
    $totalList.prepend($editNew);
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
            var $input = $('<input type="text" class="form-control">');
            $input.prop('id', 'input' + choiseTagArray[index]);
            // 添加DOM
            $div.append($label)
                .append($input);
            $choises.append($div);
        })(i);
    }
};


/* 模态弹窗 */
editAction.modalWindow = function(text) {

    $('.modal-body').text(text);
    $('#modalWindow').modal("show", {
        backdrop : true,
        keyboard : true
    });
};
