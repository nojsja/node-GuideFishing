/* 查看所有路由 */

// 初始化
$(function () {

    // 获取所有路由数据
    AdminRoutes.getAllRoutes();
    // 导航条
    $('#routes').parent().prop('class', 'active');
});

// 页面全局变量
var AdminRoutes = {};

/* 获取所有路由 */
AdminRoutes.getAllRoutes = function () {

    var url = '/admin/routes';
    $.post(url, {}, function (JSONdata) {

        AdminRoutes.updateRoutes(JSONdata);
    }, "JSON");
};

/* 更新页面路由 */
AdminRoutes.updateRoutes = function (JSONdata) {

    // 转换JSON对象
    var JSONobject = JSON.parse(JSONdata);

    // 表单域映射对象
    var $fieldsetCast = {
        course: $('div .route-list-div[field="course"]'),
        test: $('div .route-list-div[field="test"]'),
        recruitment: $('div .route-list-div[field="recruitment"]')
    };

    // 遍历更新页面
    for (var routeType in JSONobject.routes){

        // 路由对象数组
        var routeObjects = JSONobject.routes[routeType];

        for(var index in routeObjects){

            // 单个路由对象
            var routeObject = routeObjects[index];
            // 父组件
            var $routeList = $fieldsetCast[routeType];

            var $routeDiv = $('<div class="route-div">');
            var $routeDivText = $('<div class="route-div-text">');
            $routeDivText.text(routeObject.text);
            // 自定义路由
            var $routeDivUrl;
            if(routeObject.isVariable){
                $routeDivUrl = $('<div class="route-div-url">');
            }else {
                $routeDivUrl = $('<a class="route-div-url">');
            }
            $routeDivUrl
                .text(routeObject.url)
                .prop('href', routeObject.url);

            // 添加到页面上
            $routeDiv
                .append($routeDivText)
                .append($routeDivUrl)
                .appendTo($routeList);
        }
    }

};