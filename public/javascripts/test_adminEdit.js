/**
 * Created by yangw on 2016/10/24.
 * 功能:创建评测题目和编辑各个子题目
 * 通过预先传入数据也可以对一个已经存在的
 * 题目数据对象进行编辑和修改
 */

/*** 初始化函数 ***/
$(function () {

    // 初始化观察者模式
    nojsja.ObserverPattern.init(EditAction.testGroup);
    nojsja.ObserverPattern.init(EditAction.scoreMode);
    nojsja.ObserverPattern.init(EditAction.scoreSection);
    nojsja.ObserverPattern.init(EditAction.categorySection);
    // 获取得分模式信息
    EditAction.getScoreMode();
    // 注册观察者函数
    EditAction.activeWatcher();
    // 页面事件绑定
    EditAction.pageEventBind();

});

/*** 页面全局变量 ***/
/**
 * testType -- 测评所属类型
 * testTitle -- 测评的标题
 * testGroup -- 本套测试所包含的所有题目
 * currentNumber -- 当前操作的题号(页面很多操作是基于这个编号确定当前题目的信息的)
 * itemNumber -- 当前题目的编号
 * abstract -- 本套题的摘要介绍信息
 * scoreValue -- 本套题的基础得分权值(用于后台进行计算)
 * scoreSection -- 得分的分段(计算的最终分值对应一个分段的结果信息)
 * scoreMode -- 本套题所使用的统计得分模式, 注意在Common和NegaPositive得分模式下
 *  每道小题各自还对应自己的得分子模式itemMode;而在特殊模式CateGory分类多维度得分模式下
 *  itemMode则表示对应的分段类,与之相对应的而是otherMode则对应各个非自定义得分类型的题目的积分
 *  模式比如正向计分和反向计分
 * categorySection -- 如果是分类得分的计分模式的话这个属性用于
 *  将不同类别的统计得分与结果相对应(建立映射关系)
 * scoreModeGroup -- 这是各种计分模式的信息, 后期考虑从后台获取增加系统灵活度和扩展性
 * */
