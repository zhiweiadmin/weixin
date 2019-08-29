define([
    'toolbox',
    'text!templates/plugins/device_detail.jst',
    'scripts/plugins/filter_item',
    'css!style/device_detail'
    ], function(ToolBox, DeviceDetailTemplate, filterItemPlugin){

    var template = _.template(DeviceDetailTemplate);

    //初始化页面
    var device_frame_new = function () {
        var headerHeight = $('.header').outerHeight(true);
        var height = ToolBox.screen_height-headerHeight-15;
        var width = ToolBox.screen_width;
        var loadheight = height*0.11+headerHeight+15;
        return template({'tempId':'device-frame-new','height':height,'loadheight':loadheight,'width':width});
    }
    
    /*获取设备的实时数据*/
    var getDeviceCurrentData = function(deviceId, callback){
        if(typeof deviceId != 'number'){
            return false;
        }
        ToolBox.ajax({
            type: 'get',
            url: 'currentdata/pagination',
            data: {
                token: ToolBox.getCookie('token'),
                deviceId: deviceId,
                page: 1,
                perPage: 500
            },
            //async:false,
            dataType: 'json',
            success: function(res){
                if(res&&res.status == '100'&&res.result&&res.result.data&&typeof callback == 'function'){
                    callback(res.result.data);
                }
            }
        });
    };

    /*设备数据*/
    var device = {};

    //设备实时数据
    var device_current_data = {};

    //追加显示告警内容
    var append_show_alarm = function (o) {

        switch (o.severity){
            case 8 :
                o.severity='一级';
                break;
            case 9:
                o.severity='二级';
                break;
            case 10:
                o.severity='三级';
                    break;
            case 11:
                o.severity='四级';
                break;
            case 12:
                o.severity='通知';
                break;
        }

        $('#alarm_content').append(template({'tempId':'alarm-content-view','data':o}));
    }

    //当前运行模式
    var cur_mode=-1;
    
    //绘制页面
    var drawPage = function (device) {
        var height = ToolBox.screen_height;
        var width = ToolBox.screen_width;
        var headerHeight = $('.header').outerHeight(true);
        var others_height = height - $('#main').outerHeight(true) - $('#status').outerHeight(true);
        $('#status_content').html('');

        var result;
        getDeviceCurrentData(device.deviceId,function (res) {
            device_current_data=res;
            _.each(res,function (p) {
                if(p.alias==Strformat(ToolBox.getConstant('Constant-Group-Machine-Status'))){
                    //设备状态
                     // cur_mode=p.val
                    $('#control_content .append_machine_group').append(template({'tempId':'group-machine-status','data':p}));
                }else if(p.alias==Strformat(ToolBox.getConstant('Constant-Setting-Cold-Temperature'))){
                     //设置制冷
                    if(cur_mode!=-1&&cur_mode==1){
                        //显示
                        $('#control_content .append_set_temperature').append(template({'tempId':'set-temperature','data':p,'height':height-headerHeight-15}));
                    }
                }else if(p.alias==Strformat(ToolBox.getConstant('Constant-Setting-Hot-Temperature'))){
                    if(cur_mode!=-1&&cur_mode==2){
                       //制热
                        $('#control_content .append_set_temperature').append(template({'tempId':'set-temperature','data':p,'height':height-headerHeight-15}));
                    }else if(cur_mode!=-1&&cur_mode!=1&&cur_mode!=2){
                        $('#control_content .append_set_temperature').append(template({'tempId':'set-temperature','data':p,'height':height-headerHeight-15}));
                    }
                }else if(p.alias==Strformat(ToolBox.getConstant('Constant-Break-Code'))){
                    //
                    $('#control_content .append_all_alarm').append(template({'tempId':'all-alarm','data':p}));
                }else if(p.alias==Strformat(ToolBox.getConstant('Constant-Worked-Mode'))){
                    //设定运行模式
                    $('#control_content .append_work_mode').append(template({'tempId':'work-mode','data':p}));
                    //控制开关
                    $('#status_content').append(template({'tempId':'machine-status','data':p,'height':height-headerHeight-15,'width':width}));
                    cur_mode=p.val;
                }else if(p.alias==Strformat(ToolBox.getConstant('Constant-Break-Code'))){
                  //故障代码 0 正常 非0 故障
                   // $('#control_content .append_all_alarm').append(template({'tempId':''}));
                }else if(p.alias==Strformat(ToolBox.getConstant('Constant-Water-In'))){
                    $('#control_content .append_others').append(template({'tempId':'others','data':p}));
                }else if(p.alias==Strformat(ToolBox.getConstant('Constant-Water-Out'))){
                    $('#control_content .append_others').append(template({'tempId':'others','data':p}));
                }
            })


            others_height = $('#status').outerHeight(true)+5;
            $('#others').addClass('bg-color-grey');
            $('#others').css('height',others_height);
            require(['honeySwitch'],function () {
                if($('#btn_status').hasClass('switch-off')){
                    $('#btn_status').css({
                        'border-color':'rgb(223, 223, 223)',
                        'box-shadow':'rgb(223, 223, 223) 0px 0px 0px 0px inset',
                        'background-color':'rgb(223, 223, 223);'
                    })
                }else if($('#btn_status').hasClass('switch-on')){
                    $('#btn_status').css({
                        'border-color':'rgb(100, 189, 99)',
                        'box-shadow':'rgb(100, 189, 99) 0px 0px 0px 16px inset',
                        'background-color':'rgb(100, 189, 99);'
                    })
                }
            })
            bind_switch_events();
        })


    }

    //去除字符串中的回车
    var Strformat=function (str) {
         return str.replace(/[\r\n]/g,"");
    }

    //绑定事件
    var bind_click_Events = function () {
        var timeoutId = -1;
         //温度加
        $('#control_content').off('click','#add_temperature').on('click','#add_temperature',function (e) {
            e.preventDefault();
            e.stopPropagation();
            //离线
            if(device.device_condition==0){
                ToolBox.alert_msg({
                    $container:$('#others'),
                    msg:ToolBox.getConstant('Constant-device-condition-offline')
                })
                return;
            }else if(device.device_condition==1){
                //在线
                var current_temperature = $('#current_temperature_val').text();
                var temp = current_temperature.split('℃')[0];
                $('#add_temperature').addClass('hidden');
                $('#click_add').removeClass('hidden');
                //温度加1
                temp++;
                //温度在范围内
                if(temp<100&&temp>=1){
                    $('#current_temperature_val').html(temp+'℃');
                }else {
                    //温度不在范围内
                    $('#current_temperature_val').html('30℃');
                }
                if(timeoutId!=-1){
                    clearTimeout(timeoutId);
                    timeoutId = setTimeout(function(){
                        send_control($('#current_temperature_val').text().split('℃')[0])
                    },800);
                }else{
                    timeoutId = setTimeout(function(){
                        send_control($('#current_temperature_val').text().split('℃')[0])
                    },800);
                }
                setTimeout(function () {
                    changeBtnStyle(1);
                },100);
            }else{
                //未知
                ToolBox.alert_msg({
                    $container:$('#others'),
                    msg:ToolBox.getConstant('Constant-device-condition-unknown')
                })
                return;
            }
        })

        //温度减
        $('#control_content').off('click','#minus_temperature').on('click','#minus_temperature',function (e) {
            e.preventDefault();
            e.stopPropagation();
            if(device.device_condition==0){
                //离线
                ToolBox.alert_msg({
                    $container:$('#others'),
                    msg:ToolBox.getConstant('Constant-device-condition-offline')
                })
                return;
            }else if(device.device_condition==1){
                //在线
                var current_temperature = $('#current_temperature_val').text().split('℃')[0];
                $('#minus_temperature').addClass('hidden');
                $('#click_minus').removeClass('hidden');
                current_temperature--;
                if(current_temperature>1&&current_temperature<=100){
                    $('#current_temperature_val').html(current_temperature+'℃');
                }else{
                    $('#current_temperature_val').html('16℃');
                }
                //连续改变温度 timeoutId不等于-1
                if(timeoutId!=-1){
                    //清除timeoutId
                    clearTimeout(timeoutId);
                    //更改timeoutId
                    timeoutId = setTimeout(function () {
                        send_control($('#current_temperature_val').text().split('℃')[0])
                    },800);
                }else{
                    //8毫秒没改变发送控制
                    timeoutId = setTimeout(function(){
                        send_control($('#current_temperature_val').text().split('℃')[0])
                    },800);

                }
                setTimeout(function () {
                    changeBtnStyle(2);
                },100);
            }else{
                //未知
                ToolBox.alert_msg({
                    $container:$('#others'),
                    msg:ToolBox.getConstant('Constant-device-condition-unknown')
                })
                return;
            }
        })
        
        //设备控制
        $('#tab').off('tap','.device-style').on('tap','.device-style',function (e) {
            e.preventDefault();
            e.stopPropagation();
            $('.current-alarm').removeClass('active');
            $('.tab-control').addClass('active');
            $('#control_content').show();
            $('#status_content').show();
            $('#alarm_view').addClass('hidden');
            var others_height = $('#status').outerHeight(true)+5;
            $('#others').addClass('bg-color-grey');
            $('#others').css('height',others_height);
        })

        //实时告警
        $('#tab').off('tap','.current-alarm').on('tap','.current-alarm',function (e) {
            e.preventDefault();
            e.stopPropagation();
            $('.tab-control').removeClass('active');
            $('.current-alarm').addClass('active');
            $('#control_content').hide();
            $('#status_content').hide();
            $('#alarm_view').removeClass('hidden');
            $('#alarm_view').html('');
            ShowAlarmView();
        })

       //更改工作模式
        $('#main .append_work_mode').off('tap','.pull-right').on('tap','.pull-right',function (e) {
            e.preventDefault();
            e.stopPropagation();
            if(checkDeviceOnline()){
                $('#config_work_mode').show();
                $('.mask-style').css('height',ToolBox.screen_height);
                $('body').css('overflow','hidden');
                $('#config_work_mode').find('.active').removeClass('active');
                _.each($('#config_work_mode .list-div-style'),function (i) {
                    if($(i).find('i')){
                        $(i).find('i').addClass('hidden');
                    }
                    var id=$(i).attr('list-index');
                    if(id==0){
                        $(i).addClass('hidden');
                    }
                    if(id==cur_mode){
                        $(i).find('.hidden').removeClass('hidden');
                        $(i).addClass('active');
                    }
                })
            }
        })

        $('#main #config_work_mode').off('tap','.list-div-style').on('tap','.list-div-style',function (e) {

            $('body').css('overflow','auto');
            var id = $(this).attr('list-index');
            $('#config_work_mode').find('.active').removeClass('active');
            _.each($('#config_work_mode .list-div-style'),function (i) {
                     if($(i).find('i')){
                         $(i).find('i').addClass('hidden');
                     }
                    var eid = $(i).attr('list-index');
                    if(eid==id){
                       $(i).addClass('active');
                        $(i).find('.hidden').removeClass('hidden');
                   }
            })
            $('#config_work_mode').hide();
            control_mode(id);
        })

        //点击mask取消
        $('#main').off('tap','.mask-style').on('tap','.mask-style',function (e) {
            e.preventDefault();
            e.preventBubble;
            e.stopPropagation();
            $('#config_work_mode').hide();
            $('body').css('overflow','auto');
        })

        //先解绑再绑定  查询
       $('#content').off('tap','#query1').on('tap','#query1',function (e) {
            e.preventDefault();
            e.stopPropagation();
            var stime = $('#startTime').val();
            var etime = $('#endTime').val();
            var stime_stamp=getTimeStamp(stime);
            var etime_stamp = getTimeStamp(etime);
            var seven_time_stamp = 7*24*60*60*1000;
            require(['lCalendar'],function () {
                if(etime_stamp<stime_stamp){
                    ToolBox.confirm_alert({
                        $container:$('#others'),
                        afterCallback:function () {
                        },
                        msg:ToolBox.getConstant('Constant-startTime-gt-endTime')
                    })

                }else if(etime_stamp-stime_stamp>seven_time_stamp){
                    ToolBox.confirm_alert({
                        $container:$('#others'),
                        afterCallback:function () {

                        },
                        msg:ToolBox.getConstant('Constant-time-over-seven-days')
                    })
                }else if(etime_stamp>stime_stamp){
                    searchAlarm(stime_stamp,etime_stamp);
                }

            })

        })
        
    }

   //显示告警tab 内容
    var ShowAlarmView=function () {
        $('#alarm_view').empty();
        $('#alarm_view').html(template({'tempId':'alarm-info'}));
        $('#others').css('height','5px');
        var now = new Date();
        var cur_timestamp=now.getTime()+5*60*1000;
        var one_day_ago = cur_timestamp-24*60*60*1000;
        searchAlarm(one_day_ago,cur_timestamp);
    };

    //检查设备是否在线
    var checkDeviceOnline = function () {
        if(device.device_condition==0){
            //离线
            ToolBox.alert_msg({
                $container:$('#others'),
                msg:ToolBox.getConstant('Constant-device-condition-offline')
            })
            return false;
        }else if(device.device_condition==1){
            //在线
            return true;
        }else{
            //未知
            ToolBox.alert_msg({
                $container:$('#others'),
                msg:ToolBox.getConstant('Constant-device-condition-unknown')
            })
            return false;
        }
    }

    //点击查询告警
    var searchAlarm = function (stime,etime) {
         ToolBox.ajax({
             type:'get',
             url:'alarm/currentAlarm',
             data:{
                 token:ToolBox.getCookie('token'),
                 page:1,
                 perPage:999,
                 startTime:stime,
                 endTime:etime,
             },
             dataType:'json',
             success:function (res) {
                 if(res.status=='100'){
                     $('#alarm_content').html('');
                     //追加显示告警
                     _.each(res.result.data,function (val) {
                         var obj={};
                         obj['info']=val.alarmdesc;
                         obj['severity'] = val.severity;
                         obj['time'] = formatDates(val.htime);
                         append_show_alarm(obj);
                     })
                     //暂无告警
                     if(res.result.data.length==0){
                         $('#alarm_content').append(template({'tempId':'no-alarm-template'}));
                         return;
                     }
                 }
             }
         })
    }

     //开关机设置
    var SettingStatus = function (val) {

       var item = getStatus(device_current_data,ToolBox.getConstant('Constant-Machine-Status'));
        if(item!=''&&item!=undefined){
            ToolBox.ajax({
                type:'put',
                url:'control?'+$.param({
                    token:ToolBox.getCookie('token'),
                    hash:'test',
                    devid:item.devid,
                    itemid:item.itemid,
                    value:val,
                }),
                data:{},
                dataType:'json',
                success:function (res) {
                    if(typeof  res.msg == 'string'){
                     //   control_msg(res.msg);
                    }
                    if(typeof  res.data == 'string'){
                      getControlResult(item.devid,item.itemid,res.data,val);
                    }
                }
            })
        }
    }
    
    //获取控制结果
    var getControlResult = function (devid,itemid,sign,val) {
        var count = 0;
        $('#loading').removeClass('hidden');
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
                            $('#msg_control').addClass('margin-left-5');
                            $('#msg_control').html('控制成功');
                            setTimeout(function () {
                                $('#loading').addClass('hidden');
                                $('#msg_control').removeClass('margin-left-5');
                                $('#msg_control').html('获取控制结果中...');
                            },500);
                           // ShowResultModal('控制成功',1);
                            if(val==0){//控制关
                                $('#btn_status').removeClass('switch-on');
                                $('#btn_status').addClass('switch-off');
                                $('#btn_status').css({
                                    'border-color':'rgb(223, 223, 223)',
                                    'box-shadow':'rgb(223, 223, 223) 0px 0px 0px 0px inset',
                                    'background-color':'rgb(255, 255, 255);'
                                })
                            }else{//控制开
                                $('#btn_status').removeClass('switch-off');
                                $('#btn_status').addClass('switch-on');
                                $('#btn_status').css({
                                    'border-color':'rgb(100, 189, 99)',
                                    'box-shadow':'rgb(100, 189, 99) 0px 0px 0px 16px inset',
                                    'background-color':'rgb(100, 189, 99);'
                                })
                            }
                            clearInterval(timer);
                            break;
                        case '3':
                            /*控制超时*/
                            $('#msg_control').addClass('margin-left-5');
                            $('#msg_control').html('控制超时');
                            setTimeout(function () {
                                $('#loading').addClass('hidden');
                                $('#msg_control').removeClass('margin-left-5');
                                $('#msg_control').html('获取控制结果中...');
                            },500);

                            //ShowResultModal('控制超时',1);
                            //control_msg(ToolBox.getConstant('Constant-control-overtime'));
                            clearInterval(timer);
                            if(val==0){//控制关
                                $('#btn_status').removeClass('switch-off');
                                $('#btn_status').addClass('switch-on');
                                $('#btn_status').css({
                                    'border-color':'rgb(100, 189, 99)',
                                    'box-shadow':'rgb(100, 189, 99) 0px 0px 0px 16px inset',
                                    'background-color':'rgb(100, 189, 99);'
                                })
                            }else {//控制开
                                $('#btn_status').removeClass('switch-on');
                                $('#btn_status').removeAttr('style');
                                $('#btn_status').addClass('switch-off');
                                $('#btn_status').css('style','border-color: rgb(223, 223, 223); box-shadow: rgb(223, 223, 223) 0px 0px 0px 0px inset; background-color: rgb(255, 255, 255);');
                            }
                            break;
                    }
                    if(count > 30){
                        $('#msg_control').addClass('margin-left-5');
                        $('#msg_control').html('控制结果不明');
                        setTimeout(function () {
                            $('#loading').addClass('hidden');
                            $('#msg_control').removeClass('margin-left-5');
                            $('#msg_control').html('获取控制结果中...');
                        },500);

                      //  ShowResultModal('控制结果不明',1);
                        clearInterval(timer);
                        if(val==0){
                            $('#btn_status').removeClass('switch-off');
                            $('#btn_status').addClass('switch-on');
                            $('#btn_status').css({
                                'border-color':'rgb(100, 189, 99)',
                                'box-shadow':'rgb(100, 189, 99) 0px 0px 0px 16px inset',
                                'background-color':'rgb(100, 189, 99);'
                            })
                        }else{
                            $('#btn_status').removeClass('switch-on');
                            $('#btn_status').removeAttr('style');
                            $('#btn_status').addClass('switch-off');
                            $('#btn_status').css('style','border-color: rgb(223, 223, 223); box-shadow: rgb(223, 223, 223) 0px 0px 0px 0px inset; background-color: rgb(255, 255, 255);');
                        }
                    }
                    count++;
                }
            });
        }, 2000);
    }

    //显示控制结果模态框
    var ShowResultModal = function (msg,flag) {
        if(flag==1){
            $('#showMsg').modal('show').css({
                width:ToolBox.screen_width*0.8,
                height:ToolBox.screen_height*0.6,
                'margin-left':function () {
                     return ToolBox.screen_width*0.1;
                },
                'margin-top':function () {
                    return ToolBox.screen_height*0.3;
                }
            });
            $('#showMsg #msg').html(msg);
        }
        if(flag==2){
            $('#showMsg').modal('show').css({
                width:ToolBox.screen_width*0.8,
                height:ToolBox.screen_height*0.6,
                'margin-left':function () {
                    return ToolBox.screen_width*0.1;
                },
                'margin-top':function () {
                    return ToolBox.screen_height*0.3;
                }
            });
            $('#showMsg #msg').html(msg);
           // drawPage(device);
            /*$('#showMsg').on('tap','#confirm',function (e) {
             //   e.preventDefault();
                clearContent();
                drawPage(device);
            })*/
        }
    }

    //获取设置温度的控制结果
    var getTemperatureControlResult= function (devid,itemid,sign,val) {
        var count = 0;
        $('#loading').removeClass('hidden');
        $('body').css('overflow','hidden');
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
                            $('#msg_control').addClass('margin-left-5');
                            $('#msg_control').html('控制成功');
                            $('body').css('overflow','auto');
                            setTimeout(function () {
                                $('#loading').addClass('hidden');
                                $('#msg_control').removeClass('margin-left-5');
                                $('#msg_control').html('获取控制结果中...');
                            },500);
                            clearInterval(timer);
                            bind_switch_events();
                            $('#current_temperature_val').html(val+'℃');
                            break;
                        case '3':
                            /*控制超时*/
                            $('#msg_control').addClass('margin-left-5');
                            $('#msg_control').html('控制超时');
                            $('body').css('overflow','auto');
                            setTimeout(function () {
                                $('#loading').addClass('hidden');
                                $('#msg_control').removeClass('margin-left-5');
                                $('#msg_control').html('获取控制结果中...');
                            },500);
                            clearInterval(timer);
                            clearContent();
                            drawPage(device);
                            bind_switch_events();
                            break;
                    }
                    if(count > 30){
                        //control_msg(ToolBox.getConstant('Constant-control-stop'));
                        $('#msg_control').addClass('margin-left-5');
                        $('#msg_control').html('控制结果不明');
                        $('body').css('overflow','auto');
                        setTimeout(function () {
                            $('#loading').addClass('hidden');
                            $('#msg_control').removeClass('margin-left-5');
                            $('#msg_control').html('获取控制结果中...');
                        },500);
                        clearInterval(timer);
                        clearContent();
                        drawPage(device);
                        bind_switch_events();
                    }
                    count++;
                }
            });
        }, 2000);
    }

    //获取设置模式控制结果
    var getControlModeResult = function (devid,itemid,sign,val) {
        var count = 0;
        $('#loading').removeClass('hidden');
        $('body').css('overflow','hidden');
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

                            $('#msg_control').addClass('margin-left-5');
                            $('#msg_control').html('控制成功');
                            $('body').css('overflow','auto');
                            clearInterval(timer);
                            //bind_switch_events();
                            setTimeout(function () {
                                clearContent();
                                drawPage(device);
                            },800);
                            //恢复初始值
                            setTimeout(function () {
                                $('#loading').addClass('hidden');
                                $('#msg_control').removeClass('margin-left-5');
                                $('#msg_control').html('获取控制结果中...');
                            },800);
                            //  $('#current_temperature_val').html(val+'℃');
                            break;
                        case '3':
                            /*控制超时*/
                            $('#msg_control').addClass('margin-left-5');
                            $('#msg_control').html('控制超时');
                            $('body').css('overflow','auto');
                            clearInterval(timer);
                           // clearContent();
                            setTimeout(function () {
                                $('#loading').addClass('hidden');
                                $('#msg_control').removeClass('margin-left-5');
                                $('#msg_control').html('获取控制结果中...');
                            },800);
                          //  drawPage(device);
                          //  bind_switch_events();
                            break;
                    }
                    if(count > 30){
                        //control_msg(ToolBox.getConstant('Constant-control-stop'));
                        $('#msg_control').addClass('margin-left-5');
                        $('#msg_control').html('控制结果不明');
                        $('body').css('overflow','auto');
                        clearInterval(timer);
                        setTimeout(function () {
                            $('#loading').addClass('hidden');
                            $('#msg_control').removeClass('margin-left-5');
                            $('#msg_control').html('获取控制结果中...');
                        },800);
                        //clearContent();
                        //drawPage(device);
                        //bind_switch_events();
                    }
                    count++;
                }
            });
        }, 2000);
    }

    //设置运行模式
    var control_mode = function (id) {
         if(checkDeviceOnline()){
             var item = getStatus(device_current_data,ToolBox.getConstant('Constant-Worked-Mode'));
             if(item!=''&&item!=undefined){
                 ToolBox.ajax({
                     type:'put',
                     url:'control?'+$.param({
                         token:ToolBox.getCookie('token'),
                         hash:'test',
                         devid:item.devid,
                         itemid:item.itemid,
                         value:id
                     }),
                     data:{},
                     dataType:'json',
                     success:function (res) {
                         if(res&&res.status=='100'){
                             if(typeof res.data=='string'){
                                 getControlModeResult(item.devid,item.itemid,res.data,id);
                             }
                         }
                     }
                 })
             }
         }
    }

    //绑定开关事件
    var bind_switch_events = function () {
        $('#switch_content').on('tap','#btn_status',function (e) {
            e.preventDefault();
            if($(this).hasClass("switch-disabled")){
                return;
            }
            if(checkDeviceOnline()){
                //  var e = jQuery.Event('tap');
                // $('.append_work_mode .pull-right').trigger(e);
                if($(this).hasClass("switch-on")){
                    //关闭空调
                    control_mode(0);
                }else if($(this).hasClass("switch-off")){
                    $('#config-power-off-on').show();
                    $('.power-mask-style').css('height',ToolBox.screen_height);
                    $('body').css('overflow','hidden');
                    $('#config-power-off-on').find('.active').removeClass('active');
                    _.each($('#config-power-off-on .power-list-div-style'),function (p) {
                        if($(p).find('i')){
                            $(p).find('i').addClass('hidden');
                        }
                        var id=$(p).attr('list-index');
                        if(id==cur_mode){
                            $(p).find('.hidden').removeClass('hidden');
                            $(p).addClass('active');
                        }
                    })

                    //点击遮罩层
                    $('#main').off('tap','.power-mask-style').on('tap','.power-mask-style',function (e) {
                        e.preventDefault();
                        e.preventBubble;
                        e.stopPropagation();
                        $('#config-power-off-on').hide();
                        $('body').css('overflow','auto');
                    })

                    //点击选择模式
                    $('#main #config-power-off-on').off('tap','.power-list-div-style').on('tap','.power-list-div-style',function (e) {

                        $('body').css('overflow','auto');
                        var id = $(this).attr('list-index');
                        $('#config-power-off-on').find('.active').removeClass('active');
                        _.each($('#config-power-off-on .power-list-div-style'),function (i) {
                            if($(i).find('i')){
                                $(i).find('i').addClass('hidden');
                            }
                            var eid = $(i).attr('list-index');
                            if(eid==id){
                                $(i).addClass('active');
                                $(i).find('.hidden').removeClass('hidden');
                            }
                        })
                        $('#config-power-off-on').hide();
                        control_mode(id);
                    })
                }



                /*if($(this).hasClass("switch-on")){
                 SettingStatus(0);
                 }
                 //打开
                 if($(this).hasClass("switch-off")){
                 SettingStatus(1);
                 }*/
            }
        })
    }

    // 清空div中的内容
    var clearContent = function () {
      $('#control_content .append_machine_group').empty();
      $('#control_content .append_set_temperature').empty();
      $('#control_content .append_all_alarm').empty();
      $('#control_content .append_work_mode').empty();
      $('#control_content .append_others').empty();
      $('#status_content').empty();
  }

    //根据key过滤当前数据项
    var getStatus = function (device_current_data,key) {
        var result;
        _.each(device_current_data,function (p) {
            if(p.alias==Strformat(key)){
                result=p;
                return result;
            }
        })
         return result;
    }


    var getCurrentAlarm = function (callback) {
         ToolBox.ajax({
             type:'get',
             url:'alarm/currentAlarm',
             data:{
                 token:ToolBox.getCookie('token'),
                 page:1,
                 perPage:999,
             },
             dataType:'json',
             success:function (res) {
                 if(res.status=='100'){
                     if(typeof  callback == 'function'){
                         callback(res.result.data);
                     }
                 }else{
                     ToolBox.alert_msg({
                         $container:$('#others'),
                         msg:ToolBox.getConstant('Constant-no-alarm')
                     })
                 }
             }
         })
    }

    //发送控制信息
    var send_control = function (val) {
        var item;
        //制冷
        if(cur_mode!=-1&&cur_mode==1){
            item=getStatus(device_current_data,ToolBox.getConstant('Constant-Setting-Cold-Temperature'));
        }
         //制热
        else if(cur_mode!=-1&&cur_mode==2){
          item=getStatus(device_current_data,ToolBox.getConstant('Constant-Setting-Hot-Temperature'));
        }else if(cur_mode!=-1&&cur_mode!=1&&cur_mode!=2){
           /*ToolBox.alert_msg({
               $container:$('#others'),
               msg:ToolBox.getConstant('Constant-Current-Mode-Cannot-Control')
           })*/
            item=getStatus(device_current_data,ToolBox.getConstant('Constant-Setting-Hot-Temperature'));
        }
        if(item!=''&&item!=undefined){
            ToolBox.ajax({
                type:'put',
                url:'control?'+$.param({
                    token:ToolBox.getCookie('token'),
                    hash:'test',
                    devid:item.devid,
                    itemid:item.itemid,
                    value:val,
                }),
                data:{},
                dataType:'json',
                success:function (res) {
                    if(typeof  res.msg == 'string'){
                        
                    }
                    if(typeof  res.data == 'string'){
                        getTemperatureControlResult(item.devid,item.itemid,res.data,val);
                    }
                }
            })
        }
    }

    //改变温度增加/减少按钮的样式
    var changeBtnStyle = function (flag) {
        switch (flag){
            case 1:
                $('#add_temperature').removeClass('hidden');
                $('#click_add').addClass('hidden');
                break;
            case 2:
                $('#minus_temperature').removeClass('hidden');
                $('#click_minus').addClass('hidden');
                break;
        }
    }

    //返回格式化时间
    var formatDate = function (date) {
        var d = new Date(date);
        var year = d.getFullYear();
        var month = d.getMonth()+1;
        var day = d.getDate();
        (month<10)?month='0'+month:month;
        (day<10)?day='0'+day:day;
        var hh = d.getHours();
        var mm = d.getMinutes();
        (hh<10)?hh='0'+hh:hh;
        (mm<10)?mm='0'+mm:mm;
        var formatDate = year + '-' + month + '-' + day + ' '+ hh +':'+mm;
        return formatDate;
    }

    //返回 yyyy-mm-dd hh:mm:ss
    var formatDates = function (date) {
        var d = new Date(date);
        var year = d.getFullYear();
        var month = d.getMonth()+1;
        var day = d.getDate();
        var ss = d.getSeconds();
        (month<10)?month='0'+month:month;
        (day<10)?day='0'+day:day;
        var hh = d.getHours();
        var mm = d.getMinutes();
        (hh<10)?hh='0'+hh:hh;
        (mm<10)?mm='0'+mm:mm;
        (ss<10)?ss='0'+ss:ss;
        var formatDate = year + '-' + month + '-' + day + ' '+ hh +':'+mm +':'+ss;
        return formatDate;
    }

    //返回时间戳
    var getTimeStamp = function (str) {
        var date = new Date(str);
        return date.getTime();
    }


    return {
      init:function (deviceId,deviceInfo,targetEl) {
          if(typeof  deviceId!='number' || typeof  deviceInfo!='object' || targetEl ==undefined){
              return false;
          }
          device = deviceInfo;
          device.deviceId = deviceId;
          //frame show
          targetEl.html(device_frame_new());
          //绘制页面
          drawPage(device);
          bind_click_Events();
          bind_switch_events();
      }
    };

});