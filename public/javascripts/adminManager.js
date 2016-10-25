/**
 * Created by yangw on 2016/10/19.
 * 管理员管理评测题目页面
 * 管理员能够在本页面查看所有题目,筛选查看题目,删除题目.
 * 也能够进入下一级页面编辑更新某套评测
 */


/* 页面初始化 */
$(function () {

    // 分页导航事件绑定
    managerAction.pageNavbarAction();
    // 筛选提交按钮事件绑定
    $('#allSubmit').click(managerAction.getAllTests);
    $('#conditionSubmit').click(managerAction.getConditionTests);
    // 删除和编辑事件绑定
    $('.delete').click(managerAction.deleteItem);
    $('.edit').click(managerAction.editItem);
    // 预览事件绑定
    $('.test-title').click(managerAction.previewItem);
    // 添加筛选条件事件绑定
    // 绑定checkbox事件
    $('.condition-testType-item').change(managerAction.checkboxEvent);

    // 得到列表
    managerAction.getList();

});

/* 页面对象 */
var managerAction = {
    testType: "ALL",
    // 标题字段
    testTitle: null,
    // 跳页起始点
    pageStart: 0,
    // 每页显示的数据数量(筛选条数)
    pageLimit: 20,
    // 当前页数
    pageNow: 1,
    // 测试类型(对象数组),标题
    testTypeArray: [],
    // 需要选择的字段
    select: {
        testType: 1,
        testTitle: 1,
        date: 1,
        scoreMode: 1,
        frequency: 1
    }
};

/* checkbox事件绑定 */
managerAction.checkboxEvent = function () {

    var checkedValue = $(this).val();
    // 类型数组
    var array = managerAction.testTypeArray;

    if($(this).prop('checked')){
        if(array.length == 0){
            array.push(checkedValue);
        }else {
            for(var index in array){
                if(array[index] == checkedValue){
                    return;
                }
            }
            array.push(checkedValue);
        }
        // 选中取消
    }else {
        if(array.length == 0){
            return;
        }else {
            for(var index in array){
                if(array[index] == checkedValue){
                    // splice删除数组
                    array.splice(index,1);
                }
            }
        }
    }
};

/* 展示所有评测题目数据 */
managerAction.getAllTests = function () {
    // 初始化数据
    managerAction.testTitle = null;
    managerAction.pageStart = 0;
    managerAction.pageLimit = 20;
    managerAction.testTypeArray = [];

    //获取列表
    managerAction.getList();
};

/* 展示筛选过的所有评测题目数据 */
managerAction.getConditionTests = function () {
    managerAction.getList();
};

/* 编辑测评列表里面的某一项数据 */
managerAction.editItem = function () {
};

/* 删除列表里面的某一项数据 */
managerAction.deleteItem = function () {

};

/* 预览列表里面的某一项数据 */
managerAction.previewItem = function () {

};

/* 更新页面数据表格 */
managerAction.updateTable = function (JSONdata) {

    var JSONobject = JSON.parse(JSONdata);
    var testArray = JSONobject.testArray;
    var $testTable = $('#testTable');

    if(testArray.length == 0){
        return managerAction.modalWindow("数据库没有任何相关数据!");
    }else {
        $('.removeable').remove();
        // 遍历更新DOM
        for(var index in testArray){
            (function (test) {
                var $tr = $('<tr class="removeable">');
                var $titleTd = $('<td>');
                $titleTd.text(test.testTitle);

                var $typeTd = $('<td>');
                $typeTd.text(test.testType);

                var $dateTd = $('<td>');
                $dateTd.text(test.date);

                var $scoreModeTd = $('<td>');
                $scoreModeTd.text(test.scoreMode);

                var $frequencyTd = $('<td>');
                $frequencyTd.text(test.frequency);

                var $deleteTd = $('<td></td>');
                var $deleteSpan = $('<span class="glyphicon glyphicon-trash delete"></span>');
                $deleteSpan.click(function () {
                    var that = this;
                    $.post('/deleteOne', {
                        testTitle: test.testTitle,
                        testType: test.testType
                    }, function (JSONdata) {
                        var JSONobject = JSON.parse(JSONdata);
                        if(JSONobject.error){
                            return managerAction.modalWindow("删除错误,请重试!");
                        }
                        $(that).parent().parent().remove();
                    }, "JSON");
                }).appendTo($deleteTd);

                var $editTd = $('<td></td>');
                var $editSpan = $('<span class="glyphicon glyphicon-edit edit"></span>');
                $editSpan.click(function () {
                    var that = this;
                }).appendTo($editTd);

                // 添加到页面上去
                $tr.append($titleTd).append($typeTd)
                    .append($dateTd).append($scoreModeTd)
                    .append($frequencyTd).append($editTd)
                    .append($deleteTd);

                // 表格添加
                $testTable.append($tr);

            })(testArray[index]);
        }
    }
};

