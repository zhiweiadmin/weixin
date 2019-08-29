define([
    'toolbox',
    'text!templates/plugins/room_set.jst',
    'css!style/room_set'
], function(ToolBox,RoomSetTemplate){

    var template = _.template(RoomSetTemplate);

    //房间列表页面
    var set_room_frame = function () {
        $('#main').html(template({'tempId':'room-set-frame'}));
        //只有第一次进入的时候显示loading
        $("#loadingAjax").show();
       //初始化房间列表
       init_room_list();
       //开启定时任务
        startRoomTimeJob();
    }

    //初始化房间列表页面
    var init_room_list=function () {
        var array=[];
        $(".room-set-content-style").empty();
        getVdeviceItems(global_projectId,function (res) {
            var vids = [];
            _.each(res.data,function (p) {
                var obj = {
                    vname:p.vdeviceName,
                    vid:p.vdeviceId
                };
                vids.push(obj);
            })
            $.ajax({
                type:'post',
                url:'/device/current_data_vdevice',
                data:JSON.stringify({
                    token:ToolBox.getCookie("token"),
                    projectId:global_projectId,
                    page:1,
                    perPage:1000,
                    vdeviceIds:vids
                }),
                contentType:'application/json',
                dataType:'json',
                success:function (res) {
                    $("#loadingAjax").hide();
                    array = res.data||[];
                    for(var i=0;i<array.length;i++){
                        $('.room-set-content-style').append(template({'tempId':'single-room-info','data':array[i],'index':i}))
                    }
                    init_plugin();
                },
                error:function (err) {
                    console.error(err);
                }
            })
        })
    }
    
    //房间列表页面的定时任务
    var startRoomTimeJob = function () {
        //清除主画面的定时任务
        if(timeJobId!=-1){
            clearInterval(timeJobId);
        }
        //清除房间列表页面的定时任务
        if(roomJobId!=-1){
            clearInterval(roomJobId);
        }
        if(locationJobId!=-1){
            clearInterval(locationJobId);
        }

         //开始定时任务
        roomJobId = setInterval(function () {
           if($(".room-set-content-style").is(":visible")){
               getVdeviceItems(global_projectId,function (res) {
                   var vids = [];
                   _.each(res.data,function (p) {
                       var obj ={
                           vname:p.vdeviceName,
                           vid:p.vdeviceId
                       };
                       vids.push(obj);
                   })
                   $.ajax({
                       type:'post',
                       url:'/device/current_data_vdevice',
                       data:JSON.stringify({
                           token:ToolBox.getCookie("token"),
                           projectId:global_projectId,
                           page:1,
                           perPage:1000,
                           vdeviceIds:vids
                       }),
                       contentType:'application/json',
                       dataType:'json',
                       success:function (res) {
                           var data = res.data;
                          // console.log(data);
                           _.each(data,function (v,i) {
                               //房间名称
                               var $vname = $(".room-set-content-style").find("span[d_id='"+i+"-1']");
                               $vname.text(v.name);
                               _.each(v.items,function (val,index) {
                                   //温度显示
                                   if(index == 1){
                                       var $temp_show = $(".room-set-content-style").find("span[d_id='"+i+"-2']");
                                       $temp_show.text(val.val+"℃");
                                   }
                                   //设定温度显示
                                   if(index == 0){
                                       var $set_temp_show = $(".room-set-content-style").find("span[d_id='"+i+"-3']").find("span:nth-child(2)");
                                       $set_temp_show.text(val.val+"℃");
                                   }
                                   //湿度显示
                                   if(index==2){
                                       var $humi_show = $(".room-set-content-style").find("span[d_id='"+i+"-4']");
                                       $humi_show.text(val.val+"%");
                                   }
                                   //房间状态
                                   if(index==3){
                                       var $status = $(".room-set-content-style").find("span[d_id='"+i+"-5']");
                                       //0关机 1开机
                                       if(val.val==0){
                                           //关机
                                           $status.addClass("switch-off").removeClass("switch-on");

                                       }else if(val.val==1){
                                           //开机
                                           $status.addClass("switch-on").removeClass("switch-off");
                                       }
                                       init_plugin();
                                   }
                               })
                           })
                       },
                       error:function (err) {
                           console.error(err);
                       }
                   })
               })
           }
        },roomJobFre);
    }
    
    //获取某个项目的变量组列表
    var getVdeviceItems=function (projectId,callback) {
        ToolBox.ajax({
            type:'get',
            url:'project/vdeviceDataItem',
            data:{
                token:ToolBox.getCookie('token'),
                projectId:projectId
            },
            dataType:'json',
            success:function (res) {
                callback(res);
            }
        })
    }

    //初始化btn-switch 插件
    var init_plugin = function () {
        require(['honeySwitch'],function () {
            _.each($('.single-room-info'),function (e) {
                if($(e).find('#btn_status').hasClass('switch-on')){
                    //先置空
                    $(e).find("#btn_status").attr("style","");
                    $(e).find('#btn_status').css({
                        'border-color':'rgb(100, 189, 99)',
                        'box-shadow':'rgb(100, 189, 99) 0px 0px 0px 16px inset',
                        'background-color':'rgb(100, 189, 99);'
                    })
                }
                if($(e).find('#btn_status').hasClass('switch-off')){
                    $(e).find("#btn_status").attr("style","");
                    $(e).find('#btn_status').css({
                        'border-color':'rgb(223, 223, 223)',
                        'box-shadow':'rgb(223, 223, 223) 0px 0px 0px 0px inset',
                        'background-color':'rgb(223, 223, 223);'
                    })
                }
            })
        })
    }

    //根据页面调整布局
    var fix_screen = function (w) {
        var header_height=$('.header').outerHeight(true);
        var bottom_height=$('.room-set-bottom').outerHeight(true);
        var content_height = $('.room-set-content-style').outerHeight(true);
        var height = ToolBox.screen_height;
        if(height-header_height-bottom_height<content_height){
            $('.room-set-content-style').css('height',content_height+bottom_height-20);
        }
        $('.setting-style').css('left',''+w*0.07+'px');
        $('.text-status').css('left',''+w*0.07+'px');
    }

    //绑定事件
    var bind_events = function () {

        //点击编辑
        $('#main #edit').off('tap','#edit_room').on('tap','#edit_room',function (e) {
            e.stopPropagation();e.preventDefault();
            $('#edit_back').show();
            $('#edit_room').hide();
            $('#back').hide();
            $('#room_title').css('margin-left','40%');
        })

        //点击返回
        $('#main').off('tap','#edit_back').on('tap','#edit_back',function (e) {
            e.stopPropagation();e.preventDefault();
            $('#edit_back').hide();
            $('#edit_room').show();
            $('#back').show();
            $('#room_title').css('margin-left','35%');
        })

        //添加房间
        $('#main').off('tap','#add_room_list').on('tap','#add_room_list',function (e) {
            e.stopPropagation();e.preventDefault();
            $('#add_room_list_modal').modal('show').css({
                width:ToolBox.screen_width*0.8,
                height:ToolBox.screen_height*0.4,
                'margin-left':function () {
                    return ToolBox.screen_width*0.1
                },
                'margin-top':function () {
                    return ToolBox.screen_height*0.3
                }
            })
        })

        //删除房间
        $('#main').off('tap','#remove').on('tap','#remove',function (e) {
            e.stopPropagation();e.preventDefault();
            $('#remove_room_list_modal').modal('show').css({
                width:ToolBox.screen_width*0.8,
                height:ToolBox.screen_height*0.4,
                'margin-left':function () {
                    return ToolBox.screen_width*0.1
                },
                'margin-top':function () {
                    return ToolBox.screen_height*0.3
                }
            })
        })

        //当前数据项状态
        var cur_status=-1;
        //当前设备id
        var cur_device_id=0;
        //当前数据项id
        var cur_item_id=0;
        //当前设置状态的val
        var cur_set_val=-1;
        var cur_set_d_id = '';//当前设置的d_id

        //改变状态
        $('#main').off('tap','.switch').on('tap','.switch',function (e) {
            e.stopPropagation();e.preventDefault();
            cur_set_d_id = $(this).find('span').attr('d_id');
            cur_status=$(this).find('span').attr('status');
            cur_set_val=$(this).find('span').attr('setVal');
            cur_device_id=$(this).find('span').attr('devid');
            cur_item_id=$(this).find('span').attr('itemid');
            var name=$(this).find('span').attr('name');
            $('#edit_power_modal').modal('show').css({
                width:ToolBox.screen_width*0.8,
                height:ToolBox.screen_height*0.4,
                'margin-left':function () {
                    return ToolBox.screen_width*0.1
                },
                'margin-top':function () {
                    return ToolBox.screen_height*0.3
                }
            })
            $('#changeRoomName').html(name);
        })

        //确定更改
        $('#main').off('tap','#editSubmit').on('tap','#editSubmit',function (e) {
            e.stopPropagation();e.preventDefault();
            $('#edit_power_modal').modal('hide');
            $('#loading').show();
            $('body').css('overflow','hidden');
            //获取控制结果
              var set_status=-1;
              set_status=(cur_set_val=='0'?'1':'0');
             $("body").attr("style","overflow:auto");
            sendControl(cur_device_id,cur_item_id,set_status,true,function (res) {
                  if(res=='success'){
                      setTimeout(function () {
                          $('#msg_control').html('控制成功');
                          $('#msg_control').addClass('margin-left-5');
                          setTimeout(function () {
                              $('#loading').hide();
                              var ele =$(".room-set-content-style").find("span[d_id='"+cur_set_d_id+"']");
                              changeBtn(ele);
                              $('#msg_control').removeClass('margin-left-5');
                              $('#msg_control').html('获取控制结果中...');
                          },1200);
                          $('body').css('overflow','auto');
                      },3800);
                  }
              })

        })

        //roomid
        var cur_room_id=-1;

        //更改房间名称
        $('#main').off('tap','.roomName').on('tap','.roomName',function (e) {
            e.stopPropagation();e.preventDefault();
            var room_name=Strformat($(this).find('span:nth-child(2)').html());
            cur_set_d_id = $(this).find('span:nth-child(2)').attr("d_id");
            cur_room_id=$(this).attr('roomid');
            $('#edit_room_name_modal').modal('show').css({
                width:ToolBox.screen_width*0.8,
                height:ToolBox.screen_height*0.4,
                'margin-left':function () {
                    return ToolBox.screen_width*0.1
                },
                'margin-top':function () {
                    return ToolBox.screen_height*0.3
                }
            })
            $('#edit_room_name_input').val(room_name);
        })
        //确定更改房间名称
        $('#main').off('tap','#room_name_submit').on('tap','#room_name_submit',function (e) {
            e.stopPropagation();e.preventDefault();
            $('#edit_room_name_modal').modal('hide');
            $('#loading').show();
            $('body').css('overflow','hidden');
           var v_name=$('#edit_room_name_input').val();
           editVdeviceName(cur_room_id,v_name,function (res) {
               if(res.data==1){
                   $('#msg_control').html('控制成功');
                   $('#msg_control').addClass('margin-left-5');
                   setTimeout(function () {
                       $('#loading').hide();
                       var $el = $(".room-set-content-style").find("span[d_id='"+cur_set_d_id+"']");
                       $el.text(v_name);
                       $('#msg_control').removeClass('margin-left-5');
                       $('#msg_control').html('获取控制结果中...');
                   },500);
                   $('body').css('overflow','auto');
               }
           })
        })

        //设置温度的devid
        var cur_temp_devid=0;
        //设置温度数据项的itemid
        var cur_temp_itemid=0;

        //更改温度
        $('#main').off('tap','.set_temp').on('tap','.set_temp',function (e) {
            e.stopPropagation();e.preventDefault();
            var set_temp=Strformat($(this).find('span:nth-child(2)').html());
            cur_temp_devid=$(this).attr('devid');
            cur_temp_itemid=$(this).attr('itemid');
            cur_set_d_id = $(this).attr("d_id");
            $('#edit_room_temp_modal').modal('show').css({
                width:ToolBox.screen_width*0.8,
                height:ToolBox.screen_height*0.4,
                'margin-left':function () {
                    return ToolBox.screen_width*0.1
                },
                'margin-top':function () {
                    return ToolBox.screen_height*0.3
                }
            })
            $('#edit_room_temp_input').val(set_temp.split('℃')[0]);
        })

        //确定更改温度
        $('#main').off('tap','#room_temp_submit').on('tap','#room_temp_submit',function (e) {
            e.stopPropagation();e.preventDefault();
            var set_temp_val=$('#edit_room_temp_input').val();
            if(isNumber(set_temp_val)){
                 $('#err_msg').html('');
                 $('#edit_room_temp_modal').modal('hide');
                 $('#loading').show();
                 $('body').css('overflow','hidden');
                sendControl(cur_temp_devid,cur_temp_itemid,parseInt(set_temp_val),true,function (res) {
                    if(res=='success'){
                       setTimeout(function () {
                           $('#msg_control').html('控制成功');
                           $('#msg_control').addClass('margin-left-5');
                           setTimeout(function () {
                               $('#loading').hide();
                               var $span =$(".room-set-content-style").find("span[d_id='"+cur_set_d_id+"']").find("span:nth-child(2)");
                               $span.text(set_temp_val+"℃");
                               $('#msg_control').removeClass('margin-left-5');
                               $('#msg_control').html('获取控制结果中...');
                           },1200);
                           $('body').css('overflow','auto');
                       },3800);
                    }
                })
            }else{
                $('#err_msg').html('请输入数字类型!');
            }
        })

    }

    //改变按钮状态
    var changeBtn = function (el) {
        if(el.hasClass("switch-on")){
            el.addClass("switch-off").removeClass("switch-on");
        }else if(el.hasClass("switch-off")){
            el.addClass("switch-on").removeClass("switch-off");
        }
        init_plugin();
        //改变body的overflow
        $("body").attr("style","overflow:auto");
    }

    //判断一个字符串是否为数字
    var isNumber=function (str) {
        // isNaN()函数 把空串 空格 以及NUll 按照0来处理 所以先去除
        if(str === "" || str ==null){
            return false;
        }
        if(!isNaN(str)){
            return true;
        }else{
            return false;
        }
    }

    //根据变量组id修改变量组名称
    var editVdeviceName=function (vid,vname,callback) {
        var obj={
            name:vname,
            id:vid
        }
        ToolBox.ajax({
            type:'post',
            url:'project/editVdevice',
            data:JSON.stringify({
                token:ToolBox.getCookie('token'),
                vdevice:obj
            }),
            dataType:'json',
            success:function (res) {
                if(res.status=='100'){
                    callback(res);
                }
            }
        })
    }
    
    //去除字符串中的回车
    var Strformat=function (str) {
        return $.trim(str.replace(/[\r\n]/g,""));
    }

    //根据deviceId itemid 下发
    var sendControl=function (devid,itemid,val,is_show,callback) {
        ToolBox.ajax({
            type:'put',
            url:'control?'+$.param({
                token:ToolBox.getCookie('token'),
                hash:'test',
                devid:devid,
                itemid:itemid,
                value:val
            }),
            data:{},
            dataType:'json',
            success:function (res) {
                 if(typeof res.data=='string'){
                     getControlResult(devid,itemid,val,res.data,is_show,callback);
                 }
            }
        })
    }
    //获取控制结果
    var getControlResult=function (devid,itemid,val,sign,is_show,callback) {
        var count=0;
        var timer=setInterval(function () {
            ToolBox.ajax({
                type:'get',
                url:'control/result',
                data:{
                    token:ToolBox.getCookie('token'),
                    hash:'test',
                    devid:devid,
                    itemid:itemid,
                    sign:sign
                },
                dataType:'json',
                success:function (res) {
                    switch(res.data){
                        case '0':
                            clearInterval(timer);
                            callback('success');
                            //控制成功
                            break;
                        case '3':
                            /*控制超时*/
                            clearInterval(timer);
                            callback('overtime');
                            if(is_show){
                                $('#msg_control').html('控制超时');
                                $('#msg_control').addClass('margin-left-5');
                                setTimeout(function () {
                                    $('#loading').hide();
                                    $('#msg_control').removeClass('margin-left-5');
                                    $('#msg_control').html('获取控制结果中...');
                                    $('body').css('overflow','auto');
                                },800);
                            }
                            break;
                    }
                    if(count > 30){
                        //控制结果不明
                        clearInterval(timer);
                        callback('unknown');
                        if(is_show){
                            $('#msg_control').html('控制结果不明');
                            $('#msg_control').addClass('margin-left-5');
                            setTimeout(function () {
                                $('#loading').hide();
                                $('#msg_control').removeClass('margin-left-5');
                                $('#msg_control').html('获取控制结果中...');
                                $('body').css('overflow','auto');
                            },800);
                        }
                    }
                    count++;

                }
            })
        },2000);
    }

    return {
        init:function () {
           set_room_frame();
           bind_events();
        }
    };

});