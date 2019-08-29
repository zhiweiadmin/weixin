define([
    'toolbox',
    'text!templates/plugins/filter_item.jst',
    'scripts/plugins/item_control',
    'css!style/filter_item'
    ], function(ToolBox, FilterItemTemplate, itemControlPlugin){

    var template = _.template(FilterItemTemplate);

    /*绑定事件*/
    var bindEvents = function(targetEL){
        container.on('tap', '.filter-item', function(e){
            var index = $(e.currentTarget).index();
            var item = currentData[index];
            if(item.readOnly == 1){
                itemControlPlugin.init(item, $(e.currentTarget), device);
            }
            return false;
        });
    };

    /*获取设备数据项模板列表*/
    var device_template = function(callback){
        ToolBox.ajax({
            type: 'get',
            url: 'deviceTemplate/list',
            data: {
                token: ToolBox.getCookie('token')
            },
            dataType: 'json',
            success: function(res){
                if(res&&res.status == '100'){
                    checkDeviceTemplate(res.data);
                    if(typeof callback == 'function'){
                        callback();
                    }
                }
            }
        });
    };

    /*检查设备模板匹配，只匹配第一个，匹配成功即OK*/
    var checkDeviceTemplate = function(templates){
        _.each(templates, function(o){
            if(typeof device[o.key] != 'undefined' && device[o.key] == o.value){
                try{
                    itemsJson = JSON.parse(o.itemsJson);
                }catch(e){
                    itemsJson = [];
                }
                return false; 
            }
        });
    };

    /*获取实时数据*/
    var current_data = function(){
        currentData = [];
        ToolBox.ajax({
            type: 'get',
            url: 'currentdata/pagination',
            data: {
                token: ToolBox.getCookie('token'),
                deviceId: device.deviceId,
                page: 1,
                perPage: 1000
            },
            dataType: 'json',
            success: function(res){
                if(res&&res.status == '100'&&res.result&&res.result.data){
                    var el = '';
                    _.each(res.result.data, function(o){
                        _.each(itemsJson, function(p){
                            if(p.item_name == o.itemname){
                                currentData.push(o);
                                o.tag = filterItemControlMapping(o.itemname, o.val);
                                el += single_item(o);
                                return false;
                            }
                        });
                    });
                    var $el = $(el);
                    container.html($el);
                }
            }
        });
    };

    /*单个数据项展示*/
    var single_item = function(data){
        if(typeof data != 'object'){
            return false;
        }
        return template({'tempId': 'single-item', 'data': data});
    };

    /*获取数据项控制映射*/
    var getItemControlMapping = function(){
        ToolBox.ajax({
            type: 'get',
            url: 'itemControlMapping/list',
            data: {
                token: ToolBox.getCookie('token')
            },
            dataType: 'json',
            success: function(res){
                if(res&&res.status == '100'&&res.data){
                    itemControlMapping = res.data;
                    current_data();
                }
            }
        });
    };

    /*获取某个数据项的控制映射*/
    var filterItemControlMapping = function(itemName, value){
        var tag;
        _.each(itemControlMapping, function(o){
            if(o.itemName == itemName && o.targetValue == value 
                && checkDeviceInfo(o.key, o.value)){
                tag = o.tag;
                return false;
            }
        });
        return tag;
    };

    /*匹配设备台账信息*/
    var checkDeviceInfo = function(key, value){
        if(typeof device != 'object'){
            return false;
        }
        var flag = false;
        _.each(device, function(v, k){
            if(k == key && v == value){
                flag = true;
                return false;
            }
        });
        return flag;
    };

    /*设备数据*/
    var device = {};

    /*匹配*/
    var itemsJson = [];

    /*实时数据*/
    var currentData = [];

    /*目标jquery对象*/
    var container;

    /*数据项控制映射*/
    var itemControlMapping = [];

    return {
        init: function(deviceId, deviceInfo, targetEL){
            if(typeof deviceId != 'number' || typeof deviceInfo != 'object' || 
                typeof deviceInfo.type != 'string' || !ToolBox.checkDeviceType(deviceInfo.type) ||
                typeof targetEL == 'undefined'){
                return false;
            }
            device = deviceInfo;
            device.deviceId = deviceId;
            container = targetEL;
            /*events*/
            bindEvents();
            /*start*/
            device_template(getItemControlMapping);
        }
    };

});