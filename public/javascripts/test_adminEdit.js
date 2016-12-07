/**
 * Created by yangw on 2016/10/24.
 * 功能:创建评测题目和编辑各个子题目
 * 通过预先传入数据也可以对一个已经存在的
 * 题目数据对象进行编辑和修改
 */

/*** 初始化函数 ***/
$(function () {

    // 初始化观察者模式
    editAction.initWatcher();
    // 注册观察者
    editAction.activeWatcher();

    //设置editNumber不可点击
    $('#editNumber').focus(function () {
        $(this).blur();
    });

    // 初始化导航条显示信息
    $('#create').parent().prop('class', 'active');
    //选择题目类型
    $('.test-type').click(function () {
        // 效果改变
        $('.test-type').prop('class', 'type-item test-type');
        $(this).prop('class', 'type-item test-type test-type_click');
        editAction.testType = $(this).prop('id');
    });
    // 选择得分类型
    $('.score-mode').click(function () {
        //效果改变
        $('.score-mode').prop('class', 'type-item score-mode');
        $(this).prop('class', 'type-item score-mode score-mode_click');
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
    $('#scoreCancel').click(editAction.deleteScoreSection);

    // 完成创建绑定
    $('#submit').click(editAction.submitCheck);

    /* 测试,运行环境下移除此方法 */
    /* autoFillTest(); */

    // 鼠标显示悬浮框
    $('.score-mode').hover(function (event) {
        var position = getMousePosition(event);
        var describe = $(this).attr('describe');
        singleTon.buildHoverLabel(position, describe);
    });
    // 鼠标离开事件
    $('.score-mode').mouseleave(function () {
        singleTon.hiddenHoverLabel();
    });
    //刷新事件绑定
    // window.addEventListener("beforeunload", function(event) {
    //     event.returnValue = "警告";
    // });
});

/*** 页面变量 ***/
var editAction = {

    // 题目类型和标题
    testType: null,
    testTitle: null,
    // 题目集合,包含观察者模式的相关方法,group存储题目集合
    testGroup: {
        group: [], listen: null, trigger: null, watcherList: []
    },
    // 本组题目的当前题号,表示没有添加任何题目
    currentNumber: 0,
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
        value: null, watcherList: [], trigger: null, listen: null
    },
    // 子类型
    categorySection: {
        section: [], watcherList: [], trigger: null, listen: null
    },
    // 记分模式组合用于创建题目
    // 后期可以考虑将各种数据类型存入后台, 增加程序的可扩展性
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
    };
    this.testGroup.trigger = function () {
        for(var index in this.watcherList){
            // this -> testGroup
            this.watcherList[index].apply(this);
        }
    };

    // 定义添加得分子类型的观察者模式
    this.categorySection.listen = function (fn) {
        this.watcherList.push(fn);
    };
    this.categorySection.trigger = function () {
        for(var index in this.watcherList){
            this.watcherList[index].apply(this);
        }
    };
};

