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
    var basic_frame = function(weather,humidity,temperature,wind,air_img){
        return template({'tempId': 'basic_frame','weather':weather,'humidity':humidity,'temperature':temperature,'wind':wind,'air_img':air_img});
    };


    //房控房间细节头样式
    var room_detail_basic = function(weather,humidity,temperature,wind,air_img){
        return template({'tempId': 'room_detail_basic','weather':weather,'humidity':humidity,'temperature':temperature,'wind':wind,'air_img':air_img});
    };

    //房控房间细节样式
    var room_detail_basic_device = function(parent,child,model,modelImg,temp,deviceId,speed,deviceName,itemname_temp,itemname_onoff,itemname_model,item_pre){
        return template({'tempId': 'room_detail_basic_device','parent':parent,'child':child,'model':model,'modelImg':modelImg,'temp':temp,'deviceId':deviceId,'speed':speed,'deviceName':deviceName,'itemname_temp':itemname_temp,'itemname_onoff':itemname_onoff,'itemname_model':itemname_model,'item_pre':item_pre});
    };

    //主机页面
    var host_mode=function () {
        return template({'tempId':'host_mode'});
    }


    //房控设备列表
    var room_device=function (room_img,name,count,vid) {
        return template({'tempId':'single_room_device','room_img':room_img,'name':name,'count':count,'vid':vid});
    }


    //房控页面点击右方向键
    var control_detail=function () {
        return template({'tempId':'control_detail'});
    }

    //高级页面
    var senior_mode=function () {
        return template({'tempId':'senior_mode'});
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

    var contact_us=function () {
        return template({'tempId':'contact_us'});
    }

    return {
        before_choice:before_choice,
        basic_frame: basic_frame,
        room_detail_basic:room_detail_basic,
        room_detail_basic_device:room_detail_basic_device,

        host_mode:host_mode,
        control_detail:control_detail,
        senior_mode:senior_mode,
        role_setting_mode:role_setting_mode,
        need_repair:need_repair,
        contact_us:contact_us,
        time_swtich:time_swtich,

        //jiangzhiwei 添加房间模板
        room_device:room_device,
        simple_projectInfo:simple_projectInfo,
        simple_projectInfo2:simple_projectInfo2
    };

});