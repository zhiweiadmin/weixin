define([
    'toolbox',
    'text!templates/simple_device/layout.jst',
    'css!style/simple_device',
    ], function(ToolBox, LayoutTemplate){

    var template = _.template(LayoutTemplate);

    /*基础frame*/
    var basic_frame = function(){
        return template({'tempId': 'basic-frame'});
    };

    /*单个device*/
    var single_device = function(data){
        if(typeof data != 'object'){
            return false;
        }
        return template({'tempId': 'single-device', 'data': data});
    };

    /*添加绑定设备*/
    var bind_device = function(){
        return template({'tempId': 'bind-device'});
    };

    return {
        basic_frame: basic_frame,
        single_device: single_device,
        bind_device: bind_device
    };

});