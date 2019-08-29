define([
    'toolbox',
    'text!templates/device/layout.jst',
    'css!style/device',
    ], function(ToolBox, LayoutTemplate){

    var template = _.template(LayoutTemplate);

    /*框架frame*/
    var frame_init = function(){
        $('#main').html(template({'tempId': 'frame'}));
    };

    /*nav-pills切换*/
    var nav_pills_change = function(index){
        $('.nav-pills li').removeClass('active');
        $('.nav-pills li:eq(' + index +')').addClass('active');
    };

    /*单个device*/
    var single_device = function(data){
        if(typeof data != 'object'){
            return false;
        }
        return template({'tempId': 'single-device', 'data': data});
    };

    /*shouw search serialNumber dialog*/
    var search_serialNumber = function(){
        $('#modal').html(template({'tempId': 'search-dialog'}));
        $('#searchDialog').modal('show');
    };

    return {
        frame_init: frame_init,
        nav_pills_change: nav_pills_change,
        single_device: single_device,
        search_serialNumber: search_serialNumber
    };

});