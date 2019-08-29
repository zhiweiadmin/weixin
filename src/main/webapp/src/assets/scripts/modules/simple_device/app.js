define([
    'toolbox',
    'scripts/modules/simple_device/layout',
    'scripts/plugins/device_detail'
    ], function(ToolBox, Layout, DeviceDetail){

    /*frame*/
    var layout_init = function(){
        $('#main').html(Layout.basic_frame());
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

    /*提前绑定事件*/
    var bindEvents = function(){
        //点击加载更多
        $('#main').on('tap', '#footer-btns', function(e){
            var $p = $('#footer-btns').find('p:not(".hidden")');
            if($p.index() == 0){
                /*加载更多*/
                footBtnsChange(1);
                getDeviceList();
            }
        });
        //点击查看详情
        $('#main').on('tap', '#content .panel', function(e){
            e.preventDefault();
            e.stopPropagation();
            var $panel = $(e.currentTarget);
            var index = $panel.closest('.row').index();
            var device = device_list[index];
            if(typeof device == 'object'){
                /*机型验证通过*/
                $('#page_title').hide();
                $('#footer-btns').hide();
                $('#content').html('');
                DeviceDetail.init(device.deviceId, device, $('#content'));
                $('#logo').show();
                $('#location').show();
                $('#location').html(device.device_name);
            }else{
                ToolBox.alert_msg({
                    $container: $('#others'),
                    msg: ToolBox.getConstant('Constant-device-type-error')
                });
            }
        });

        //控制当前只能更改一个panel
        var stack=[];

        //长按panel修改设备信息
        $('#main').on('taphold','#content .panel',function (e) {
            e.preventDefault();
            e.stopPropagation();
            stack.push(1);
            if(stack.length==1){
                $('#main').off('tap','#content .panel');
                $(this).find('.bottom-tab').removeClass('hidden');
                $(this).find('.style-change').removeAttr('disabled');
                getAirInfo();
            }else{
                return;
            }
        })
        


        //编辑->取消
        $('#main').on('tap','.bottom-cancel',function (e) {
            e.preventDefault();
            e.stopPropagation();
            e.preventBubble;
            stack=[];
            add_click_event();
            $(this).parent().parent().parent().find('.bottom-tab').addClass('hidden');
            $(this).parent().parent().parent().find('.style-change').attr('disabled',true);
        })

        //编辑->确定
        $('#main').off('tap','.bottom-confirm').on('tap','.bottom-confirm',function (e) {
            e.preventDefault();
            e.stopPropagation();
            e.preventBubble;
            stack=[];
            var $panel = $(this).parent().parent().parent();
            var index = $panel.closest('.row').index();
            var device = device_list[index];
            var aircondition_type = $panel.find('.aircondition-type').val();
            var aircondition_number = $panel.find('.aircondition-number').val();
            var net_number = $panel.find('.net-number').val();

            getDeviceInfo(device.deviceId,function (res) {
                var result=[];
                if($.isEmptyObject(aircond_number)){
                    //空调编号
                    var obj={};
                    obj['text']=Strformat(ToolBox.getConstant('Constant-aircondition-number'));
                    result.push(obj);
                }
                if($.isEmptyObject(aircond_type)){
                   // 空调型号
                    var obj={};
                    obj['text']=Strformat(ToolBox.getConstant('Constant-aircondition-type'));
                    result.push(obj);
                }
                if($.isEmptyObject(net_numb)){
                    //网络号
                    var obj={};
                    obj['text']=Strformat(ToolBox.getConstant('Constant-net-number'));
                    result.push(obj);
                }

                switch (result.length){
                    case 0:
                        //三个字段均有
                        getControlResult(device,aircondition_type,aircondition_number,net_number,function (res) {
                            //更改成功
                            var r=$.parseJSON(res);
                            if(r.status=='100'){
                                $panel.find('.bottom-tab').addClass('hidden');
                                $panel.find('.style-change').attr('disabled',true);
                                add_click_event();
                            }
                        })
                        break;
                    case 3:
                        //三个字段均没有
                        ToolBox.alert_msg({
                            $container:$('#others'),
                            msg:'台账字段均未配置'
                        })
                        $panel.find('.bottom-tab').addClass('hidden');
                        $panel.find('.style-change').attr('disabled',true);
                        add_click_event();
                        break;
                    default:
                        //部分字段未配置
                        var no_title='';
                        _.each(result,function (p,index) {
                            if(index==0){
                                no_title=p.text;
                            }else{
                                no_title+=','+p.text;
                            }
                        })
                        if(no_title!=''){
                            ToolBox.alert_msg({
                                $container:$('#others'),
                                msg:no_title+'台账未配置'
                            })
                        }else{
                         }
                        $panel.find('.bottom-tab').addClass('hidden');
                        $panel.find('.style-change').attr('disabled',true);
                        add_click_event();
                        var add_list_array=[];
                        //空调编号
                        if(!$.isEmptyObject(aircond_number)){
                            var obj={};
                            obj['deviceId']=device.deviceId;
                            obj['key']=aircond_number.key;
                            obj['value']=aircondition_number;
                            add_list_array.push(obj);
                        }
                        //空调型号
                        if(!$.isEmptyObject(aircond_type)){
                            var obj={};
                            obj['deviceId']=device.deviceId;
                            obj['key']=aircond_type.key;
                            obj['value']=aircondition_type;
                            add_list_array.push(obj);
                        }
                        //网络号
                        if(!$.isEmptyObject(net_number)){
                            var obj={};
                            obj['deviceId']=device.deviceId;
                            obj['key']=net_number.key;
                            obj['value']=net_number;
                            add_list_array.push(obj);
                        }
                        ToolBox.ajax({
                            type:'post',
                            url:'deviceInfo/add',
                            data:JSON.stringify({
                                token:ToolBox.getCookie('token'),
                                addList:add_list_array
                            }),
                            async:false,
                            contentType:'application/json',
                            success:function (res) {
                                if(res.status=='100'){
                                }else{
                                }
                            }
                        })
                        break;
                }
            })

        })

        //点击logo返回前一页
        $('#main').on('tap','#logo',function (e) {
             e.preventDefault();
             e.stopPropagation();
             $('#logo').hide();
             $('#footer-btns').show();
             $('#add').show();
             $('#location').hide();
             $('#page_title').show();
             $('#others').removeClass('bg-color-grey');
             $('#others').css('height',0);
             refresh();
        });

    };

    //添加点击panel的事件
    var add_click_event = function () {
        $('#main').off('tap','#content .panel').on('tap', '#content .panel', function(e){
            var $panel = $(e.currentTarget);
            var index = $panel.closest('.row').index();
            var device = device_list[index];
            if(typeof device == 'object'){
                /*机型验证通过*/
                //  $('#back').show();
                   $('#page_title').hide();
                 $('#footer-btns').hide();
                 //page_location();
                 $('#content').html('');
                 DeviceDetail.init(device.deviceId, device, $('#content'));
                 $('#logo').show();
                 $('#location').show();
                 $('#location').html(device.device_name);
                 }else{
                 ToolBox.alert_msg({
                 $container: $('#others'),
                 msg: ToolBox.getConstant('Constant-device-type-error')
                 });
            }
        });
    }

    //根据deviceid获取设备的台账字段
    var getDeviceInfo = function (deviceid,callback) {
        ToolBox.ajax({
            type:'get',
            url:'deviceInfo/info',
            data:{
                token:ToolBox.getCookie('token'),
                deviceId:deviceid,
            },
            dataType:'json',
            success:function (res) {
                if(res&&res.status=='100'){
                    if(typeof  callback=='function'){
                        callback(res);
                    }
                }
            }
        })
    }


    /*添加绑定设备初始化*/
    var addDevice_init = function(){
        $('#content').html(Layout.bind_device());
        var options = {
            submitHandler: function(){
                var value = $('input[name="acNumber"]').val();
                getDeviceIdList(value, function(){
                    ToolBox.alert_msg({
                        $container: $('#others'),
                        msg: ToolBox.getConstant('Constant-device-bind-success'),
                        afterCallback: function(){
                            $('#back').hide();
                            $('#footer-btns').show();
                            $('#add').show();
                            refresh();
                                }
                            });
                    });
            },
            rules: {
                acNumber: {
                    required: true
                }
            },
            messages: {
                acNumber: {
                    required: ToolBox.getConstant('Constant-addDevice-validate-acNumber')
                }
            }
        };
        ToolBox.validate.init(options, $('#bind-device form'));
    };
 
    //空调型号
    var aircond_type={};
 
    //空调编号
    var aircond_number={};

    //网络号
    var net_numb={};

    //获取空调字段信息
    var getAirInfo = function () {
        ToolBox.ajax({
          type:'get',
            url:'deviceInfo/list',
            data:{
                token:ToolBox.getCookie('token'),
                page:1,
                perPage:20,
            },
            dataType:'json',
            success:function (res) {
                if(res&&res.status=='100'){
                    var array = res.result.data;
                    try{
                        _.each(array,function (p) {
                            if(p.info_list!=undefined){
                                _.each(p.info_list,function (q) {
                                    if(q.fullName==Strformat(ToolBox.getConstant('Constant-aircondition-type'))){
                                        //空调型号
                                        aircond_type.key=q.key;
                                        aircond_type.id=q.id;
                                        aircond_type.fullName=q.fullName;
                                    }
                                    if(q.fullName==Strformat(ToolBox.getConstant('Constant-aircondition-number'))){
                                        //空调编号
                                        aircond_number.key=q.key;
                                        aircond_number.id=q.id;
                                        aircond_number.fullName=q.fullName;
                                    }
                                    if(q.fullName==Strformat(ToolBox.getConstant('Constant-net-number'))){
                                        //网络号
                                        net_numb.key=q.key;
                                        net_numb.id=q.id;
                                        net_numb.fullName=q.fullName;
                                    }
                                })
                            }
                        })
                    }
                    catch (err){
                        console.log(err);
                    }
                }
            }
        })
    }

    //去除字符串中的回车
    var Strformat=function (str) {
        return str.replace(/[\r\n]/g,"");
    }

    //更改设备台账信息
    var getControlResult = function (device,air_type,air_num,net_num,callback) {
        var addList=[];
        //空调型号
        if(aircond_type!=''&&aircond_type.id!=undefined&&aircond_type.key!=undefined){
            var obj={};
            obj.deviceId=device.deviceId;
            obj.key=aircond_type.key;
            obj.value=air_type;
            addList.push(obj);
        }
        //空调编号
        if(aircond_number!=''&&aircond_number.id!=undefined&&aircond_number.key!=undefined){
            var obj={};
            obj.deviceId=device.deviceId;
            obj.key=aircond_number.key;
            obj.value=air_num;
            addList.push(obj);
        }
        //网络号
        if(net_numb!=''&&net_numb.id!=undefined&&net_numb.key!=undefined){
            var obj={};
            obj.deviceId=device.deviceId;
            obj.key=net_numb.key;
            obj.value=net_num;
            addList.push(obj);
        }

        //批量添加设备台账信息
        ToolBox.ajax({
            type:'post',
            url:'deviceInfo/add',
            data:JSON.stringify({
                token:ToolBox.getCookie('token'),
                addList:addList
            }),
            contentType:'application/json',
            success:function (res) {
                if(typeof callback=='function'){
                    callback(res);
                }
            }
        })

    }


    /*追加显示设备*/
    var append_device_show = function(o){
        $('#content').append(Layout.single_device(o));
    };

    /*页数*/
    var page = 1;

    /*设备列表*/
    var device_list = [];

    /*刷新*/
    var refresh = function(){
        page = 1;
        device_list = [];
        $('#content').html('');
        getDeviceList();
    };

    var getDeviceList = function () {
          getDeviceAttrConfigs(function (arr) {
                ToolBox.ajax({
                    type:'get',
                    url:'devicelist/paginationList',
                    data:{
                        token:ToolBox.getCookie('token'),
                        page:page,
                        perPage:5,
                    },
                    dataType:'json',
                    success:function (res) {
                        if(res&&res.status=='100'&&res.result.data){
                           page++;
                            _.each(res.result.data,function (o) {
                                 var obj ={};
                                 obj['deviceId'] = o.id;
                                 obj['device_name'] = o.device_name;
                                 obj['device_type_name']=o.device_type_name;
                                 obj['device_condition'] = o.device_condition;
                                 obj['serial_number'] = o.serial_number;

                                //空调型号
                                if(o[air_type]!=undefined){
                                    obj['aircondition_type']=o[air_type];
                                }
                                //空调编号
                                if(o[air_num]!=undefined){
                                    obj['aircondition_num']=o[air_num];
                                }
                                //网络号
                                if(o[net_num]!=undefined){
                                      obj['net_number'] = o[net_num];
                                }
                                var tmp=[];
                                _.each(arr,function (p) {
                                    if(o[p.name.toLowerCase()]!=undefined){
                                        var ob = {};
                                        ob['name'] = p.full_name;
                                        ob['key'] = p.name;
                                        ob['value'] = o[p.name.toLowerCase()];
                                        tmp.push(ob);
                                    }else{
                                        var ob = {};
                                        ob['name'] = p.full_name;
                                        ob['key'] = p.name;
                                        ob['value'] = '';
                                        tmp.push(ob);
                                    }
                                })
                                obj['text'] = tmp;
                                append_device_show(obj);
                                device_list.push(obj);
                            })
                            if(res.result.data.length == 0){
                                footBtnsChange(2);
                                return false;
                            }
                            footBtnsChange(0);
                        }
                    }
                })
        })
    }
    
    /*获取设备ID列表*/
    var getDeviceIdList = function(value, callback){
        ToolBox.ajax({
            type: 'get',
            url: 'deviceInfo/search',
            data: {
                token: ToolBox.getCookie('token'),
                key: 'acNumber',
                value: value
            },
            dataType: 'json',
            success: function(res){
                if(res&&res.status == '100'&&res.data&&res.data.length > 0){
                    var deviceIds = '';
                    _.each(res.data, function(o, index){
                        if(index == 0){
                            deviceIds += o.deviceId;
                        }else{
                            deviceIds = ',' + deviceIds;
                        }
                    });
                    bindUserDevice(deviceIds, callback);
                }else{
                    ToolBox.alert_msg({
                        $container: $('#others'),
                        msg: ToolBox.getConstant('Constant-acNumber-search-error')
                    });
                }
            }
        });
    };

    /*绑定用户*/
    var bindUserDevice = function(deviceIds, callback){
        ToolBox.ajax({
            type: 'post',
            url: 'userDevice/add',
            data: JSON.stringify({
                token: ToolBox.getCookie('token'),
                deviceIds: deviceIds
            }),
            dataType: 'json',
            success: function(res){
                if(res&&res.status == '100'){
                    if(typeof callback == 'function'){
                        callback(res.data);
                    }
                }else{
                    ToolBox.alert_msg({
                        $container: $('#others'),
                        msg: ToolBox.getConstant('Constant-device-bind-error')
                    });
                }
            }
        });
    };
    
    /*获取设备信息*/
    var getDeviceAttrConfigs = function(callback){
        ToolBox.ajax({
            type: 'get',
            url: 'deviceAttrConfig/listOfJsonOptions',
            data: {
                token: ToolBox.getCookie('token')
            },
            dataType: 'json',
            success: function(res){
                if(res&&res.status == '100'){
                    if(typeof callback == 'function'){
                        callback(res.data);
                    }
                }else{
                    ToolBox.alert_msg({
                        $container: $('#others'),
                        msg: ToolBox.getConstant('Constant-deviceAttr-config-error')
                    });
                }
            }
        });
    };
    
    return {
        /*start: function() {
            ToolBox.weixin_api_ready(function () {
                layout_init();
                bindEvents();
            });
        }*/

        start:function () {
            layout_init();
            bindEvents();
        }
    };

});