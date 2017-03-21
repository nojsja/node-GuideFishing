/**
 * Created by yangw on 2017/3/13.
 */
/* 页面加载完毕后 */
$(function () {
    // 绑定事件
    infoAction.pageEventBand();
    // 更新个人信息
    infoAction.getSelfInfo();
});

/* 页面全局变量 */
var infoAction = {
    enToCn: {
        account: "账户",
        password: "密码",
        root: "管理员",
        nickName: "昵称"
    }
};

/* 页面事件绑定 */
infoAction.pageEventBand = function () {

    $('#tabMain, #tabPurchased').bind('click', function () {

        $('.tab-title').prop('class', 'tab-title');
        $(this).prop('class', 'tab-title tab-click');

        var targetId = $(this).attr('target');
        $('#selfInfoDiv, #purchasedItemDiv').css('display', 'none');
        $('#' + targetId).fadeIn();

    });
};

/* 加载个人信息 */
infoAction.getSelfInfo = function () {

    var url = '/userInfo';
    $.post(url, {}, function (JSONdata) {

        infoAction.updateInfo(JSONdata);
    });
};


/* 更新页面信息 */
infoAction.updateInfo = function (JSONdata) {

    var JSONobject = JSON.parse(JSONdata);
    if(JSONobject.isError){
        return infoAction.modalWindow(JSONobject.error);
    }

    var selfInfo = JSONobject.selfInfo;
    var purchasedArray = selfInfo.purchasedItem;

    // 列表父组件
    var $contentInfoList = $('.content-info-list');
    var $purchasedItemList = $('.purchased-item-list');

    // 更新个人信息
    for( var info in selfInfo){
        if(info == 'purchasedItem'){
            continue;
        }

        var $infoItem = $('<div class="info-item">');
        var $infoItemTitle = $('<div class="info-item-title">');
        $infoItemTitle.text(infoAction.enToCn[info]);
        var $infoItemContent = $('<div class="info-item-content">');
        $infoItemContent.text(selfInfo[info]);

        // 添加DOM
        $infoItem.append($infoItemTitle)
            .append($infoItemContent);

        $contentInfoList.append($infoItem);
    }

    // 更新已购项目
    for( var purchasedItem in purchasedArray){

        var $purchasedItem = $('<div class="purchased-item">');
        var $purchasedItemType = $('<div class="purchased-item-type">');
        $purchasedItemType.text(purchasedItem.type);
        var $purchasedItemTitle = $('<a class="purchased-item-title"> ');
        $purchasedItemTitle.text(purchasedItem.itemName)
            .prop( 'href', ['/course/detail/', purchasedItem.itemType, '/', purchasedItem.itemName].join('') );

        $purchasedItem.append($purchasedItemType)
            .append($purchasedItemTitle);

        $purchasedItemList.append($purchasedItem);
    }
};

/* 模态弹窗 */
infoAction.modalWindow = function (text) {

    nojsja.ModalWindow.show(text);
};

