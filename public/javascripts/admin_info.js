/**
 * Created by yangw on 2017/4/6.
 */

$(function () {

    // 初始化页面
    AdminInfoAction.getAdminInfo();
    // 页面事件绑定
    AdminInfoAction.pageEventBand();

});

/* 页面全局对象
 *
  * adminAddConditon -- 新建权限的基本信息
  * adminSearchCondition -- 筛选管理员的条件
  * */
var AdminInfoAction = {
    // adminAddCondition: {}
    // adminSearchCondition: {}
};

/* 页面事件绑定 */
AdminInfoAction.pageEventBand = function () {

    // 清除筛选条件
    $('#searchCondtionClear').click(function () {
        $('.condition-detail-item').prop('class', 'condition-detail-item');
        AdminInfoAction.adminSearchCondition = {};
    });
    // 筛选权限信息
    $('#searchCondtion').click(function () {

        AdminInfoAction.getAdministrator({
            condition: AdminInfoAction.adminSearchCondition
        });
    });

    // 账户搜索
    $('#searchAccount').click(function () {
        var target = $(this).attr('target');
        var account = $('#' + target).val().trim();
        if(account == '' || !account){
            return nojsja["ModalWindow"].show('请填写账户信息');
        }
        $.post('/admin/get', {
            condition: { account: account }

        }, function (JSONdata) {

            AdminInfoAction.updateAdministrator(JSONdata);
        }, "JSON")
    });

    // 账户新建
    $('#addAdmin').click(function () {
        AdminInfoAction.addAdministrator();
    });
};

/*****  权限管理区  *****/

/* 初始化管理信息 */
AdminInfoAction.getAdminInfo = function () {

    var url = '/admin/info';

    $.post(url, {},function (JSONdata) {

        // 0级管理员更新信息
        if(AdminInfoAction.admin.rank == 0){
            AdminInfoAction.updatePermissionPage(JSONdata);

        }else if(AdminInfoAction.admin.rank == 1){

            // 获取审查内容
            AdminInfoAction.updateExamineContent(JSONdata);

        }else if(AdminInfoAction.admin.rank == 2){

            // 获取审查进度
            AdminInfoAction.updateExamineProgress(JSONdata);
        }
    }, "JSON");
};

