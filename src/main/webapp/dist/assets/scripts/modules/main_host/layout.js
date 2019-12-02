define([
    'toolbox',
    'text!templates/main_host/layout.jst',
    'css!style/main_host',
    'css!style/swiper.min.css',
    'css!style/mobiscroll.css',
    'css!style/basic',

], function(ToolBox, LayoutTemplate){

    var template = _.template(LayoutTemplate);

    var h = ToolBox.screen_height-$('.bottom-menu').outerHeight(true);

    //先选择项目
    var before_choice=function () {
        return template({'tempId':'before'});
    }

    //一个地区列表
    var simple_projectInfo=function (o) {
        return template({'tempId':'simple-projectInfo','data':o});
    }

    //单个项目的列表
    var simple_projectInfo2=function (o) {
        return template({'tempId':'simple-projectInfo2','data':o});
    }


    /*基础frame*/
    var basic_frame = function(weather,humidity,temperature,wind,air_img,city){
        return template({'tempId': 'basic_frame','weather':weather,'humidity':humidity,'temperature':temperature,'wind':wind,'air_img':air_img,'city':city});
    };

    /*基础frame*/
    var basic_frame_2 = function(weather,humidity,temperature,wind,air_img,city){
        return template({'tempId': 'basic_frame_2','weather':weather,'humidity':humidity,'temperature':temperature,'wind':wind,'air_img':air_img,'city':city});
    };


    //房控房间细节头样式
    var room_detail_basic = function(weather,humidity,temperature,wind,air_img,city){
        return template({'tempId': 'room_detail_basic','weather':weather,'humidity':humidity,'temperature':temperature,'wind':wind,'air_img':air_img,'city':city});
    };

    //房控房间细节样式
    var room_detail_basic_device = function(parent,child,model,modelImg,envTemp,temp,deviceId,speed,deviceName,itemname_temp,itemname_onoff,itemname_model,item_pre,devicename){
        return template({'tempId': 'room_detail_basic_device','parent':parent,'child':child,'model':model,'modelImg':modelImg,'temp':temp,'deviceId':deviceId,'speed':speed,'deviceName':deviceName,'itemname_temp':itemname_temp,'itemname_onoff':itemname_onoff,'itemname_model':itemname_model,'item_pre':item_pre,'envTemp':envTemp,'devicename':devicename});
    };

    //主机页面
    var host_mode=function () {
        return template({'tempId':'host_mode'});
    }


    //房控设备列表
    var room_device=function (room_img,name,count,vid,deviceName) {
        return template({'tempId':'single_room_device','room_img':room_img,'name':name,'count':count,'vid':vid,'deviceName':deviceName});
    }



    //房控页面点击右方向键
    var control_detail=function () {
        return template({'tempId':'control_detail'});
    }

    //高级页面(管理员)
    var senior_mode=function () {
        return template({'tempId':'senior_mode'});
    }

    //高级页面(普通用户)
    var senior_mode_common=function () {
        return template({'tempId':'senior_mode_common'});
    }

    //权限设置
    var role_setting_mode=function () {
        return template({'tempId':'role_setting_mode'});
    }

    //定时开关
    var time_swtich=function () {
        return template({'tempId':'time_swtich'});
    }

    //我要报修
    var need_repair=function () {
        return template({'tempId':'need_repair'});
    }

    //维修模板
    var basic_repair=function (repairTitle,backClass) {
        return template({'tempId':'basic_repair','repairTitle':repairTitle,'backClass':backClass});
    }

    //维修列表
    var repair_list=function (reason,repairId) {
        return template({'tempId':'repair_list','reason':reason,'repairId':repairId});
    }

    //维修内容
    var repair_content=function (repairId,username,mobile,time,repairContent,detail,msg) {
        return template({'tempId':'repair_content','repairId':repairId,'username':username,'mobile':mobile,'time':time,'repairContent':repairContent,'detail':detail,'msg':msg});
    }

    var contact_us=function () {
        return template({'tempId':'contact_us'});
    }

    return {
        before_choice:before_choice,
        basic_frame: basic_frame,
        basic_frame_2: basic_frame_2,
        room_detail_basic:room_detail_basic,
        room_detail_basic_device:room_detail_basic_device,

        host_mode:host_mode,
        control_detail:control_detail,
        senior_mode:senior_mode,
        senior_mode_common:senior_mode_common,
        role_setting_mode:role_setting_mode,
        need_repair:need_repair,
        basic_repair:basic_repair,
        repair_list:repair_list,
        repair_content:repair_content,
        contact_us:contact_us,
        time_swtich:time_swtich,

        //jiangzhiwei 添加房间模板
        room_device:room_device,
        simple_projectInfo:simple_projectInfo,
        simple_projectInfo2:simple_projectInfo2
    };

});