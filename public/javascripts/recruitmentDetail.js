/**
 * Created by yangw on 2016/11/4.
 * 企业招聘相关介绍页面
 */

/* 初始化 */
$(function () {
    // 获取详细信息
    RecruitDetail.getDetail();
});

/* 页面全局存储变量 */
var RecruitDetail = {};

/* 获取招聘信息 */
RecruitDetail.getDetail = function () {

    var company = $('#company').text();
    var url = '/recruitment/detail';

    // 请求服务器
    $.post(url, { company: company }, function (JSONdata) {
            // 更新页面
            RecruitDetail.updatePage(JSONdata);
        }, "JSON");
};

/* 更新页面 */
RecruitDetail.updatePage = function (JSONdata) {

    var JSONobject = JSON.parse(JSONdata);
    // 招聘信息
    var recruitment = JSONobject.recruitment;
    // 公司介绍
    var introduction = recruitment.introduction;
    // 公司位置
    var position = recruitment.position;
    // 公司图片
    var imgArray = recruitment.imageUrls;
    // 所有招聘职位
    var recruitments = recruitment.recruitments;

    // 更新介绍
    $('.introduction-main').text(introduction);
    // 更新位置
    var $mapMarker = $('<span class="glyphicon glyphicon-map-marker">');
    $mapMarker.text(position);
    $('.introduction-position').append($mapMarker);
    // 更新图片
    for(var index in imgArray){
        var $imgDiv = $('<div class="environment-image">');
        $imgDiv.css({
            'background': 'url(' + imgArray[index] + ') no-repeat',
            'background-size': 'cover'
        });
        // 添加图片到页面
        $('.introduction-environment').append($imgDiv);
    }

    /* DOM结构
    * <div class="recruitment-item">
    * <!--招聘职位-->
    * <div class="item-job"></div>
    * <!--岗位职责-->
    * <div class="item-duty">
    *   <div class="item-duty-item"></div>
    * </div>
    * <!--任职资格-->
    * <div class="item-skill">
    *    <div class="item-skill-item"></div>
    * </div>
    * <!--薪资福利-->
    * <div class="item-treatment">
    *    <div class="item-treatment-item"></div>
    * </div>
    * <!--其它信息-->
    * <div class="item-other"></div>
    * </div>
    * */

    // 更新招聘职位
    for(var index in recruitments){
        var recruitment = recruitments[index];
        // 构建dom
        var $itemDiv = $('<div class="recruitment-item">');

        // pushpin
        var $pin = $('<span class="glyphicon glyphicon-pushpin">');
        $pin.appendTo($itemDiv);

        // 职位名称
        var $job = $('<div class="item-job translate">');
        var $jobTitle = $('<div class="item-title">');
        $jobTitle.text('职位名称').appendTo($itemDiv);
        $job.text(recruitment.job).appendTo($itemDiv);
        // 岗位职责
        var $duty = $('<div class="item-duty translate">');
        var $dutyTitle = $('<div class="item-title">');
        $dutyTitle.text('岗位职责').appendTo($itemDiv);
        for(var i in recruitment.dutys){
            var $dutyItem = $('<div class="item-duty-item">');
            $dutyItem.text(recruitment.dutys[i].duty);

            $duty.append($dutyItem);
        }
        $duty.appendTo($itemDiv);

        // 任职资格
        var $skill = $('<div class="item-skill translate">');
        var $skillTitle = $('<div class="item-title">');
        $skillTitle.text('任职资格').appendTo($itemDiv);
        for(var j in recruitment.skills){
            var $skillItem = $('<div class="item-skill-item">');
            $skillItem.text(recruitment.skills[j].skill);

            $skill.append($skillItem);
        }
        $skill.appendTo($itemDiv);

        // 薪资福利
        var $treatment = $('<div class="item-treatment translate">');
        var $treatmentTitle = $('<div class="item-title">');
        $treatmentTitle.text('薪资福利').appendTo($itemDiv);
        for(var k in recruitment.treatments){
            var $treatmentItem = $('<div class="item-treatment-item">');
            $treatmentItem.text(recruitment.treatments[k].treatment);

            $treatment.append($treatmentItem);
        }
        $treatment.appendTo($itemDiv);

        // 其它信息
        var $other = $('<div class="item-other translate">');
        var $otherTitle = $('<div class="item-title">');
        $otherTitle.text('其它').appendTo($itemDiv);
        $other.text(recruitment.other).appendTo($itemDiv);

        // 添加到列表里面
        $('#recuitmentList').append($itemDiv);
    }

};


