/* 初始化权限管理页面 */
AdminInfoAction.updatePermissionPage = function (JSONdata) {

    var JSONobject = JSON.parse(JSONdata);
    if(JSONobject.isError){
        return nojsja["ModalWindow"].show(JSONobject.err);
    }

    console.log(JSONobject);

    AdminInfoAction.EnToCn = JSONobject.EnToCn;
    var permissionConstraints  = AdminInfoAction.permissionConstraints =
        JSONobject["permissionConstraints"];

    // 新建权限所需要的所有属性
    var allAttributes = permissionConstraints["allAttributes"];
    // 筛选搜索需要的所有属性
    var searchableAttributes = permissionConstraints["searchableAttributes"];
    // 所有可以更改的属性
    var changeableAttributes = AdminInfoAction.changeableAttributes =
        permissionConstraints["changeableAttributes"];
    // 所有可选的权限级别
    var rank = permissionConstraints["rank"];
    // 所有可选的审查类型
    var examineType = permissionConstraints["examineType"];

    // 缓存新建权限的DOM
    /*
    * <div class="admin-add-wrapper">
     <div class="selfinfo-title">账户</div>
     <input class="admin-add-detail" attr="account" placeholder="请输入账号...">
     <div class="selfinfo-title">密码</div>
     <input class="admin-add-detail" attr="password" placeholder="请输入密码...">
     <div class="selfinfo-title">昵称</div>
     <input class="admin-add-detail" attr="nickName" placeholder="请输入昵称...">
     <div class="selfinfo-title">权限级别</div>
     <div class="admin-add-detail">
     <div class="add-detail-item" attr="rank">0</div>
     <div class="add-detail-item" attr="rank">1</div>
     <div class="add-detail-item" attr="rank">2</div>
     </div>
     <div class="selfinfo-title">审查类型</div>
     <div class="admin-add-detail">
     <div class="add-detail-item">test</div>
     <div class="add-detail-item">course</div>
     </div>

     <!--创建按钮-->
     <div class="admin-add-div">
     <input type="button" value="创建" class="btn btn-success btn-sm" id="adminAddButton">
     </div>
     </div>
    * */
    // 需要别缓存的组件
    var $adminAddWrapper = $('<div class="admin-add-wrapper">');

    if(!AdminInfoAction.adminAddCondition){
        AdminInfoAction.adminAddCondition = {};
    }
    // 添加新权限时需要的输入属性
    for(var attr in allAttributes){

        (function (attr) {

            var $selfinfoTitle = $('<div class="selfinfo-title">');
            $selfinfoTitle.text(allAttributes[attr]);
            $adminAddWrapper.append($selfinfoTitle);

            // 存在的话是数组
            if(permissionConstraints[attr]){

                var $adminAddDetail = $('<div class="admin-add-detail">');
                permissionConstraints[attr].forEach(function (item) {

                    var $addDetailItem = $('<div class="add-detail-item">');
                    $addDetailItem.attr('attr', attr)
                        .text(item);
                    $addDetailItem.click(function () {
                        $('.add-detail-item.add-detail-item-click[attr='+ attr +']')
                            .prop('class', 'add-detail-item');

                        $(this).prop('class', 'add-detail-item add-detail-item-click');
                        // 筛选权限账户条件对象
                        AdminInfoAction.adminAddCondition[attr] = item;
                    });
                    $adminAddDetail.append($addDetailItem);
                });

                $adminAddWrapper.append($adminAddDetail);
            }else {

                var $adminAddDetail = $('<input class="admin-add-detail">');
                $adminAddDetail.prop('placeholder', attr)
                    .attr('attr', attr);

                $adminAddWrapper.append($adminAddDetail);
            }
        })(attr);

    }
    // 添加确认创建按钮
    var $adminAddDiv = $('<div class="admin-add-div">');
    var $adminAddButton = $('<input type="button" value="创建" class="btn btn-default btn-sm" id="adminAddButton">');
    $adminAddButton.click(function () {
        // 添加一个权限账户

        $.post('/admin/permission/add',
            AdminInfoAction.adminAddCondition, function (JSONdata) {

                var JSONobject = JSON.parse(JSONdata);
                if(JSONobject.isError){
                    return nojsja["ModelWindow"].show("添加出错！[error]: " + JSONobject.error);
                }
                nojsja["ModelWindow"].show("添加成功！");
            },
            "JSON"
        );
    });
    $adminAddDiv.append($adminAddButton);
    $adminAddWrapper.append($adminAddDiv);

    // 缓存创建好的DOM
    if(!AdminInfoAction.DOM){
        AdminInfoAction.DOM = {};
    }
    AdminInfoAction.DOM['adminAddWrapper'] = $adminAddWrapper[0];


    /*
    * <div class="selfinfo-title">权限级别</div>
     <div class="condition-detail">
     <div class="condition-detail-item" attr="rank">0</div>
     <div class="condition-detail-item" attr="rank">1</div>
     <div class="condition-detail-item" attr="rank">2</div>
     </div>
     <!--审查类型-->
     <div class="selfinfo-title">审查类型</div>
     <div class="condition-detail">
     <div class="condition-detail-item" attr="examineType">course</div>
     <div class="condition-detail-item" attr="examineType">test</div>
     </div>
    * */
    // 筛选管理员时可以选择的条件
    var $manageConditionList = $('.manage-condition-list');
    if(!AdminInfoAction.adminSearchCondition){
        AdminInfoAction.adminSearchCondition = {};
    }
    for(var attr in searchableAttributes){

        // 嵌套函数时注意使用闭包
        (function (attr) {

            var $selfinfoTitle = $('<div class="selfinfo-title">');
            $selfinfoTitle.text(searchableAttributes[attr]);
            $manageConditionList.append($selfinfoTitle);

            if(permissionConstraints[attr]){

                var $conditionDetail = $('<div class="condition-detail">');
                permissionConstraints[attr].forEach(function (item) {
                    var $conditionDetailItem = $('<div class="condition-detail-item">');
                    $conditionDetailItem.attr('attr', attr);
                    $conditionDetailItem.text(item);
                    $conditionDetailItem.click(function () {

                        $(".condition-detail-item.condition-detail-item-click[attr=" + attr + "]")
                            .prop('class', 'condition-detail-item');
                        $(this).prop('class', 'condition-detail-item condition-detail-item-click');
                        AdminInfoAction.adminSearchCondition[attr] = item;
                    });

                    $conditionDetail.append($conditionDetailItem);
                });
                $manageConditionList.append($conditionDetail);
            }
        })(attr);
    }

};

