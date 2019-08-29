define([
    'toolbox',
    'text!templates/install/layout.jst',
    'css!style/install',
    ], function(ToolBox, LayoutTemplate){

    var template = _.template(LayoutTemplate);

    /*基本的布局*/
    var baseLayout = function(){
        $('#main').html(template({'tempId': 'layout'}));
    };

    /*nav-pills切换*/
    var nav_pills_change = function(index){
        $('.nav-pills li').removeClass('active');
        $('.nav-pills li:eq(' + index +')').addClass('active');
        switch(index){
            case 0:
                default_navbar1();
                break;
            case 1:
                default_navbar2();
                break;
        }
    };

    /*待录入的默认*/
    var default_navbar1 = function(){
        $('#content').html(template({'tempId': 'default-navbar-1'}));
    };

    /*已录入的默认*/
    var default_navbar2 = function(){
        $('#content').html(template({'tempId': 'default-navbar-2'}));
        statusText_disconnect_none();
    };

    /*设备录入界面*/
    var add_device_panel = function(){
        $('#content').html(template({'tempId': 'add-device-panel'}));
    };

    /*设备录入确认界面*/
    var add_device_confirm = function(data){
        if(typeof data != 'object' || typeof data.type == 'undefined' || typeof data.installPlace != 'string' ||
            typeof data.serialNumber == 'undefined' || typeof data.acNumber == 'undefined'){
            return false;
        }
        $('#modal').html(template({'tempId': 'add-device-confirm', 'data': data}));
        $('#confirm').modal('show');
    };

    /*statusText change*/
    var statusText_change = function(index){
        var text = $('.dropdown-menu li:eq(' + index + ')').find('a').text();
        $('#statusText').text(text);
        switch(index){
            case 0:
                //tmp
                statusText_disconnect_none();
                break;
            case 1:
                //tmp
                statusText_connect_none();
                break;
        }
    };

    /*statusText 未对接 none*/
    var statusText_disconnect_none = function(){
        $('#navbar-2-container').html(template({'tempId': 'statusText_disconnect_none'}));
    };

    /*statusText 已对接 none*/
    var statusText_connect_none = function(){
        $('#navbar-2-container').html(template({'tempId': 'statusText_connect_none'}));
    };

    /*msg: x个设备未对接成功*/
    var msg_device_disconnect = function(num){
        if(num == 0){
            $('#msg').html('');
        }else{
            $('#msg').html(template({'tempId': 'msg_device_disconnect', 'data': num}));
        }
    };

    /*single device*/
    var single_device = function(data){
        if(typeof data != 'object'){
            return false;
        }
        return template({'tempId': 'single-device', 'data': data});
    };

    /*show device buttons*/
    var device_buttons = function(data){
        if(typeof data != 'object' || typeof data.width != 'number'
            || typeof data.height != 'number'){
            return false;
        }
        return template({'tempId': 'taphold', 'data': data});
    };

    /*show edit device*/
    var edit_device = function(data, status_text){
        if(typeof data != 'object'){
            return false;
        }
        return template({'tempId': 'edit-device', 'data': data, 'status_text': status_text});
    };

    /*shouw search serialNumber dialog*/
    var search_serialNumber = function(){
        $('#modal').html(template({'tempId': 'search-dialog'}));
        $('#searchDialog').modal('show');
    };

    /*quick-btns switch*/
    var quickBtnsSwitch = function(index){
        switch(index){
            case 0:
                $('.quick-btns:not(".hidden")').addClass('hidden');
                break;
            case 1:
                $('.quick-btns.hidden').removeClass('hidden');
                break;
        }
    };

    return {
        /*布局初始化*/
        init: function(){
            baseLayout();
        },
        nav_pills_change: nav_pills_change,
        add_device_panel: add_device_panel,
        add_device_confirm: add_device_confirm,
        statusText_change: statusText_change,
        single_device: single_device,
        device_buttons: device_buttons,
        edit_device: edit_device,
        msg_device_disconnect: msg_device_disconnect,
        search_serialNumber: search_serialNumber,
        quickBtnsSwitch: quickBtnsSwitch
    };

});