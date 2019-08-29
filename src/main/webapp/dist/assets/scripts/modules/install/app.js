define([
    'toolbox',
    'scripts/modules/install/layout'
    ], function(ToolBox, Layout){

    /*layout初始化*/
    var layout_init = function(){
        Layout.init();
        Layout.nav_pills_change(0);
    };

    /*添加设备确认modal*/
    var add_device_confirm = function(){
        Layout.add_device_confirm({
            type: $('#addDeviceForm select[name="type"]').val(),
            installPlace: $('#addDeviceForm input[name="installPlace"]').val(),
            serialNumber: $('#addDeviceForm input[name="serialNumber"]').val(),
            acNumber: $('#addDeviceForm input[name="acNumber"]').val()
        });
        var options = {
            submitHandler: function(){
                addDevice(function(){
                    ToolBox.alert_msg({
                        $container: $('#others'),
                        msg: ToolBox.getConstant('Constant-addDevice-msg'),
                        beforeCallback: function(){
                            $('#confirm').modal('hide');
                        },
                        afterCallback: function(){
                            Layout.nav_pills_change(1);
                            refresh();
                        }
                    });
                });
            },
            rules: {
                type: {
                    air_conditioner_type: true
                },
                installPlace: {
                    required: true
                },
                serialNumber: {
                    required: true
                },
                acNumber: {
                    required: true
                }
            },
            messages: {
                type: {
                    air_conditioner_type: ToolBox.getConstant('Constant-addDevice-validate-type')
                },
                installPlace: {
                    required: ToolBox.getConstant('Constant-addDevice-validate-installPlace')
                },
                serialNumber: {
                    required: ToolBox.getConstant('Constant-addDevice-validate-serialNumber')
                },
                acNumber: {
                    required: ToolBox.getConstant('Constant-addDevice-validate-acNumber')
                }
            }
        };
        ToolBox.validate.init(options, $('#confirm form'));
    };

    /*事件初始化*/
    var events_init = function(){
        $('#main').on('tap', '.nav-pills li', function(e){
            var $li = $(e.currentTarget);
            Layout.nav_pills_change($li.index());
            if($li.index() == 1){
                refresh();
                    }
                });
        $('#main').on('tap', '#addDeviceBtn', function(e){
            Layout.add_device_panel();
            ToolBox.getLocation(function(address){
                $('#addDeviceForm input[name="installPlace"]').val(address);
            });
            var options = {
                submitHandler: function(){
                    add_device_confirm();
                },
                rules: {
                    serialNumber: {
                        required: true
                    },
                    acNumber: {
                        required: true
                    },
                    type: {
                        air_conditioner_type: true
                    },
                    installPlace: {
                        required: true
                    },
                    householdName: {
                        required: true
                    },
                    phone: {
                        phone: true
                    }
                },
                messages: {
                    serialNumber: {
                        required: ToolBox.getConstant('Constant-addDevice-validate-serialNumber')
                    },
                    acNumber: {
                        required: ToolBox.getConstant('Constant-addDevice-validate-acNumber')
                    },
                    type: {
                        air_conditioner_type: ToolBox.getConstant('Constant-addDevice-validate-type')
                    },
                    installPlace: {
                        required: ToolBox.getConstant('Constant-addDevice-validate-installPlace')
                    },
                    householdName: {
                        required: ToolBox.getConstant('Constant-addDevice-validate-householdName')
                    },
                    phone: {
                        phone: ToolBox.getConstant('Constant-addDevice-validate-phone')
                    }
                }
            };
            ToolBox.validate.init(options, $('#addDeviceForm'));
        });
        $('#main').on('tap', '#addDeviceForm a.scan', function(e){
            var $a = $(e.currentTarget);
            switch($a.attr('name')){
                case 'scan1':
                    ToolBox.scanCode(function(returnStr){
                        ToolBox.checkSerialNumber(returnStr, function(serialNumber){
                            $a.text(serialNumber);
                            $a.next().val(serialNumber);
                            /*tmp*/
                            $('#addDeviceForm').find('[name="scan2"]').text(serialNumber);
                            $('#addDeviceForm').find('input[name="acNumber"]').val(serialNumber);
                        });
                    });
                    break;
                case 'scan2':
                    ToolBox.scanCode(function(returnStr){
                        var num = returnStr.split(',')[1];
                        $a.text(num);
                        $a.next().val(num);
                    });
                    break;
            }
        });
        $('#main').on('tap', '#confirm span.scan', function(e){
            var $span = $(e.currentTarget);
            switch($span.attr('name')){
                case 'scan1':
                    ToolBox.scanCode(function(returnStr){
                        ToolBox.checkSerialNumber(returnStr, function(serialNumber){
                            $span.prev().val(serialNumber);
                        });
                    });
                    break;
                case 'scan2':
                    ToolBox.scanCode(function(returnStr){
                        var num = returnStr.split(',')[1];
                        $span.prev().val(num);
                    });
                    break;
            }
        });
        $('#main').on('tap', '.edit-device span[name="scan"]', function(e){
            var $span = $(e.currentTarget);
            ToolBox.scanCode(function(returnStr){
                var num = returnStr.split(',')[1];
                $span.prev().val(num);
            });
        });
        $('#main').on('tap', '#next', function(e){
            $('#addDeviceForm').submit();
        });
        $('#main').on('tap', '#addDevice:not([disabled])', function(e){
            $('#addDevice').attr("disabled", "disabled");
            $('#confirm form').submit();
        });
        $('#main').on('tap', '.dropdown-menu li', function(e){
            var $li = $(e.currentTarget);
            var index= $li.index();
            status_text = index;
            Layout.statusText_change(index);
            Layout.quickBtnsSwitch(index);
            refresh();
        });
        $('#main').on('taphold', '.single-device .panel', function(e){
            var $device = $(e.currentTarget);
            var index = $device.closest('.row').index();
            tmp_select_device = devices[index];
            $('#others').html(Layout.device_buttons({
                width: ToolBox.screen_width,
                height: ToolBox.screen_height
            }));
        });
        $('#others').on('tap', '.shade-content button', function(e){
            $btn = $(e.currentTarget);
            switch($btn.attr('id')){
                case 'edit':
                    /*edit device*/
                    $('#others').html('');
                    $('#navbar-2-container').html(Layout.edit_device(tmp_select_device, status_text));
                    var options = {
                        submitHandler: function(){
                            ToolBox.confirm_alert({
                                $container: $('#others'),
                                msg: ToolBox.getConstant('Constant-editDevice-msg'),
                                beforeCallback: function(){
                                    $('#confirm-alert').modal('hide');
                                },
                                afterCallback: function(){
                                    editDevice(function(){
                                        ToolBox.alert_msg({
                                            $container: $('#others'),
                                            msg: ToolBox.getConstant('Constant-editDeviceInfo-success'),
                                            afterCallback: function(){
                                                refresh();
                                            }
                                        });
                                    });
                                }
                            });
                        },
                        rules: {
                            householdName: {
                                required: true
                            },
                            installPlace: {
                                required: true
                            },
                            acNumber: {
                                required: true
                            },
                            phone: {
                                phone: true
                            }
                        },
                        messages: {
                            installPlace: {
                                required: ToolBox.getConstant('Constant-addDevice-validate-installPlace')
                            },
                            acNumber: {
                                required: ToolBox.getConstant('Constant-addDevice-validate-acNumber')
                            },
                            phone: {
                                phone: ToolBox.getConstant('Constant-addDevice-validate-phone')
                            },
                            householdName: {
                                required: ToolBox.getConstant('Constant-addDevice-validate-householdName')
                            }
                        }
                    };
                    ToolBox.validate.init(options, $('.edit-device form'));
                    break;
                case 'cancle':
                    $('#others').html('');
                    break;
            }
        });
        $('#main').on('tap', '.edit-device .btn-group a.btn', function(e){
            var $btn = $(e.currentTarget);
            switch($btn.attr('id')){
                case 'editDevice':
                    $('.edit-device form').submit();
                    break;
                case 'deleteDevice':
                    ToolBox.confirm_alert({
                        $container: $('#others'),
                        msg: ToolBox.getConstant('Constant-deleteDevice-msg'),
                        beforeCallback: function(){
                            $('#confirm-alert').modal('hide');
                        },
                        afterCallback: function(){
                            delteDevice(function(){
                                ToolBox.alert_msg({
                                    $container: $('#others'),
                                    msg: ToolBox.getConstant('Constant-deleteDevice-success'),
                                    afterCallback: function(){
                                        refresh();
                                    }
                                });
                            });
                        }
                    });
                    break;
                case 'cancle':
                    refresh();
                    break;
            }
        });
        $('#main').on('tap', '#refresh', refresh)
        $('#main').on('tap', '#footer-btns', function(){
            var $p = $('#footer-btns').find('p:not(".hidden")');
            if($p.index() == 0){
                /*加载更多*/
                footBtnsChange(1);
                getDeviceList();
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
        /*正序*/
        $('#main').on('tap', '#asc', function(){
            order = 1;
            refresh();
        });
        /*倒序*/
        $('#main').on('tap', '#desc', function(){
            order = 0;
            refresh();
        });
                }

    var search_serialNumber = '';

    /*添加设备*/
    var addDevice = function(callback){
        /*SE序列号*/
        var serialNumber = $('#confirm input[name="serialNumber"]').val();
        /*机型*/
        var deviceType = $('#confirm select[name="type"]').val();
        /*SE设备名称*/
        var deviceName = serialNumber + "_" + deviceType;
        /*ajax请求参数*/
        var options = {
                token: ToolBox.getCookie('token'),
                hash: 'test',
                serialNumber: serialNumber,
                deviceName: deviceName,
                deviceType: deviceType
        };
        /*是否开启温感模块功能*/
        if(support_temperature_module){
            options.temperatureProductName = temperature_config_name;
            options.temperatureCount = $('[name="temperatureModuleNum"]').val();
        }
        ToolBox.ajax({
            type: 'get',
            url: 'agent/addDevice',
            data: options,
            dataType: 'json',
            success: function(res){
                if(res&&res.status == '100'&&res.data){
                    var deviceId = res.data.result;
                    var time = res.data.htime;
                    addDeviceInfo(deviceId, time, callback);
                }else{
                    ToolBox.alert_msg({
                        $container: $('#others'),
                        msg: ToolBox.getConstant('Constant-addDevice-error-register'),
                        beforeCallback: function(){
                            $('#confirm').modal('hide');
                        }
                    });
                }
            }
        });
    };

    /*添加录入设备信息*/
    var addDeviceInfo = function(deviceId, installTime, callback){
        /*机型*/
        var deviceType = getDeviceTypeNameByValue($('#confirm select[name="type"]').val());
        /*安装地址*/
        var installPlace = $('#confirm input[name="installPlace"]').val();
        /*空调序列号*/
        var acNumber = $('#confirm input[name="acNumber"]').val();
        /*住户姓名*/
        var householdName = $('input[name="householdName"]').val();
        /*联系电话*/
        var phone = $('input[name="phone"]').val();
        /*SE序列号*/
        var serialNumber = $('#confirm input[name="serialNumber"]').val();
        ToolBox.ajax({
            type: 'post',
            url: 'deviceInfo/add',
            data: JSON.stringify({
                token: ToolBox.getCookie('token'),
                addList: [
                    {
                        deviceId: deviceId,
                        key: device_info.installTime.key,
                        value: installTime
                    },{
                        deviceId: deviceId,
                        key: device_info.acNumber.key,
                        value: acNumber
                    },{
                        deviceId: deviceId,
                        key: device_info.type.key,
                        value: deviceType
                    },{
                        deviceId: deviceId,
                        key: device_info.installPlace.key,
                        value: installPlace
                    },{
                        deviceId: deviceId,
                        key: device_info.householdName.key,
                        value: householdName
                    },{
                        deviceId: deviceId,
                        key: device_info.phone.key,
                        value: phone
                    },{
                        deviceId: deviceId,
                        key: device_info.serialNumber.key,
                        value: serialNumber
                    }
                ]
            }),
            dataType: 'json',
            success: function(res){
                if(res&&res.status == '100'){
                    bindUserAndDevice(deviceId, callback);
                }else{
                    ToolBox.alert_msg({
                        $container: $('#others'),
                        msg: ToolBox.getConstant('Constant-addDeviceInfo-error')
                    });
                }
            }
        });
    };

    /*用户与设备进行绑定*/
    var bindUserAndDevice = function(deviceId, callback){
        ToolBox.ajax({
            type: 'post',
            url: 'userDevice/add',
            data: JSON.stringify({
                token: ToolBox.getCookie('token'),
                deviceIds: deviceId
            }),
            dataType: 'json',
            success: function(res){
                if(res&&res.status == '100'){
                    if(typeof callback == 'function'){
                        callback();
                    }
                }else{
                    ToolBox.alert_msg({
                        $container: $('#others'),
                        msg: ToolBox.getConstant('Constant-bindDeviceUser-error')
                    });
                }
            }
        });
    };

    /*对接状态*/
    var status_text = 0;

    /*顺序*/
    var order = 0;

    /*页数*/
    var page = [1,1];

    /*设备缓存初始化*/
    var device_init = function(){
        page = [1,1];
        devices = [];        
        $('#navbar-2-container').html('');
    };

    /*刷新*/
    var refresh = function(flag){
        if(flag != true){
            search_serialNumber = '';
        }
        device_init();
        getDeviceList();
        getDisconnectDevicesCount();
    };

    /*设备数组*/
    var devices = [];

    /*页面追加设备列表*/
    var appendDevice = function(o){
        $('#navbar-2-container').append(Layout.single_device({
            disconnect: status_text,
            installDate: ToolBox.yyyyMMdd(o.installTime),
            installPlace: o.installPlace,
            type: o.type,
            householdName: o.householdName,
            phone: o.phone,
            acNumber: o.acNumber,
            serialNumber: o.serialNumber
        }));
    };

    /*获取设备列表*/
    var getDeviceList = function(){
        ToolBox.ajax({
            type: 'get',
            url: 'deviceInfo/list_transverse',
            data: {
                token: ToolBox.getCookie('token'),
                page: page[status_text],
                perPage: 8,
                flagAttrName: device_pk_attr_name,
                active: status_text,
                serialNumber: (function(){
                    if(typeof search_serialNumber == 'string' && search_serialNumber != ''){
                        return search_serialNumber;
                    }else{
                        return '';
                    }
                })(),
                orderAttrName: 'installTime',
                asc: order
            },
            dataType: 'json',
            success: function(res){
                if(res&&res.status == '100'&&res.result&&res.result.data){
                    page[status_text] ++;
                    //遍历分页获取到的数据
                    _.each(res.result.data, function(o){
                        o['deviceId'] = o.device_id;
                        //为了支持已有代码，进行大小写转换
                        o['acNumber'] = o.acnumber;
                        o['householdName'] = o.householdname;
                        o['installPlace'] = o.installplace;
                        o['installTime'] = o.installtime;
                        o['serialNumber'] = o.serialnumber;
                        devices.push(o);
                        appendDevice(o);          
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

    /*获取未对接成功的设备总数*/
    var getDisconnectDevicesCount = function(){
        ToolBox.ajax({
            type: 'get',
            url: 'deviceInfo/count',
            data: {
                token: ToolBox.getCookie('token'),
                flagAttrName: device_pk_attr_name,
                active: 0
            },
            dataType: 'json',
            success: function(res){
                if(res&&res.status == '100'){
                    Layout.msg_device_disconnect(res.data);
                    }
                }
        });
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

    var tmp_select_device = {};

    /*修改设备台账*/
    var editDevice = function(callback){
        var deviceId = tmp_select_device.deviceId;
        var householdName = $('.edit-device input[name="householdName"]').val();
        var phone = $('.edit-device input[name="phone"]').val();
        var installPlace = $('.edit-device input[name="installPlace"]').val();
        var acNumber = $('.edit-device input[name="acNumber"]').val();
        ToolBox.ajax({
            type: 'post',
            url: 'deviceInfo/add',
            data: JSON.stringify({
                token: ToolBox.getCookie('token'),
                addList: [
                    {
                        deviceId: deviceId,
                        key: device_info.acNumber.key,
                        value: acNumber
                    },{
                        deviceId: deviceId,
                        key: device_info.installPlace.key,
                        value: installPlace
                    },{
                        deviceId: deviceId,
                        key: device_info.householdName.key,
                        value: householdName
                    },{
                        deviceId: deviceId,
                        key: device_info.phone.key,
                        value: phone
                    }
                ]
            }),
            dataType: 'json',
            success: function(res){
                if(res&&res.status == '100'){
                    if(typeof callback == 'function'){
                        callback();
                    }
                }else{
                    ToolBox.alert_msg({
                        $container: $('#others'),
                        msg: ToolBox.getConstant('Constant-editDeviceInfo-error')
                    });
                }
            }
        });
    };

    /*删除设备*/
    var delteDevice = function(callback){
        var serialNumber = tmp_select_device.serialNumber;
        ToolBox.ajax({
            type: 'post',
            url: 'device/deleteAll',
            data: JSON.stringify({
                token: ToolBox.getCookie('token'),
                hash: 'test',
                serialNumber: serialNumber
            }),
            dataType: 'json',
            success: function(res){
                if(res&&res.status == '100'){
                    deleteDeviceInfo(callback);
                }else{
                    ToolBox.alert_msg({
                        $container: $('#others'),
                        msg: ToolBox.getConstant('Constant-deleteAgent-error')
                    });
                }
            }
        });
    };

    /*删除设备台账*/
    var deleteDeviceInfo = function(callback){
        var deviceId = tmp_select_device.deviceId;
        ToolBox.ajax({
            type: 'get',
            url: 'deviceInfo/deleteByDeviceId',
            data: {
                token: ToolBox.getCookie('token'),
                deviceId: deviceId
            },
            dataType: 'json',
            success: function(res){
                if(res&&res.status == '100'){
                    unbindUserDevice(callback);
                }else{
                    ToolBox.alert_msg({
                        $container: $('#others'),
                        msg: ToolBox.getConstant('Constant-deleteDeviceInfo-error')
                    });
                }
            }
        });
    };

    /*解除用户与设备的绑定*/
    var unbindUserDevice = function(callback){
        var deviceId = tmp_select_device.deviceId;
        ToolBox.ajax({
            type: 'get',
            url: 'userDevice/deleteByUserIdAndDeviceId',
            data: {
                token: ToolBox.getCookie('token'),
                deviceId: deviceId
            },
            dataType: 'json',
            success: function(res){
                if(res&&res.status == '100'){
                    if(typeof callback == 'function'){
                        callback();
                    }
                }else{
                    ToolBox.alert_msg({
                        $container: $('#others'),
                        msg: ToolBox.getConstant('Constant-unbindUserDevice-error')
                    });
                }
            }
        });
    };

    return {
        start: function(){
            ToolBox.weixin_api_ready(function(){
                layout_init();
                events_init();
            });
        }
    };

});