/* 初始化 */

/* 获取所有管理员信息 */
AdminInfoAction.getAdministrator = function (condition) {

    $.post('/admin/get', condition, function (JSONdata) {

        AdminInfoAction.updateAdministrator(JSONdata);
    }, "JSON");
};

/* 更新管理员列表 */
AdminInfoAction.updateAdministrator = function (JSONdata) {

    var JSONobject = JSON.parse(JSONdata);

    console.log(JSONobject);
    // 更新页面
    // 所有管理员列表
    var adminArray = JSONobject.adminArray;
    // 所有显示属性
    var adminAttrs = JSONobject.adminAttrs;

    if(adminArray.length == 0){
        return nojsja["ModalWindow"].show("没有账户信息");
    }

    // 父组件
    var $adminTable = $('#adminTable');
    $adminTable.children().remove();

    // 更新DOM -- head
    var $adminTableHead = $('<tr class="admin-table-head">');
    for(var i = 0; i < adminAttrs.length; i++){
        var $tableHeadTh = $('<th>');
        $tableHeadTh.text(adminAttrs[i]);
        $adminTableHead.append($tableHeadTh);
    }
    $adminTableHead.append($('<th class="edit-td">edit</th>'))
        .append($('<th class="delete-td">delete</th>'));
    $adminTable.append($adminTableHead);

    // 更新DOM -- content
    for(var i = 0; i < adminArray.length; i++){

        (function (i) {

            var $adminTableContent = $('<tr class="admin-table-content">');

            for(var item in adminArray[i]){
                var $tableContentTd = $('<td>');
                $tableContentTd.text(adminArray[i][item]);
                $adminTableContent.append($tableContentTd);
            }
            // 添加编辑按钮
            var $edit = $('<td class="edit-td" title="编辑条目"><i class="icon-edit"></i></td>');
            $edit.click(function () {
                AdminInfoAction.adminTableEdit(adminArray[i]);
            });

            // 添加删除按钮
            var $delete = $('<td class="delete-td" title="删除条目"><i class="icon-trash"></i></td>')
            $delete.click(function () {
                $adminTableContent.parent().remove($adminTableContent);
                AdminInfoAction.adminTableDelete(adminArray[i]);
            });

            $adminTableContent.append($edit)
                .append($delete);
            $adminTable.append($adminTableContent);

        })(i);
    }
};


