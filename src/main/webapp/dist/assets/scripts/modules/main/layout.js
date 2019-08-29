define([
    'toolbox',
    'text!templates/main/layout.jst',
    'css!style/main',
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
    var basic_frame = function(){
        return template({'tempId': 'basic-frame'});
    };

    //底部菜单
    var bottom_menu = function () {
        return template({'tempId':'bottom_menu'});
    }

    //自动模式
    var auto_mode = function (address,weather) {
        return template({'tempId':'mode-auto-template','height':h,'address':address,'weather':weather});
    }
    //制冷模式
    var cold_mode = function (address,weather) {
        return template({'tempId':'mode-cold-template','height':h,'address':address,'weather':weather});
    }
    //制热模式
    var hot_mode = function (address,weather) {
        return template({'tempId':'mode-hot-template','height':h,'address':address,'weather':weather});
    }
    //通风模式
    var wind_mode = function (address,weather) {
        return template({'tempId':'mode-wind-template','height':h,'address':address,'weather':weather});
    }

    return {
        before_choice:before_choice,
        basic_frame: basic_frame,
        bottom_menu:bottom_menu,
        auto_mode:auto_mode,
        hot_mode:hot_mode,
        cold_mode:cold_mode,
        wind_mode:wind_mode,
        simple_projectInfo:simple_projectInfo,
        simple_projectInfo2:simple_projectInfo2
    };

});