/* 模态弹窗 */
managerAction.modalWindow = function(text) {

    $('.modal-body').text(text);
    $('#modalWindow').modal("show", {
        backdrop : true,
        keyboard : true
    });
};

/* 绑定分页导航事件 */
managerAction.pageNavbarAction = function() {

    // 局部作用域变量,减少耦合度
    // 默认页面显示数量
    this.pageLimit = 20;
    // 默认页面起始处,用于翻页
    this.pageStart = 0;
    // 保存作用域
    var that = this;
    // 对外提供设置私有变量的接口
    that.setPageLimit = function (limit) {
        that.pageLimit = limit;
    };
    that.setPageStart = function (start) {
        that.pageStart = start;
    };

    //点击首页按钮
    $('#first').click(function() {
        if($('.page-number:eq(0)').prop('class') == "active page-number"){
            return;
        }
        $('.page-number[class="active page-number"]').prop('class', 'page-number');
        $('.page-number:eq(0)').prop('class', 'active page-number');
        that.pageStart = 0;
        //读取文章列表
        that.getList();
    });
    //点击页数按钮
    $('.page-number').click(function() {
        if($(this).prop('class') == "active page-number"){
            return;
        }
        $('.page-number[class="active page-number"]').prop('class', 'page-number');
        $(this).prop('class', 'active page-number');
        that.pageStart = ($(this).children(0).text() - 1) * that.pageLimit;
        that.getList();
    });

    //点击翻页按钮
    $('#next').click(function() {
        $('.page-number[class="active page-number"]').prop('class', 'page-number');
        var $pageNumber = $('.page-number');
        $.each($pageNumber.children(0), function (index, item) {
            $(item).text( parseInt($(item).text()) + 10 );
        });
    });

    $('#last').click(function() {
        $('.page-number[class="active page-number"]').prop('class', 'page-number');
        var $pageNumber = $('.page-number');
        $.each($pageNumber.children(0), function (index, item) {
            var $num = parseInt($(item).text());
            $(item).text( ($num-10) > 0 ? ($num-10) : $num );
        });
    });

    //读取文章列表
    that.getList = function (){
        // 检测
        submitCheck();
    }

    // 进行提交检测并绑定筛选数据
    function submitCheck() {

        var condition = {};
        condition.skip = that.pageStart;
        condition.select = that.select;
        condition.testType = that.testType;

        var url = '/readTestList';

        //设置筛选条数和起始条数
        if($('#number').val().trim() > 0){
            condition.limit = $('#number').val().trim();
        }

        // 设置筛选标题
        if($('#testTitle').val().trim() != ""){
            condition.testTitle = $('#testTitle').val().trim();
            condition.limit = 1;
        }
        //设置所有需要筛选的类型
        if(managerAction.testTypeArray.length > 0){
             condition.testTypeArray = managerAction.testTypeArray;
        }

        $.post(url, condition, function (JSONdata) {
            //更新表格
            managerAction.updateTable(JSONdata);
        }, "JSON");
    }
};