/* 编辑权限条目 */
AdminInfoAction.adminTableEdit = function(){

    // 缓存DOM
    if(!AdminInfoAction.DOM.adminEditWrapper){

        // 需要别缓存的组件
        var $adminEditWrapper = $('<div class="admin-edit-wrapper">');

        if(!AdminInfoAction.adminEditCondition){
            AdminInfoAction.adminEditCondition = {};
        }
        // 添加新权限时需要的输入属性
        var changeableAttr = AdminInfoAction.changeableAttributes;
        var permissionConstranints = AdminInfoAction.permissionConstraints;

        for(var attr in changeableAttr){

            (function (attr) {

                var $selfinfoTitle = $('<div class="selfinfo-title">');
                $selfinfoTitle.text(changeableAttr[attr]);
                $adminEditWrapper.append($selfinfoTitle);

                // 存在的话是数组
                if(permissionConstranints[attr]){

                    var $adminEditDetail = $('<div class="admin-edit-detail">');
                    permissionConstranints[attr].forEach(function (item) {

                        var $editDetailItem = $('<div class="edit-detail-item">');
                        $editDetailItem.attr('attr', attr)
                            .text(item);
                        $editDetailItem.click(function () {
                            $('.add-detail-item.add-detail-item-click[attr=' + attr + ']')
                                .prop('class', 'edit-detail-item');
                            $(this).prop('class', 'edit-detail-item edit-detail-item-click');
                            // 筛选权限账户条件对象
                            AdminInfoAction.adminEditCondition[attr] = item;
                        });
                        $adminEditDetail.append($editDetailItem);
                    });

                    $adminEditWrapper.append($adminEditDetail);
                }else {

                    var $adminEditDetail = $('<input class="admin-edit-detail">');
                    $adminEditDetail.prop('placeholder', attr)
                        .attr('attr', attr);

                    $adminEditWrapper.append($adminEditDetail);
                }
            })(attr);

        }
        // 添加确认创建按钮
        var $adminEditDiv = $('<div class="admin-edit-div">');
        var $adminEditButton = $('<input type="button" value="修改" class="btn btn-default btn-sm" id="adminEditButton">');
        $adminEditButton.click(function () {

            // 置空
            AdminInfoAction.adminEditCondition = {};
            // 遍历选取属性
            $('input.admin-edit-detail').each(function () {
                var attr = $(this).attr('attr');
                var value = $(this).val().trim();
                if(!value || value == ''){
                    return nojsja['ModalWindow'].show('请完善' + attr);
                }
                AdminInfoAction.adminEditCondition[attr] = value;
                console.log(AdminInfoAction.adminEditCondition);
            });

            //修改一个权限账户
            $.post('/admin/permission/edit',
                AdminInfoAction.adminEditCondition,
                function (JSONdata) {
                    var JSONobject = JSON.parse(JSONdata);
                    if(JSONobject.isError){
                        return nojsja["ModelWindow"].show('编辑失败！[error]:' + JSONobject.error);
                    }
                    nojsja["ModelWindow"].show("编辑成功！");
                }, "JSON");
            });
        $adminEditDiv.append($adminEditButton);
        $adminEditWrapper.append($adminEditDiv);

        // 缓存创建好的DOM
        if(!AdminInfoAction.DOM){
            AdminInfoAction.DOM = {};
        }
        AdminInfoAction.DOM['adminEditWrapper'] = $adminEditWrapper[0];
    }

    nojsja["ModalWindow"].define(AdminInfoAction.DOM['adminEditWrapper']);
    nojsja["ModalWindow"].show('编辑', {
        scroll: false,
        selfDefineKeep: true
    });
};

/* 增加权限条目 */
AdminInfoAction.addAdministrator = function () {

    // 缓存DOM
    if(!AdminInfoAction.DOM.adminAddWrapper){
        return nojsja["ModalWindow"].show('初始化数据失败！请尝试刷新页面~');
    }
    nojsja["ModalWindow"].define(AdminInfoAction.DOM['adminAddWrapper']);
    nojsja["ModalWindow"].show('新建', {
        scroll: false,
        selfDefineKeep: true
    });
};

/* 删除权限条目 */
AdminInfoAction.adminTableDelete = function (adminData) {

    $.post('/admin/permission/delete',
        {account: adminData.account}, function (JSONdata) {

        var JSONobject = JSON.parse(JSONdata);
        if(JSONobject.isError){
            nojsja["ModalWindow"].show('删除失败![error]:' + JSONobject.error);

        }else {
            nojsja["ModalWindow"].show('删除成功！');
        }
    }, "JSON");
};

/* 编辑条目 */

/*****  内容审查区  *****/

/* 获取审查内容 */
AdminInfoAction.updateExamineContent = function () {

};

/*****  内容审查进度区  *****/

/* 获取审查进度 */
AdminInfoAction.updateExamineProgress = function () {

};