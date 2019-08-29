define([
    'toolbox',
    'text!templates/plugins/settings.jst',
    'css!style/settings'
], function(ToolBox,SettingTemplate){

    var template = _.template(SettingTemplate);
    var ApiUrl="https://jcm-cloud.anylink.io/";
    var repeat_values=["每天","周一至周五","法定工作日","自定义"];
    var json_map=[
        {
            num:0,
            text:'SUN'
        },
        {
            num:1,
            text:'MON'
        },
        {
            num:2,
            text:'TUES'
        },
        {
            num:3,
            text:'WED'
        },
        {
            num:4,
            text:'THUR'
        },
        {
            num:5,
            text:'FRI'
        },
        {
            num:6,
            text:'SAT'
        }
    ];
    //自定义开始日期数组
    var stime_ary=[];
    //自定义结束日期数组
    var etime_ary=[];

    //高级首页
    var layout_init = function () {
        $('#main').html(template({'tempId':'Settings-Menu-Frame'}));
        $('#setting_content').html(template({'tempId':'Setting-Menu-List'}));
    }

    //绑定事件
    var bind_events = function () {

        //用户注销
        $('#main').off('tap','.logout').on('tap','.logout',function (e) {
            e.stopPropagation();e.preventDefault();
            control_btn();
            ToolBox.confirm_alert({
                $container:$('#others'),
                afterCallback:function () {
                    unbindUser(function (res) {
                        if(res.status=='100'){
                            ToolBox.setCookie('token','',1);
                            //清空定时任务
                            clearInterval(timeJobId);
                        }
                        require(['app'],function (App) {
                            App.start();
                            $('body').css('background','#d2d2d2');
                        })
                    })
                },
                msg:ToolBox.getConstant('Constant-Logout-User')
            })
        })

        //项目列表
        $('#main').off('tap','.project_list').on('tap','.project_list',function (e) {
            require(['app'],function (App) {
                App.start();
                $('body').css('background','#d2d2d2');
                //删除定时任务
                clearInterval(timeJobId);
            })
        })

        //定时开关机
        $('#main').off('tap','.settimejob').on('tap','.settimejob',function (e) {
            e.stopPropagation();e.preventDefault();
            control_btn();
            //获取定时任务
            setting_val=[];
            getTimeJob(_deviceId,_itemId,1,function (res) {
                getTimeJob(_deviceId,_itemId,0,function (resp) {
                    var data={
                        //开始日期的开关
                        stime_flag:false,
                        //结束日期的开关
                        etime_flag:false,
                        //开始时间
                        stime:'',
                        //开始的重复
                        s_repeat:'',
                        //结束时间
                        etime:'',
                        //结束的重复
                        e_repeat:''
                    }
                    if(res.data.length!=0){
                        //设置了开机
                        data.stime_flag=true;
                        var val=res.data[0];
                        var s_tmp=val.cronExpr.split(" ");
                        var s_time=s_tmp[2]+":"+s_tmp[1];
                        data.stime=s_time;
                        var repeat='';
                        switch (val.type) {
                            case 0:
                                //每天
                                repeat='每天';
                                break;
                            case 1:
                                //节假日
                                repeat='法定工作日';
                                break;
                            case 2:
                                //周一至周五
                                repeat='周一至周五';
                                break;
                            case 3:
                                //自定义
                                repeat='自定义';
                                var tmp=val.cronExpr.split(",");
                                var s_array=[];
                                _.each(tmp,function (p,i) {
                                    if(i==0){
                                        var t=p.split(" ");
                                        s_array.push(t[t.length-1]);
                                    }else{
                                        s_array.push(p);
                                    }
                                })
                                _.each(s_array,function (t) {
                                    _.each(json_map,function (p) {
                                        if(p.text==t){
                                            stime_ary.push(p.num);
                                        }
                                    })
                                })
                                break;
                            default:
                                repeat='每天';
                                break;
                        }
                        data.s_repeat=repeat;
                    }
                    if(resp.data.length!=0){
                        //设置了关机
                        data.etime_flag=true;
                        var val=resp.data[0];
                        var e_tmp=val.cronExpr.split(" ");
                        var e_time=e_tmp[2]+":"+e_tmp[1];
                        data.etime=e_time;
                        var repeat='';
                        switch (val.type) {
                            case 0:
                                //每天
                                repeat='每天';
                                break;
                            case 1:
                                //节假日
                                repeat='法定工作日';
                                break;
                            case 2:
                                //周一至周五
                                repeat='周一至周五';
                                break;
                            case 3:
                                //自定义
                                repeat='自定义';
                                var tmp=val.cronExpr.split(",");
                                var e_array=[];
                                _.each(tmp,function (p,i) {
                                    if(i==0){
                                        var t=p.split(" ");
                                        e_array.push(t[t.length-1]);
                                    }else{
                                        e_array.push(p);
                                    }
                                })
                                _.each(e_array,function (t) {
                                    _.each(json_map,function (p) {
                                        if(p.text==t){
                                            etime_ary.push(p.num);
                                        }
                                    })
                                })
                                break;
                            default:
                                repeat='每天';
                                break;
                        }
                        data.e_repeat=repeat;
                    }
                    $('#setting_content').html(template({'tempId':'Set-Time-Job-Page','data':data}));
                    require(['bootstrap-switch','lCalendar'],function () {
                        //开机设置
                        $('#power_on').bootstrapSwitch(
                            {
                            size:'mini',
                            onSwitchChange:function (event,state) {
                                event.preventDefault();event.stopPropagation();
                                //不主动触发switch
                                $(this).bootstrapSwitch('state',!state,true);
                                //开始时间
                                var stime=$('#stimeVal').text();
                                //开始时间重复
                                var repeat=$('#srepeat_val').text();
                                var form={};
                                var pre_time,after_time,type,week='',kind=1;
                                pre_time=stime.split(":")[0];
                                after_time=stime.split(":")[1];
                                form.hour=pre_time;
                                form.min=after_time;
                                switch (repeat) {
                                    case repeat_values[0]:
                                        //每天
                                        type=0;
                                        break;
                                    case repeat_values[1]:
                                       //周一至周五
                                        type=2;
                                        break;
                                    case repeat_values[2]:
                                        //法定工作日
                                        type=1
                                        break;
                                    case repeat_values[3]:
                                        //自定义
                                        type=3;
                                        break;
                                    default:
                                        type=1;
                                        break;
                                }
                                form.type=type;
                                if(type===3){
                                        _.each(stime_ary,function (p,i) {
                                            _.each(json_map,function (q) {
                                                if(p==q.num){
                                                    if(i==stime_ary.length-1){
                                                        week+=q.text;
                                                    }else{
                                                        week+=q.text+',';
                                                    }
                                                }
                                            })
                                        })
                                        form.week=week;
                                }
                                form.kind=1;
                                form.devId=_deviceId;
                                form.itemId=_itemId;
                                form.value="1";
                                if(state){
                                     //未输入开机时间
                                    if(pre_time==undefined||after_time==undefined){
                                        ToolBox.alert_msg({
                                            $container:$('#others'),
                                            msg:ToolBox.getConstant('Constant-Setting-Time-Job-Undefined-Start-Time')
                                        })
                                        return;
                                    }

                                    if(repeat==''||repeat==undefined||repeat==null){
                                        ToolBox.alert_msg({
                                            $container:$('#others'),
                                            msg:ToolBox.getConstant('Constant-Setting-Time-Job-Undefined-Repeat-Date')
                                        });
                                        return;
                                    }

                                    //未输入自定义日期
                                    if(type==3&&week==''){
                                            ToolBox.alert_msg({
                                               $container:$('#others'),
                                               msg:ToolBox.getConstant('Constant-Setting-Time-Job-Undefined-Date')
                                            });
                                            return;
                                    }else{
                                       $('#power_on_img').show();
                                       $('#s_power_on').find('.bootstrap-switch').addClass('hidden');
                                       //先删除已经设置的
                                       deleteTimeJob(form.devId,form.itemId,form.kind,function () {
                                           setTimeJob(form,function (res) {
                                               //设置成功
                                               if(res.status=='100'){
                                                   ToolBox.alert_msg({
                                                       $container:$('#others'),
                                                       msg:ToolBox.getConstant('Constant-Setting-Time-Job-Start-Success'),
                                                       afterCallback:function () {
                                                           $('#power_on_img').hide();
                                                           $('#s_power_on').find('.bootstrap-switch').removeClass('hidden');
                                                           $('#power_on').bootstrapSwitch('state',!state,true);
                                                           $('#power_on').bootstrapSwitch('toggleState',true);
                                                           return;
                                                       }
                                                   });

                                                   return;
                                               }else{
                                                //设置失败
                                                   ToolBox.alert_msg({
                                                       $container:$('#others'),
                                                       msg:ToolBox.getConstant('Constant-Setting-Time-Job-Start-Fail'),
                                                       afterCallback:function () {
                                                           $('#power_on_img').hide();
                                                           $('#s_power_on').find('.bootstrap-switch').removeClass('hidden');
                                                           $('#power_on').bootstrapSwitch('state',!state,true);
                                                          // $('#power_on').bootstrapSwitch('toggleState',true);
                                                         //  $('#power_on').bootstrapSwitch('state',state);
                                                       }
                                                   })
                                                   return;
                                               }
                                           })
                                       })

                                    }
                                }else{
                                    $('#power_on_img').show();
                                    $('#s_power_on').find('.bootstrap-switch').addClass('hidden');
                                    //删除
                                    deleteTimeJob(form.devId,form.itemId,form.kind,function (res) {
                                        if(res.status=='100'){
                                            //取消定时开机成功
                                            ToolBox.alert_msg({
                                                $container:$('#others'),
                                                msg:ToolBox.getConstant('Constant-Cancel-Time-Job-Start-Success'),
                                                afterCallback:function () {
                                                    $('#power_on_img').hide();
                                                    $('#s_power_on').find('.bootstrap-switch').removeClass('hidden');
                                                    $('#power_on').bootstrapSwitch('state',!state,true);
                                                    $('#power_on').bootstrapSwitch('toggleState',true);
                                                    return;
                                                }
                                            });
                                            return;
                                        }else{
                                            //取消定时开机失败
                                            ToolBox.alert_msg({
                                                $container:$('#others'),
                                                msg:ToolBox.getConstant('Constant-Cancel-Time-Job-Start-Fail'),
                                                afterCallback:function () {
                                                    $('#power_on_img').hide();
                                                    $('#s_power_on').find('.bootstrap-switch').removeClass('hidden');
                                                    $('#power_on').bootstrapSwitch('state',!state,true);
                                                    return;
                                                }
                                            });
                                            return;
                                        }
                                    })
                                }
                            }
                            }
                        )

                        //关机设置
                        $('#power_off').bootstrapSwitch({
                            size:'mini',
                            onSwitchChange:function (event,state) {
                                event.stopPropagation();event.preventDefault();
                                $(this).bootstrapSwitch('state',!state,true);
                                //结束时间
                                var etime=$('#etimeVal').text();
                                //结束时间重复
                                var repeat=$('#erepeat_val').text();
                                var form={};
                                var pre_time,after_time,type,week='',kind=1;
                                pre_time=etime.split(":")[0];
                                after_time=etime.split(":")[1];
                                form.hour=pre_time;
                                form.min=after_time;
                                switch (repeat) {
                                    case repeat_values[0]:
                                        //每天
                                        type=0;
                                        break;
                                    case repeat_values[1]:
                                        //周一至周五
                                        type=2;
                                        break;
                                    case repeat_values[2]:
                                        //法定工作日
                                        type=1
                                        break;
                                    case repeat_values[3]:
                                        //自定义
                                        type=3;
                                        break;
                                    default:
                                        type=1;
                                        break;
                                }
                                form.type=type;
                                if(type===3){
                                    _.each(etime_ary,function (p,i) {
                                        _.each(json_map,function (q) {
                                            if(p==q.num){
                                                if(i==etime_ary.length-1){
                                                    week+=q.text;
                                                }else{
                                                    week+=q.text+',';
                                                }
                                            }
                                        })
                                    })
                                    form.week=week;
                                }
                                form.kind=0;
                                form.devId=_deviceId;
                                form.itemId=_itemId;
                                form.value="0";
                                if(state){
                                    //设置关机
                                    //未输入关机时间
                                    if(pre_time==undefined||after_time==undefined){
                                        ToolBox.alert_msg({
                                            $container:$('#others'),
                                            msg:ToolBox.getConstant('Constant-Setting-Time-Job-Undefined-End-Time')
                                        })
                                        return;
                                    }
                                    //未选择重复日期
                                    if(repeat==''||repeat==undefined||repeat==null){
                                        ToolBox.alert_msg({
                                            $container:$('#others'),
                                            msg:ToolBox.getConstant('Constant-Setting-Time-Job-Undefined-Repeat-Date')
                                        });
                                        return;
                                    }

                                    //未输入自定义日期
                                    if(type==3&&week==''){
                                        ToolBox.alert_msg({
                                            $container:$('#others'),
                                            msg:ToolBox.getConstant('Constant-Setting-Time-Job-Undefined-Date')
                                        });
                                        return;
                                    }else{
                                        $('#power_off_img').show();
                                        $('#e_power_off').find('.bootstrap-switch').addClass('hidden');
                                        //先删除已经设置的
                                        deleteTimeJob(form.devId,form.itemId,form.kind,function () {
                                            setTimeJob(form,function (res) {
                                                //设置成功
                                                if(res.status=='100'){
                                                    ToolBox.alert_msg({
                                                        $container:$('#others'),
                                                        msg:ToolBox.getConstant('Constant-Setting-Time-Job-End-Success'),
                                                        afterCallback:function () {
                                                            $('#power_off_img').hide();
                                                            $('#e_power_off').find('.bootstrap-switch').removeClass('hidden');
                                                            $('#power_off').bootstrapSwitch('state',!state,true);
                                                            $('#power_off').bootstrapSwitch('toggleState',true);
                                                            return;
                                                        }
                                                    });
                                                    return;
                                                }else{
                                                    //设置失败

                                                    ToolBox.alert_msg({
                                                        $container:$('#others'),
                                                        msg:ToolBox.getConstant('Constant-Setting-Time-Job-End-Fail'),
                                                        afterCallback:function () {
                                                            $('#power_off_img').hide();
                                                            $('#e_power_off').find('.bootstrap-switch').removeClass('hidden');
                                                            $('#power_off').bootstrapSwitch('state',!state,true);
                                                        }
                                                    })
                                                    return;
                                                }
                                            })
                                        })

                                    }
                                }else{
                                    //取消设置关机
                                    $('#power_off_img').show();
                                    $('#e_power_off').find('.bootstrap-switch').addClass('hidden');
                                    //删除
                                    deleteTimeJob(form.devId,form.itemId,form.kind,function (res) {
                                        if(res.status=='100'){
                                            //取消定时开机成功
                                            ToolBox.alert_msg({
                                                $container:$('#others'),
                                                msg:ToolBox.getConstant('Constant-Cancel-Time-Job-End-Success'),
                                                afterCallback:function () {
                                                    $('#power_off_img').hide();
                                                    $('#e_power_off').find('.bootstrap-switch').removeClass('hidden');
                                                    $('#power_off').bootstrapSwitch('state',!state,true);
                                                    $('#power_off').bootstrapSwitch('toggleState',true);
                                                    return;
                                                }
                                            });
                                            return;
                                        }else{
                                            //取消定时开机失败
                                            ToolBox.alert_msg({
                                                $container:$('#others'),
                                                msg:ToolBox.getConstant('Constant-Cancel-Time-Job-End-Fail'),
                                                afterCallback:function () {
                                                    $('#power_off_img').hide();
                                                    $('#e_power_off').find('.bootstrap-switch').removeClass('hidden');
                                                    $('#power_off').bootstrapSwitch('state',!state,true);
                                                    return;
                                                }
                                            });
                                            return;
                                        }
                                    })
                                }
                            },
                        })



                        var scalendar = new lCalendar();
                        scalendar.init({
                            'trigger':'#stime',
                            'type':'time',
                        })

                        var ecalendar = new lCalendar();
                        ecalendar.init({
                            'trigger':'#etime',
                            'type':'time',
                        })
                    })
                    bind_setting_events();

                })
            })
        })

        //我要报修
        $('#main').off('tap','.uploaderror').on('tap','.uploaderror',function (e) {
            e.stopPropagation();e.preventDefault();
            control_btn();
            $('#setting_content').html(template({'tempId':'Commit-Error-Page'}));
        })

        //关于我们
        $('#main').off('tap','.about').on('tap','.about',function (e) {
            e.stopPropagation();e.preventDefault();
            control_btn();
            $('#setting_content').html(template({'tempId':'About-Us-Page'}))
        })

        //返回高级列表页面
        $('#main').off('tap','#back_to_setting').on('tap','#back_to_setting',function (e) {
            e.stopPropagation();e.preventDefault();
            layout_init();
        })

    }

    //绑定开关机页面事件
    var bind_setting_events = function () {
        var week_days=[];
        //开始时间的重复选项
        $('#main').off('tap','#srepeat').on('tap','#srepeat',function (e) {
            e.stopPropagation();e.preventDefault();
            var flag=$(this).attr("flag");
            if(flag=='true'){
                //弹出重复选项
                $(this).attr("flag","false");
                $('#srepeat_list').show();
                $('#s_icon').removeClass('fa-angle-right').addClass('fa-angle-down');
                var s_cur_val=$('#srepeat_val').text();
                _.each($('.srepeat_choice'),function (p) {
                   $(p).removeClass('active');
                   $(p).find('i').addClass('hidden');
                    if($(p).find('span').text()==s_cur_val){
                        $(p).addClass('active');
                        $(p).find('i').removeClass('hidden');
                    }
                })
            }else{
                //关闭重复选项
                $(this).attr("flag","true");
                $('#srepeat_list').hide();
                $('#s_icon').removeClass('fa-angle-down').addClass('fa-angle-right');
            }

        })

        //结束时间的重复选项
        $('#main').off('tap','#erepeat').on('tap','#erepeat',function (e) {
            e.stopPropagation();e.preventDefault();
            var flag=$(this).attr("flag");
            if(flag=='true'){
                $(this).attr("flag","false");
                $('#erepeat_list').show();
                $('#e_icon').removeClass('fa-angle-right').addClass('fa-angle-down');
                var e_cur_val=$('#erepeat_val').text();
                _.each($('.erepeat_choice'),function (p) {
                    $(p).removeClass('active');
                    $(p).find('i').addClass('hidden');
                    if($(p).find('span').text()==e_cur_val){
                        $(p).addClass('active');
                        $(p).find('i').removeClass('hidden');
                    }
                })
            }else{
               $(this).attr("flag","true");
               $('#erepeat_list').hide();
               $('#e_icon').removeClass('fa-angle-down').addClass('fa-angle-right');
            }

        })

        //开始时间选择具体的某一项
        $('#srepeat_list').off('tap','.srepeat_choice').on('tap','.srepeat_choice',function (e) {
            e.stopPropagation();e.preventDefault();
            $('#srepeat').attr("flag","true");
            $('#srepeat_list').hide();
            $('#s_icon').removeClass('fa-angle-down').addClass('fa-angle-right');
            var choice =$(this).find('span').text();
            $('#srepeat_val').html(choice);
            if(choice=='自定义'){

                $('#settingByUserStart').modal('show').css({
                    width:ToolBox.screen_width*0.74,
                    height:ToolBox.screen_height*0.66,
                    'margin-left':function () {
                        return ToolBox.screen_width*0.13;
                    },
                    'margin-top':function () {
                        return ToolBox.screen_height*0.2;
                    }
                })

                require(['icheck'],function () {
                    $('#settingByUserStart input').iCheck({
                        checkboxClass: 'icheckbox_minimal',
                        radioClass: 'iradio_minimal',
                        increaseArea: '20%'
                    })
                    _.each(stime_ary,function (p) {
                        _.each($('#settingByUserStart label'),function (v) {
                            if($(v).attr('id')==p){
                                $(v).find('input').iCheck('check');
                            }
                        })
                    })
                })

            }
        })

        //自定义开始时间确定
        $('#settingByUserStart').off('tap','#startConfirm').on('tap','#startConfirm',function (e) {
            e.stopPropagation();e.preventDefault();
            stime_ary=[];
            _.each($('#settingByUserStart label'),function (e) {
               var id=$(e).attr('id');
                if($(e).find('.checked').length>0){
                    stime_ary.push(id);
                }
           })
            $('#settingByUserStart').modal('hide');
        })

        //结束时间选择具体某一项
        $('#erepeat_list').off('tap','.erepeat_choice').on('tap','.erepeat_choice',function (e) {
            e.stopPropagation();e.preventDefault();
            $('#erepeat').attr("flag","true");
            $('#erepeat_list').hide();
            $('#e_icon').removeClass('fa-angle-down').addClass('fa-angle-right');
            $('#erepeat_val').html($(this).find('span').text());
            if($(this).find('span').text()=='自定义'){
                $('#settingByUserEnd').modal('show').css({
                    width:ToolBox.screen_width*0.74,
                    height:ToolBox.screen_height*0.66,
                    'margin-left':function () {
                        return ToolBox.screen_width*0.13;
                    },
                    'margin-top':function () {
                        return ToolBox.screen_height*0.2;
                    }
                })

                require(['icheck'],function () {
                    $('#settingByUserEnd input').iCheck({
                        checkboxClass: 'icheckbox_minimal',
                        radioClass: 'iradio_minimal',
                        increaseArea: '20%'
                    })
                    _.each(etime_ary,function (p) {
                        _.each($('#settingByUserEnd label'),function (v) {
                            if($(v).attr('id')==p){
                                $(v).find('input').iCheck('check');
                            }
                        })
                    })
                })
            }
        })

        //自定义结束时间的确定
        $('#settingByUserEnd').off('tap','#endConfirm').on('tap','#endConfirm',function (e) {
            e.stopPropagation();e.preventDefault();
            etime_ary=[];
            _.each($('#settingByUserEnd label'),function (e) {
                var id=$(e).attr('id');
                if($(e).find('.checked').length>0){
                    etime_ary.push(id);
                }
            })
            $('#settingByUserEnd').modal('hide');
        })

        //点击确定
        // $('#main').off('tap','#confirm_setting').on('tap','#confirm_setting',function (e) {
        //     e.stopPropagation();e.preventDefault();
        //     deleteTimeJob(_deviceId,_itemId,1,function () {
        //         deleteTimeJob(_deviceId,_itemId,0,function () {
        //             var data={
        //                 devId:_deviceId,
        //                 itemId:_itemId,
        //                 type:0,
        //                 value:1,
        //                 hour:"13",
        //                 min:"19",
        //                 kind:1
        //             }
        //             $.ajax({
        //                 type:'post',
        //                 url:ApiUrl+'quartz',
        //                 data:{
        //                     data:JSON.stringify(data)
        //                 },
        //                 dataType:'json',
        //                 success:function (res) {
        //                     $.ajax({
        //                         type:'post',
        //                         url:ApiUrl+'quartz',
        //                         data:{
        //                             data:JSON.stringify({
        //                                 devId:_deviceId,
        //                                 itemId:_itemId,
        //                                 type:0,
        //                                 value:0,
        //                                 hour:"13",
        //                                 min:"20",
        //                                 kind:0
        //                             })
        //                         },
        //                         dataType:'json',
        //                         success:function (res) {
        //                             console.log(res);
        //                         }
        //                     })
        //                 }
        //             })
        //         })
        //     })
        //
        //
        //     // var v_flag=$('.power-switch').bootstrapSwitch('state');
        //     // //设置
        //     // if(v_flag){
        //     //     deleteTimeJob(_deviceId,_itemId,function (re) {
        //     //         var data={};
        //     //         var open_flag=1,close_flag=0;
        //     //         var stime=$('#stimeVal').text();
        //     //         var etime=$('#etimeVal').text();
        //     //         var pre_stime,after_stime,pre_etime,after_etime,type,week='';
        //     //         pre_stime=stime.split(":")[0];
        //     //         after_stime=stime.split(":")[1];
        //     //         pre_etime=etime.split(":")[0];
        //     //         after_etime=etime.split(":")[1];
        //     //         var open={
        //     //             value:open_flag,
        //     //             hour:pre_stime,
        //     //             min:after_stime
        //     //         };
        //     //         var close={
        //     //             value:close_flag,
        //     //             hour:pre_etime,
        //     //             min:after_etime
        //     //         };
        //     //         data.open=open;
        //     //         data.close=close;
        //     //         data.devId=_deviceId;
        //     //         data.itemId=_itemId;
        //     //         var repeat_val=$('#srepeat_val').text();
        //     //         switch (repeat_val) {
        //     //             case repeat_values[0]:
        //     //                 //每天
        //     //                 type=0;
        //     //                 break;
        //     //             case repeat_values[1]:
        //     //                 //周一至周五
        //     //                 type=2;
        //     //                 break;
        //     //             case repeat_values[2]:
        //     //                 //法定工作日
        //     //                 type=1;
        //     //                 break;
        //     //             case repeat_values[3]:
        //     //                 //自定义
        //     //                 type=3;
        //     //                 break;
        //     //             default:
        //     //                 type=0;
        //     //                 break;
        //     //         }
        //     //         if(type===3){
        //     //             _.each(setting_val,function (p,index) {
        //     //                 _.each(json_map,function (q) {
        //     //                     if(p==q.num){
        //     //                        if(index==setting_val.length-1){
        //     //                            week+=q.text;
        //     //                        }else {
        //     //                            week+=q.text+',';
        //     //                        }
        //     //                     }
        //     //                 })
        //     //             })
        //     //             data.week=week;
        //     //         }
        //     //         data.type=type;
        //     //         setTimeJob(data,function (res) {
        //     //             if(res.status=='100'){
        //     //                 ToolBox.alert_msg({
        //     //                     $container:$('#others'),
        //     //                     msg:ToolBox.getConstant('Constant-Setting-Time-Job-Success')
        //     //                 })
        //     //             }else{
        //     //                 ToolBox.alert_msg({
        //     //                     $container:$('#others'),
        //     //                     msg:ToolBox.getConstant('Constant-Setting-Time-Job-Fail')
        //     //                 })
        //     //             }
        //     //         })
        //     //     })
        //     // }else{
        //     // //删除
        //     //     deleteTimeJob(_deviceId,_itemId,function (res) {
        //     //         if(res.status=='100'){
        //     //             ToolBox.alert_msg({
        //     //                 $container:$('#others'),
        //     //                 msg:ToolBox.getConstant('Constant-Setting-Time-Job-Success')
        //     //             })
        //     //         }else{
        //     //             ToolBox.alert_msg({
        //     //                 $container:$('#others'),
        //     //                 msg:ToolBox.getConstant('Constant-Setting-Time-Job-Fail')
        //     //             })
        //     //         }
        //     //     })
        //     // }
        // })
    }
    
    //设置定时任务
    var setTimeJob = function (data,cb) {
        $.ajax({
            type:'post',
            url:ApiUrl+'quartz',
            data:{
                data:JSON.stringify(data)
            },
            dataType:'json',
            success:function (res) {
                cb(res);
            }
        })
    }

    //删除定时任务
    var deleteTimeJob = function (deviceId,itemId,kind,cb) {
        $.ajax({
            type:'delete',
            url:ApiUrl+'quartz?'+$.param({
                devId:deviceId,
                itemId:itemId,
                kind:kind
            }),
            contentType:'application/json',
            data:{
            },
            dataType:'json',
            success:function (res) {
                cb(res);
            }
        })
    }

    //发送解绑
    var unbindUser =function (callback) {
        ToolBox.ajax({
            type:'post',
            url:'weixin/unbindAccount',
            data:JSON.stringify({
                token:ToolBox.getCookie('token'),
                weixin_id:ToolBox.getCookie('openId'),
           //     weixin_id:100,
            }),
            dataType:'json',
            success:function (res) {
                callback(res);
            }
        })
    }

    //获取定时开关机
    var getTimeJob = function (deviceId,itemId,kind,cb) {
        $.ajax({
            type:'get',
            url:ApiUrl+'quartz',
            data:{
                devId:deviceId,
                itemId:itemId,
                kind:kind
            },
            dataType:'json',
            success:function (res) {
                cb(res);
            }
        })
    }

    //控制返回
    var control_btn = function () {
        $('#back_to_setting').show();
        $('#setting_back').hide();
    }

    var _deviceId=0;
    var _itemId=0;
    return {
        init:function (deviceId,itemId) {
            _deviceId=deviceId;
            _itemId=itemId;
            // _deviceId=1433760774;
          //   _itemId=15
            layout_init();
           bind_events();
        }
    };

});