/* 注册观察者 */
editAction.activeWatcher = function () {

    /**
     * 注册得分模式scoreMode观察者
     * */
    editAction.scoreMode.listen(function () {

        $('.score-child-div').children().remove();

        // 类别模式做额外处理
        if(editAction.scoreMode.value == "Category"){

            // 相关选项
            $('.child-of-category').prop('class', 'child-of-category child-of-category_show');
            // 移除类别模式设置
            $('#childModeAdd').css('display', 'block');
            // 类别得分模式下不需要得分段
            $('#scoreSectionSet').css('display', 'none');
            
            // 添加类别事件
            $('#categoryConfirm').click(function () {
                // 子模式名
                var categoryMode = $('.category-mode').val();
                var categoryDescribe = $('.category-describe').val();
                if(!(categoryDescribe && categoryMode)){
                    return editAction.modalWindow("请完善子类别信息.");
                }
                // 更新数据依赖, 子类型组放入一个子类型对象
                editAction.categorySection.section.push({
                    categoryMode: categoryMode,
                    categoryDescribe: categoryDescribe
                });
                // 触发观察者事件
                editAction.categorySection.trigger();
            });

            // 删除类别事件
            $('#categoryCancel').click(function () {
                editAction.categorySection.section.pop();
                // 触发观察者事件
                editAction.categorySection.trigger();
            });

        }else {

            $('.child-of-category').prop('class', 'child-of-category child-of-category_hidden');
            // 移除分段设置
            $('#scoreSectionSet').css('display', 'block');
            $('#childModeAdd').css('display', 'none');

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
                editAction.testGroup.group[editAction.currentNumber].itemMode = $(this).prop('id');
                $('.score-child').prop('class', 'type-item score-child');

                $(this).prop('class', 'type-item score-child score-child_click');
            });
        }
    });

    /**
     * 注册题目组合testGroup观察者
     * **/
    editAction.testGroup.listen(function () {
        // 题目列表
        var $totalList = $('.total-list');
        $totalList.children().remove();

        // 数组变化后更新页面DOM
        for(var index in editAction.testGroup.group){
            // 使用javascript闭包
            // index会动态改变
            // var thisGroup = editAction.testGroup.group[index];
            // 这句是个引用类型
            (function (index) {
                // border
                var $editNew = $('<div class="edit-new">');
                // 标题
                var $newTitle = $('<div class="new-title">');
                // 当前题目的编号, index从零开始的
                var thisGroup = editAction.testGroup.group[index];

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

                // 绑定题项点击事件
                $editNew.click(function () {
                    $('.edit-new').prop('class', 'edit-new border-left');
                    $(this).prop('class', 'edit-new border-left_red');
                    // 置为初始状态
                    $('#scoreDefine, #negativeType, #positiveType').prop('checked', false);
                    // 得分子类型和选项个数重置
                    $('.score-child, .item-number, .category-child')
                        .prop('class', 'type-item score-child');
                    // 所有选项移除
                    $('.choises').children().remove();
                    // 当前的题号
                    // 注意题号和目前的编号不一样, 题号大一点
                    editAction.currentNumber = thisGroup.itemNumber - 1;
                    $('.child-of-category > input').prop('checked', false);
                    $('#editNumber').val(thisGroup.itemNumber);
                    $('#editTitle').val(thisGroup.itemTitle);

                });

                // 添加到页面上去
                $editNew.append($newTitle)
                    .append($newChoises);
                $totalList.prepend($editNew);

            })(index);
        }
    });

    /**
     * 注册得分子类型的观察者
     * **/
    editAction.categorySection.listen(function () {

        // 子类型列表
        var $categoryList = $('.category-list');
        $categoryList.children().remove();

        //添加DOM
        for(var index in editAction.categorySection.section){

            (function (i) {
                // 添加DOM元素
                var $div = $('<div class="category-list-item">');
                var $label = $('<div class="item-label">');
                $label.text(editAction.categorySection.section[i].categoryMode);
                var $result = $('<div class="item-text">');
                $result.text(editAction.categorySection.section[i].categoryDescribe);
                $div.append($label).append($result);

                $categoryList.append($div);
            })(index);
        }

        // 父组件
        var scoreChildDiv = $('.score-child-div');
        scoreChildDiv.children().remove();
        // 所有自定义子类型数据
        var categorySection = editAction.categorySection.section;

        // 添加DOM
        for(var index2 in categorySection){
            (function () {
                var $div = $('<div class="type-item category-child">');
                $div.prop('id', categorySection[index2].categoryMode)
                    .text(categorySection[index2].categoryMode);

                scoreChildDiv.append($div);
            })();
        }
        // 选择得分子类型
        $('.category-child').click(function () {
            editAction.testGroup.group[editAction.currentNumber].itemMode = $(this).prop('id');
            $('.category-child').prop('class', 'type-item category-child');

            $(this).prop('class', 'type-item category-child category-child_click');
        });

        // 自定义得分绑定
        $('#scoreDefine').change(function () {
            // 被选中允许自定义得分
            if($(this).prop('checked')){
                // 本小题允许自定义得分
                editAction.testGroup.group[editAction.currentNumber].scoreDefine = true;
                editAction.testGroup.group[editAction.currentNumber].otherMode = null;
                $('#negativeTypeDiv, #positiveTypeDiv').prop('class', 'hidden');
                $('#negativeType, #positiveType').prop('checked', false);
            }else {
                editAction.testGroup.group[editAction.currentNumber].scoreDefine = false;
                $('#negativeTypeDiv, #positiveTypeDiv').prop('class', 'show');
            }
        });

        // 反向计分
        $('#negativeType, #positiveType').change(function () {

            if($(this).prop('checked')){
                // 赋予第二种得分模式
                $('.nega-posi').prop('checked', false);
                $(this).prop('checked', true);
                editAction.testGroup.group[editAction.currentNumber].otherMode = $(this).prop('id');
            }else {
                $('.nega-posi').prop('checked', false);
                editAction.testGroup.group[editAction.currentNumber].otherMode = null;
            }
        });
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
    if(editAction.scoreMode.value === null){
        return editAction.modalWindow("请先完善上面的'得分类型'一项");
    }

    // 总题目数量增加
    editAction.itemNumber++;
    // 当前题目的题号,用于各个模块之间通信的属性
    var thisNumber = editAction.currentNumber++;
    //初始化题目信息
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

    // 存储所有选择项数据
    var choises = [];
    // 当前编辑项--测评数组对象的一个子对象
    var currentGroup = editAction.testGroup.group[editAction.currentNumber];
    // 遍历DOM获取数据
    $('.input-choise').each(function (index, obj) {
        if(!$(obj).val()){
            return editAction.modalWindow("请填写完整所有的题目选项!");
        }
        // 存入选项标志和内容
        choises.push({
            choiseTag: $(obj).attr('choose'),
            choiseContent: $(obj).val(),
            choiseValue: $(obj).attr('scoreValue')
        });
    });
    currentGroup.itemChoise = choises;

    // 检测输入的题目
    if(!$('#editTitle').val()){
        return editAction.modalWindow('请输入当前题项的题目!');
    }
    currentGroup.itemTitle = $('#editTitle').val();

    // 检测得分子类型
    if(!currentGroup.itemMode){
        return editAction.modalWindow("选择当前题目得分子类型!");
    }

    // 当没有第二种子类型而同时又不是自定义类型时触发
    if(!currentGroup.otherMode && !currentGroup.scoreDefine && editAction.scoreMode == "Category"){
        return editAction.modalWindow("请完善当前题目得分子类型!");
    }

    // 检测题目的选项填写情况
    if(!currentGroup.itemChoise.length){
        return editAction.modalWindow("请添加完整的选项信息!");
    }

    // 触发观察者函数
    editAction.testGroup.trigger();
};

/* 删除已经创建的题目 */
editAction.editCancel = function () {

    // 数组删除splice不会遗留删除后的index题目索引
    // 否则删除后的位置回事undefined
    editAction.testGroup.group.splice(editAction.currentNumber, 1);
    editAction.testGroup.trigger();
};

/**
 * DOM结构
 * <div class="info-list-item">
 * <div class="item-label">分数段0-30: </div>
 * <div class="item-text">这是分段在0-30分的统计结果</div>
 * </div>
 * */
/* 增加一个统计分段 */
editAction.addScoreSection = function () {

    // 列表父元素
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

    // 移除列表缓存
    $list.children().remove();
    // 更新DOM
    for(var index in editAction.scoreSection) {
        // 分段
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

/* 删除一个分数段 */
editAction.deleteScoreSection = function () {

    // 推出最后一个数据
    editAction.scoreSection.pop();
    // 更新DOM
    // 父元素
    var $list = $('.info-list');
    $list.children().remove();

    for(var index in editAction.scoreSection) {
        // 分段
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

/** DOM结构
 * 添加选项
 * <div class="input-group">
 * <label class="input-group-addon">A</label>
 * <input type="text" class="form-control" id="inputA">
 * </div>
 * **/
editAction.choiseNumberSet = function () {

    // 切换颜色
    $('.item-number').prop('class', 'type-item item-number');
    $(this).prop('class', 'type-item item-number item-number_click');

    var number = $(this).text() || 3;
    // 可供选择的标签数组,此数组后期可以考虑接入后台,不用硬编码
    var choiseTagArray = ["A", "B", "C", "D", "E"];
    // 父元素
    var $choises = $('.choises');
    $choises.children().remove();
    $choises.css('display', 'none');
    for(var i = 0; i < number; i++){
        (function (index) {
            var $div = $('<div class="input-group">');
            var $label = $('<label class="input-group-addon">');
            $label.text(choiseTagArray[index]);
            var $input = $('<input type="text" class="form-control input-choise">');
            $input.attr('choose', choiseTagArray[index]);
            $input.attr('scoreValue', null);

            // 添加DOM结构
            $div.append($label)
                .append($input);
            $choises.append($div);

            // 允许自定义得分
            if(editAction.testGroup.group[editAction.currentNumber].scoreDefine){
                // 自定义每个选项的分值
                var $scoreDiv = $('<div class="input-group">');
                var $scoreLabel = $('<label class="input-group-addon">');
                $scoreLabel.text('分值');
                var $scoreInput = $('<input type="number" class="form-control input-score">');
                // 绑定事件
                // 为每个选项绑定得分值,适用于user-defined模式下
                $scoreInput.on('input', function (e) {
                    $input.attr('scoreValue', $(this).val());
                });
                $scoreDiv.append($scoreLabel)
                    .append($scoreInput);
                $choises.append($scoreDiv);
            }

        })(i);
    }
    $choises.fadeIn();
};

/* 创建完成后进行提交检查 */
editAction.submitCheck = function () {

    // 存储即将上传的数据对象
    var submitData = {};
    // 标题
    var testTitle = $('#testTitle').val();
    if(!testTitle){
        return editAction.modalWindow("请输入测评标题!");
    }
    submitData.testTitle = testTitle;

    // 测评类型
    var testType = editAction.testType;
    if(!testType){
        return editAction.modalWindow("请输入测评类型!");
    }
    submitData.testType = testType;

    // 测评单个得分分值
    var scoreValue = $('#scoreValue').val();
    if(!scoreValue) {
        return  editAction.modalWindow("请输入得分分值!");
    }
    submitData.scoreValue = scoreValue;

    // 得分模式
    var scoreMode = editAction.scoreMode;
    if(!scoreMode) {
        return editAction.modalWindow("请选择得分模式!");
    }
    submitData.scoreMode = scoreMode.value;

    // 分数段信息和添加的子类型信息
    if(!editAction.scoreSection.length && !editAction.categorySection.section.length) {
        return editAction.modalWindow("请至少添加一个分段或子类型");
    }
    if(editAction.scoreSection.length){
        submitData.scoreSection = editAction.scoreSection;
    }
    if(editAction.categorySection.section.length){
        submitData.categorySection = editAction.categorySection.section;
    }

    // 题目简介
    var abstract = $('#abstract').val();
    if(!abstract) {
        return editAction.modalWindow("请输入简介信息!");
    }
    submitData.abstract = abstract;

    // 题目集合检测
    if(!editAction.testGroup.group.length){
        return editAction.modalWindow("请至少添加一道题目!");
    }
    submitData.testGroup = editAction.testGroup.group;

    return console.log(submitData);

    /* 请求后台存储创建的题目对象数据 */
    $.post('/test/save', submitData, function (JSONdata) {
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
};

/* 获取当前鼠标相对于document的坐标 */
var getMousePosition = function(event) {

    var e = event || window.event;
    var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
    var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
    var x = e.pageX || (e.clientX + scrollX);
    var y = e.pageY || (e.clientY + scrollY);

    // 返回坐标对象, 即相对于top和left的位置距离
    return { x: x, y: y };
};

/* 惰性单例模式减少资源开销 */
var singleTon = (function () {

    // 悬浮框惰性单例预载入
    var _instanceHoverLabel = null;

    // 构造悬浮框DOM结构
    var hoverLabel = (function() {

        var $divBorer = $('<div class="hover-label">');
        $divBorer.css('display', 'none');

        // 显示悬浮窗口
        var show = function (text, position) {
            $divBorer.text(text);
            $divBorer.prop('class', 'hover-label show');
            $divBorer.offset({
                top: position.y,
                left: position.x
            });
            $(document.body).append($divBorer);
        };
        // 隐藏悬浮窗口
        var hidden = function () {
            $divBorer.prop('class', 'hover-label hidden');
        };
        // 返回调用接口
        return {
            show: function (text, position) {
                show(text, position);
            },
            hidden: hidden
        };
    })();
    // 显示悬浮框DOM
    function buildHoverLabel(position, text) {

        // 第一次使用需要构建DOM
        if(!_instanceHoverLabel){
            _instanceHoverLabel = hoverLabel;
            _instanceHoverLabel.show(text, position);
        }else {
            _instanceHoverLabel.show(text, position);
        }
    }

    // 提供调用接口
    return {
        // 构造DOM
        buildHoverLabel: function (position, text) {
            buildHoverLabel(position, text);
        },
        // 隐藏DOM
        hiddenHoverLabel: hoverLabel.hidden
    };
})();

/*** 测试脚本 ***/
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