var EditAction = {

    // 题目类型和标题
    testType: null,
    testTitle: null,
    // 测评标签
    testTags: [],
    // 审查数据
    examine: {
        status: 'isExaming',
        adminAccount: null,
        examineAccount: null
    },
    // 题目集合,包含观察者模式的相关方法,group存储题目集合
    testGroup: {
        group: [], listen: null, trigger: null, remove: null, watcherList: []
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
    scoreSection: {
        value: [], watcherList: [], trigger: null, listen: null, remove: null
    },
    // 记分模式
    scoreMode: {
        value: null, watcherList: [], trigger: null, listen: null, remove: null
    },
    // 子类型
    categorySection: {
        section: [], watcherList: [], trigger: null, listen: null, remove: null
    },
    // 记分模式组合用于创建题目
    // 后期可以考虑将各种数据类型存入后台, 增加程序的可扩展性
    scoreModeGroup: {
        Common: ["CA","CB","CC"],
        NegaPositive: ["Negative", "Positive"]
    }
};

/* 获取所有得分模式信息 */
EditAction.getScoreMode = function () {

    var url = '/test/getScoreMode';
    $.post(url, {}, function (JSONdata) {

        var JSONobject = JSON.parse(JSONdata);
        // 绑定依赖
        EditAction.scoreModeGroup = JSONobject.scoreModeGroup;
    });
};

/* 页面事件绑定 */
EditAction.pageEventBind = function () {

    //设置editNumber不可点击
    $('#editNumber').focus(function () {
        $(this).blur();
    });

    // 导航条
    $('#testCreate').parent().prop('class', 'active');
    //选择题目类型
    $('.test-type').click(function () {
        // 效果改变
        $('.test-type').prop('class', 'type-item test-type');
        $(this).prop('class', 'type-item test-type test-type_click');
        EditAction.testType = $(this).prop('id');
    });

    // 标签输入事件绑定
    $('#tagAdd').click(function () {

        var targetId = $(this).attr('target');
        var tagText = $('#' + targetId).val().trim();
        if(!tagText || tagText == ''){
            return EditAction.modalWindow('请在左侧输入标签名');
        }
        if(EditAction.testTags.length == 3){
            return EditAction.modalWindow('标签最多能添加三个');
        }
        if(EditAction.testTags.indexOf(tagText) >= 0){
            return EditAction.modalWindow('标签重复');
        }
        EditAction.testTags.push(tagText);
        // 更新DOM <div class="tag-list-item" title="点击删除标签">123</div>
        var $tagList = $('.tag-list');

        updateTag();
        // 递归更新tag
        function updateTag() {
            $tagList.children().remove();
            for(var i = 0; i < EditAction.testTags.length; i++) {

                (function (i) {
                    var tag = EditAction.testTags[i];
                    var $tag = $('<div class="tag-list-item" title="点击删除标签">');
                    $tag.text(tag);
                    $tag.click(function () {
                        EditAction.testTags.splice(i, 1);
                        updateTag();
                    });
                    $tagList.append($tag);
                })(i);
            }
        }

    });

    // 选择得分类型
    $('.score-mode').click(function () {
        //效果改变
        $('.score-mode').prop('class', 'type-item score-mode');
        $(this).prop('class', 'type-item score-mode score-mode_click');
        EditAction.scoreMode.value = $(this).prop('id');
        // 触发观察者事件
        EditAction.scoreMode.trigger();
    });
    // 添加一道题目
    $('.edit-add').click(EditAction.addTestItem);
    // 确认题目编辑
    $('#editConfirm').click(EditAction.editConfirm);
    // 删除本题
    $('#editCancel').click(EditAction.editCancel);
    // 选择题目的选项数目
    $('.item-number').click(EditAction.choiseNumberSet);
    // 添加和删除分段得分结果统计数据
    $('#scoreConfirm').click(EditAction.addScoreSection);
    $('#scoreCancel').click(EditAction.deleteScoreSection);

    // 完成创建绑定
    $('#submit').click(EditAction.submitCheck);

    /* 测试,运行环境下移除此方法 */
    /* autoFillTest(); */

    // 鼠标显示悬浮框
    $('.score-mode').hover(function (event) {

        var position = nojsja.GetMousePosition(event);
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
};

/* 分数模式的简单观察者 */
nojsja.ObserverPattern.init = function (object) {

    // 定义分数模式的观察者回调函数
    object.watcherList = [];
    // 为分数模式注册新的观察者
    object.listen = function (fn) {
        object.watcherList.push(fn);
    };
    // 被观察者事件触发
    object.trigger = function () {
        for(var index in object.watcherList){
            object.watcherList[index].apply(object);
        }
    };
    // 解绑观察者事件监听
    object.remove = function (fn) {
        var length = object.watcherList.length;
        for(var i = length - 1; i >= 0; i-- ){
            if(fn === object.watcherList[i]){
                object.watcherList.splice(i, 1);
            }
        }
    };
};

/* 注册观察者 */
EditAction.activeWatcher = function () {

    /**
     * 注册得分模式scoreMode观察者
     * */
    EditAction.scoreMode.listen(function () {

        $('.score-child-div').children().remove();

        // 类别模式做额外处理
        if(EditAction.scoreMode.value == "Category"){

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
                    return EditAction.modalWindow("请完善子类别信息.");
                }
                // 更新数据依赖, 子类型组放入一个子类型对象
                EditAction.categorySection.section.push({
                    categoryMode: categoryMode,
                    categoryDescribe: categoryDescribe
                });
                // 触发观察者事件
                EditAction.categorySection.trigger();
            });

            // 删除类别事件
            $('#categoryCancel').click(function () {
                EditAction.categorySection.section.pop();
                // 触发观察者事件
                EditAction.categorySection.trigger();
            });

        }else {

            $('.child-of-category').prop('class', 'child-of-category child-of-category_hidden');
            // 移除分段设置
            $('#scoreSectionSet').css('display', 'block');
            $('#childModeAdd').css('display', 'none');

            var childModes = EditAction.scoreModeGroup[EditAction.scoreMode.value];
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
                EditAction.testGroup.group[EditAction.currentNumber].itemMode = $(this).prop('id');
                $('.score-child').prop('class', 'type-item score-child');

                $(this).prop('class', 'type-item score-child score-child_click');
            });
        }
    });

    /**
     * 注册题目组合testGroup观察者
     * 每次有新的题目添加的时候DOM上的元素都会被删除
     * 然后重建, 所有每次都会重新绑定事件, 对浏览器有一定的资源浪费
     * 但是这样子设计在编码上回带来很大的灵活性,需要从两者之间权衡
     **/
    EditAction.testGroup.listen(function () {
        // 题目列表
        var $totalList = $('.total-list');
        $totalList.children().remove();

        // 数组变化后更新页面DOM
        for(var index in EditAction.testGroup.group){

            // 使用javascript闭包
            // index会动态改变
            // var thisGroup = EditAction.testGroup.group[index];
            // 这句是个引用类型
            (function (index) {
                // border
                var $editNew = $('<div class="edit-new">');
                // 标题
                var $newTitle = $('<div class="new-title">');
                // 当前题目的编号, index从零开始的
                var thisGroup = EditAction.testGroup.group[index];

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
                    // $('.choises').children().remove();
                    // 当前的题号
                    // 注意题号和目前的编号不一样, 题号大一点
                    EditAction.currentNumber = thisGroup.itemNumber - 1;
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
     * 添加得分分段观察者方法
     * */
    EditAction.scoreSection.listen(function () {

        // 列表父元素
        var $list = $('.info-list');
        // 移除列表缓存
        $list.children().remove();
        // 更新DOM
        for(var index in EditAction.scoreSection.value) {
            // 分段
            var scoreSec = EditAction.scoreSection.value[index];
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

    /**
     * 注册得分子类型的观察者
     * **/
    EditAction.categorySection.listen(function () {

        // 子类型列表
        var $categoryList = $('.category-list');
        $categoryList.children().remove();

        //添加DOM
        for(var index in EditAction.categorySection.section){

            (function (i) {
                // 添加DOM元素
                var $div = $('<div class="category-list-item">');
                var $label = $('<div class="item-label">');
                $label.text(EditAction.categorySection.section[i].categoryMode);
                var $result = $('<div class="item-text">');
                $result.text(EditAction.categorySection.section[i].categoryDescribe);
                $div.append($label).append($result);

                $categoryList.append($div);
            })(index);
        }

        // 父组件
        var scoreChildDiv = $('.score-child-div');
        scoreChildDiv.children().remove();
        // 所有自定义子类型数据
        var categorySection = EditAction.categorySection.section;

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
            EditAction.testGroup.group[EditAction.currentNumber].itemMode = $(this).prop('id');
            $('.category-child').prop('class', 'type-item category-child');

            $(this).prop('class', 'type-item category-child category-child_click');
        });

        // 自定义得分绑定
        $('#scoreDefine').change(function () {
            // 被选中允许自定义得分
            if($(this).prop('checked')){
                // 本小题允许自定义得分
                EditAction.testGroup.group[EditAction.currentNumber].scoreDefine = true;
                EditAction.testGroup.group[EditAction.currentNumber].otherMode = null;
                $('#negativeTypeDiv, #positiveTypeDiv').prop('class', 'hidden');
                $('#negativeType, #positiveType').prop('checked', false);
            }else {
                EditAction.testGroup.group[EditAction.currentNumber].scoreDefine = false;
                $('#negativeTypeDiv, #positiveTypeDiv').prop('class', 'show');
            }
        });

        // 反向计分
        $('#negativeType, #positiveType').change(function () {

            if($(this).prop('checked')){
                // 赋予第二种得分模式
                $('.nega-posi').prop('checked', false);
                $(this).prop('checked', true);
                EditAction.testGroup.group[EditAction.currentNumber].otherMode = $(this).prop('id');
            }else {
                $('.nega-posi').prop('checked', false);
                EditAction.testGroup.group[EditAction.currentNumber].otherMode = null;
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
EditAction.addTestItem = function () {

    // 添加检查
    if(EditAction.scoreMode.value === null){
        return EditAction.modalWindow("请先完善上面的'得分类型'一项");
    }

    // 总题目数量增加
    EditAction.itemNumber++;
    // 当前题目的题号,用于各个模块之间通信的属性
    var thisNumber = EditAction.currentNumber++;
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
    EditAction.testGroup.group.push(initItem);
    // 触发观察者函数
    EditAction.testGroup.trigger();
};

/* 提交这道题的编辑结果 */
EditAction.editConfirm = function () {

    // 存储所有选择项数据
    var choises = [];
    // 当前编辑项--测评数组对象的一个子对象
    var currentGroup = EditAction.testGroup.group[EditAction.currentNumber];
    // 遍历DOM获取数据
    $('.input-choise').each(function (index, obj) {
        if(!$(obj).val()){
            return EditAction.modalWindow("请填写完整所有的题目选项!");
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
        return EditAction.modalWindow('请输入当前题项的题目!');
    }
    currentGroup.itemTitle = $('#editTitle').val();

    // 检测得分子类型
    if(!currentGroup.itemMode){
        return EditAction.modalWindow("选择当前题目得分子类型!");
    }

    // 当没有第二种子类型而同时又不是自定义类型时触发
    if(!currentGroup.otherMode && !currentGroup.scoreDefine && EditAction.scoreMode == "Category"){
        return EditAction.modalWindow("请完善当前题目得分子类型!");
    }

    // 检测题目的选项填写情况
    if(!currentGroup.itemChoise.length){
        return EditAction.modalWindow("请添加完整的选项信息!");
    }

    // 触发观察者函数
    EditAction.testGroup.trigger();
};

/* 删除已经创建的题目 */
EditAction.editCancel = function () {

    // 数组删除splice不会遗留删除后的index题目索引
    // 否则删除后的位置回事undefined
    EditAction.testGroup.group.splice(EditAction.currentNumber, 1);
    EditAction.testGroup.trigger();
};

/**
 * DOM结构
 * <div class="info-list-item">
 * <div class="item-label">分数段0-30: </div>
 * <div class="item-text">这是分段在0-30分的统计结果</div>
 * </div>
 * */
/* 增加一个统计分段 */
EditAction.addScoreSection = function () {

    // 获取分段段首
    var scoreHead = $('#scoreHeadDiv > input').val();
    // 获取分段段尾
    var scoreTail = $('#scoreTailDiv > input').val();
    // 获取统计结论
    var scoreResult = $('#scoreResultDiv > textarea').val();

    if(!(scoreResult && scoreHead && scoreTail)) {
        return EditAction.modalWindow("请输入完整的分段信息...");
    }

    // 更新数据依赖
    EditAction.scoreSection.value.push({
        scoreHead: scoreHead,
        scoreTail: scoreTail,
        result: scoreResult
    });

    // 触发观察者
    EditAction.scoreSection.trigger();
};

/* 删除一个分数段 */
EditAction.deleteScoreSection = function () {

    // 推出最后一个数据
    EditAction.scoreSection.value.pop();
    // 更新DOM 触发观察者
    EditAction.scoreSection.trigger();

};

/** DOM结构
 * 设置选项的个数
 * <div class="input-group">
 * <label class="input-group-addon">A</label>
 * <input type="text" class="form-control" id="inputA">
 * </div>
 **/
EditAction.choiseNumberSet = function () {

    // 切换颜色
    $('.item-number').prop('class', 'type-item item-number');
    $(this).prop('class', 'type-item item-number item-number_click');

    var number = $(this).text() || 3;
    // 可供选择的标签数组,此数组后期可以考虑接入后台,不用硬编码
    var choiseTagArray = ["A", "B", "C", "D", "E"];
    // 父元素
    var $choises = $('.choises');
    // 遍历读取临时保存所有选项的值
    var choiseTemp = {};
    $choises.each(function (index, object) {

        var tag = $(object).children('.input-choise').attr('choose');
        var value = $(object).children('.input-chiose').val();
        choiseTemp.tag = value;
    });
    $choises.children().remove();
    $choises.css('display', 'none');
    for(var i = 0; i < number; i++){

        (function (index) {
            var $div = $('<div class="input-group">');
            var $label = $('<label class="input-group-addon">');
            $label.text(choiseTagArray[index]);
            var $input = $('<input type="text" class="form-control input-choise">');
            if(choiseTemp[ choiseTagArray[index] ]){
                // 设置值
                $input.val(choiseTemp[ choiseTemp[index] ]);
            }
            $input.attr('choose', choiseTagArray[index]);
            $input.attr('scoreValue', null);

            // 添加DOM结构
            $div.append($label)
                .append($input);
            $choises.append($div);

            // 允许自定义得分
            if(EditAction.testGroup.group[EditAction.currentNumber].scoreDefine){
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
EditAction.submitCheck = function () {

    // 存储即将上传的数据对象
    var submitData = {};

    // 标题
    submitData.testTitle = $('#testTitle').val().trim();
    if(!submitData.testTitle){
        return EditAction.modalWindow("请输入测评标题!");
    }

    // 测评类型
    submitData.testType = EditAction.testType;
    if(!submitData.testType){
        return EditAction.modalWindow("请输入测评类型!");
    }

    // 测评标签
    submitData.testTags = EditAction.testTags;
    if(submitData.testTags.length == 0) {
        return EditAction.modalWindow("请至少输入一个测评标签！");
    }

    // 测评单个得分分值
    submitData.scoreValue = $('#scoreValue').val().trim();
    if(!submitData.scoreValue) {
        return  EditAction.modalWindow("请输入得分分值!");
    }

    // 得分模式
    submitData.scoreMode = EditAction.scoreMode.value;
    if(!submitData.scoreMode) {
        return EditAction.modalWindow("请选择得分模式!");
    }

    // 分数段信息和添加的子类型信息
    if(!EditAction.scoreSection.value.length && !EditAction.categorySection.section.length) {
        return EditAction.modalWindow("请至少添加一个分段或子类型");
    }
    if(EditAction.scoreSection.value.length){
        submitData.scoreSection = EditAction.scoreSection.value;
    }
    if(EditAction.categorySection.section.length){
        submitData.categorySection = EditAction.categorySection.section;
    }

    // 题目简介
    submitData.abstract = $('#abstract').val().trim();
    if(!submitData.abstract) {
        return EditAction.modalWindow("请输入简介信息!");
    }

    // 题目集合检测
    if(!EditAction.testGroup.group.length){
        return EditAction.modalWindow("请至少添加一道题目!");
    }
    submitData.testGroup = EditAction.testGroup.group;

    // 审查数据
    submitData.examine = EditAction.examine;

    console.log(submitData);

    /* 请求后台存储创建的题目对象数据 */
    $.post('/test/save', submitData, function (JSONdata) {
        var JSONobject = JSON.parse(JSONdata);
        if(JSONobject.error){
            return EditAction.modalWindow("创建出错!请重试...");
        }
        EditAction.modalWindow("创建成功!");
    }, "JSON");
};

/* 模态弹窗 */
EditAction.modalWindow = function(text) {

    nojsja.ModalWindow.show(text);
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
