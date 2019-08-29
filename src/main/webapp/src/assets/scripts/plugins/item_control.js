define([
    'toolbox',
    'text!templates/plugins/item_control.jst',
    'css!style/item_control'
    ], function(ToolBox, ItemControlTemplate){

    var template = _.template(ItemControlTemplate);

    /*显示控制对话框*/
    var control_dialog = function(itemControlMapping){
        $container = $(template({'tempId': 'control-dialog', 'data': item, 
            'width': target.outerWidth(), 'height': target.outerHeight(),
            'left': target.position().left, 'top': target.position().top,
            'itemControlMapping': itemControlMapping}));
        target.parent().find('.item-control').remove();
        $container.on('tap', '[name="close"]', function(e){
            $(e.target).parents('.item-control').remove();
            return false;
        });
        $container.on('tap', '[name="control"]', function(e){
            var val = $(e.target).parents('.item-control').find('input[name="val"]').val();
            if(typeof val == 'undefined' || val == ''){
                return false;
            }
            sendControl(val);
            return false;
        });
        $container.on('tap', '[data-value]', function(e){
            var val = $(e.currentTarget).attr('data-value');
            if(typeof val == 'undefined' || val == ''){
                return false;
            }
            sendControl(val);
            return false;
        });
        target.parent().append($container);
    };

    /*获取数据项控制映射*/
    var getItemControlMapping = function(callback, itemName){
        if(typeof callback != 'undefined'){
            if(typeof itemName == 'undefined'){
                callback();
                return false;
            }
            ToolBox.ajax({
                type: 'GET',
                url: 'itemControlMapping/list',
                data: {
                    token: ToolBox.getCookie('token'),
                    itemName: itemName
                },
                dataType: 'json',
                success: function(res){
                    if(res && res.data){
                        var itemControlMapping = [];
                        _.each(res.data, function(o){
                            if(checkDeviceInfo(o.key, o.value)){
                                //找到匹配的映射
                                itemControlMapping.push(o);
                            }
                        });
                        callback(itemControlMapping);
                    }
                }
            });
        }
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

    /*发送控制命令*/
    var sendControl = function(val){
        ToolBox.ajax({
            type: 'put',
            url: 'control?' + $.param({
                token: ToolBox.getCookie('token'),
                hash: 'test',
                devid: item.devid,
                itemid: item.itemid,
                value: val
            }),
            data:{},
            dataType: 'json',
            success: function(res){
                if(typeof res.msg == 'string'){
                    control_msg(res.msg);
                }
                if(typeof res.data == 'string'){
                    control_msg(ToolBox.getConstant('Constant-control-process'));
                    getControlResult(item.devid, item.itemid, res.data);
                }
            }
        });
    };

    /*获取控制结果*/
    var getControlResult = function(devid, itemid, sign){
        var count = 0;
        var timer = setInterval(function(){
            ToolBox.ajax({
                type: 'get',
                url: 'control/result',
                data: {
                    token: ToolBox.getCookie('token'),
                    hash: 'test',
                    devid: devid,
                    itemid: itemid,
                    sign: sign
                },
                dataType: 'json',
                success: function(res){
                    switch(res.data){
                        case '0':
                            /*控制成功*/
                            control_msg(ToolBox.getConstant('Constant-control-success'));
                            clearInterval(timer);
                            break;
                        case '3':
                            /*控制超时*/
                            control_msg(ToolBox.getConstant('Constant-control-overtime'));
                            clearInterval(timer);
                            break;
                    }
                    if(count > 30){
                        control_msg(ToolBox.getConstant('Constant-control-stop'));
                        clearInterval(timer);
                    }
                    count++;
                }
            });
        }, 2000);
    };

    /*显示控制结果*/
    var control_msg = function(msg){
        $container.find('input[name="val"]').remove();
        $container.find('[name="control"]').remove();
        $container.find('[data-value]').remove();
        if($container.find('.input-group-addon').length == 0){
            $container.find('.input-group').append(template({'tempId': 'control-msg', 'data': msg}));
        }else{
            $container.find('.input-group-addon').html(msg);
        }
    };

    var item = {};

    var target;

    var $container;

    var device = {};

    return {
        init: function(itemInfo, targetEL, deviceInfo){
            if(typeof itemInfo != 'object' || typeof itemInfo.devid == 'undefined' || 
                typeof itemInfo.itemid == 'undefined' || typeof targetEL == 'undefined'){
                return false;                
            }
            item = itemInfo;
            device = deviceInfo;
            target = targetEL;
            getItemControlMapping(control_dialog, itemInfo.itemname);
        }
    };

});