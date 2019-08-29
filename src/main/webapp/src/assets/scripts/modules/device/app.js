define([
    'toolbox',
    'scripts/modules/device/layout',
    'scripts/plugins/device_detail'
    ], function(ToolBox, Layout, DeviceDetail){
    
    /*初始化*/
    var layout_init = function(){
        Layout.frame_init();
        refresh();
    };

    /*加载更多/加载中/无更多数据*/
    var footBtnsChange = function(index){
        if(index == -1){
            $('#footer-btns p:not(".hidden")').addClass('hidden');
        }else{
            $('#footer-btns p:not(".hidden")').addClass('hidden');
            $('#footer-btns p:eq(' + index +')').removeClass('hidden');
        }
    };

    /*事件预处理*/
    var events_init = function(){
        $('#main').on('tap', '.nav-pills li', function(e){
            var $li = $(e.currentTarget);
            nav_status = $li.index();
            Layout.nav_pills_change($li.index());
            $('#footer-btns').show();
            refresh();
        });
        $('#main').on('tap', '#footer-btns', function(){
            var $p = $('#footer-btns').find('p:not(".hidden")');
            if($p.index() == 0){
                /*加载更多*/
                footBtnsChange(1);
                getDeviceList();
            }
        });
        $('#main').on('tap', '#content .panel', function(e){
            var $panel = $(e.currentTarget);
            var index = $panel.closest('.row').index();
            var device = devices[index];
            if(typeof device == 'object' && typeof device.type == 'string' 
                && ToolBox.checkDeviceType(device.type)){
                /*机型验证通过*/
                $('#footer-btns').hide();
                DeviceDetail.init(device.deviceId, device, $('#content'));
            }else{
                ToolBox.alert_msg({
                    $container: $('#others'),
                    msg: ToolBox.getConstant('Constant-device-type-error')
                });
            }
        });
        /*返回顶部*/
        $('#main').on('tap', '#top', function(){
            $('html, body').animate({scrollTop: 0}, 500);
        });
        /*显示serialNumber查询dialog*/
        $('#main').on('tap', '#search', function(){
            Layout.search_serialNumber();
        });
        /*查询*/
        $('#main').on('tap', '#searchSubmit', function(){
            var serialNumber = $('#searchDialog').find('input[name="serialNumber"]').val();
            if(typeof serialNumber == 'string' && typeof serialNumber != ''){
                search_serialNumber = serialNumber;
                $('#searchDialog').modal('hide');
                refresh(true);
            }
        });
    };

    var search_serialNumber = '';

    /*追加显示设备*/
    var append_device_show = function(o){
        $('#content').append(Layout.single_device({
            type: o.type,
            acNumber: o.acNumber,
            serialNumber: o.serialNumber,
            installPlace: o.installPlace,
            householdName: o.householdName,
            phone: o.phone,
            userList: o.userList,
            alarmList: [],
            online: o.online
        }));
    };

    /*页数*/
    var page = [1,1];

    /*状态*/
    var nav_status = 0; //0:开机,1:关机 

    /*devices*/
    var devices = [];

    /*刷新*/
    var refresh = function(flag){
        if(flag != true){
            search_serialNumber = '';
        }
        page = [1,1];
        devices = [];
        $('#content').html('');
        getDeviceList();
    };

    /*获取设备列表*/
    var getDeviceList = function(){
        ToolBox.ajax({
            type: 'get',
            url: '/device/list_extend',
            local: true,
            data: {
                token: ToolBox.getCookie('token'),
                page: page[nav_status],
                perPage: 8,
                flagAttrName: device_pk_attr_name,
                active: 1,
                serialNumber: (function(){
                    if(typeof search_serialNumber == 'string' && search_serialNumber != ''){
                        return search_serialNumber;
                    }else{
                        return '';
                    }
                })(),
                condition: (function(){
                    if(nav_status == 0){
                        return 1;
                    }else if(nav_status == 1){
                        return 0;
                    }
                })()
            },
            dataType: 'json',
            success: function(res){
                if(res&&res.status == '100'&&res.result&&res.result.data){
                    page[nav_status] ++;
                    if(typeof res.userList == 'string'){
                        res.userList = JSON.parse(res.userList);
                    }
                    //遍历分页获取到的数据
                    _.each(res.result.data, function(o){
                        var obj = {};
                        obj['deviceId'] = o.deviceId;
                        _.each(o.info_list, function(p){
                            obj[p.attrName] = p.value;
                        });
                        if(typeof res.userList == 'object'){
                            _.each(res.userList, function(p){
                                if(obj.deviceId == p.deviceId){
                                    obj['userList'] = p.userList;
                                    return false;
                                }
                            });
                        }
                        obj.online = !nav_status;
                        append_device_show(obj);
                        devices.push(obj);
                    });
                    if(res.result.data.length == 0){
                        footBtnsChange(2);
                        return false;
                    }
                    footBtnsChange(0);
                }
            }
        });
    };

    return {
        start: function(){
            layout_init();
            events_init();
        }
    };

});