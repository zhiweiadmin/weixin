define([
    'toolbox',
    'scripts/modules/main/layout',
    'scripts/plugins/room_set',
    'scripts/plugins/settings',
], function(ToolBox, Layout,RoomSet,Settings){
     var list=[
         {
             code:0,
             itemid:'F014',
             name:'自动模式'
         },
         {
             code:1,
             itemid:'F015',
             name:'制冷模式',
         },
         {
             code:2,
             itemid:'F016',
             name:'制热模式',
         },
         {
             code:3,
             itemid:'F017',
             name:'通风模式'
         }
     ]
     //当前所有的数据项
     var cur_all_data=[];
     //当前开关机状态
     var cur_power=-1;
     //在家/离家
     var cur_home=-1,address='',weather='';
     //当前设定温度
     var cur_set_temperature=-1;
     //当前温度
     var cur_temperature=-1;
     //当前项目ID
     var cur_projectId=-1;
     //当前设置在家、离家的val
     var cur_set_home=-1;
     //当前设置开关机的val
     var cur_set_power=-1;
     //当前设置加的val
     var cur_add_set=-1;
     //当前设置减得val
     var cur_minus_set=-1;
     //当前所有项目列表
     var cur_all_projects=[];
     //当前带有层级的项目列表
     var cur_all_projects_cascade=[];
     //是否进行定时任务
     var flag=false;
     //开关机的设备Id
     var cur_power_deviceId=0;
     //开关机的itemId
     var cur_power_itemId=0;
     //是否重复请求天气接口  由于调用天气的接口每天调用有限制,所以要设置请求次数
     var is_req_weather = true;
     //首先选择项目
     var after_choice=function () {
       getProjectList(function (res) {
           var el='';
           var parent_array=[];
           cur_all_projects=[];
           _.each(res,function (v) {
               if(v.parentId==undefined){
                   var obj={
                       name:v.name,
                       id:v.id,
                   }
                   parent_array.push(obj);
               }else{
                   if(v.hasPermission!=undefined){
                       cur_all_projects.push({
                           name:v.name,
                           id:v.id
                       })
                   }
               }
            })
          var result=[];
          _.each(parent_array,function (p) {
             var nodes=[];
              _.each(res,function (q) {
                  if(q.parentId!=undefined&&q.hasPermission!=undefined){
                      if(q.parentId==p.id){
                          nodes.push({
                              name:q.name,
                              id:q.id,
                          })
                      }
                  }
              })
              result.push({
                  name:p.name,
                  id:p.id,
                  nodes:nodes
              })
          })
          var ttt=[];
          _.each(result,function (p) {
              if(p.nodes.length!=0){
                   ttt.push({
                       name:p.name,
                       id:p.id,
                       nodes:p.nodes
                   })
              }
          })

          cur_all_projects_cascade=ttt;
          if(ttt.length==1&&ttt[0].nodes.length==1){
              var projectId=ttt[0].nodes[0].id;
              cur_projectId=projectId;
              global_projectId=projectId;
              flag=true;
              layout_init();
              bindEvents();
              setTimeJob();
          }else{
              //获取当前用户的项目列表
              $('#main').html(Layout.before_choice());
              bindProjEvents();
              var screen_height=ToolBox.screen_height;
              var h1=$('.height1').outerHeight(true);
              var h2=$('.height2').outerHeight(true)
              var h3=$('.pro_list').outerHeight(true);
              if(h3<=screen_height-h1-h2){
                  $('.pro_list').css('height',screen_height-h1-h2);
              }else{
              }

              _.each(ttt,function (p) {
                  $('#projectList').append(Layout.simple_projectInfo(p));
              })

          }

          //有可能从项目列表返回到当前页
           //所以到当前页删除所有的定时任务
           if(timeJobId!=-1){
               clearInterval(timeJobId)
           }
           if(roomJobId!=-1){
               clearInterval(roomJobId);
           }
           if(locationJobId!=-1){
               clearInterval(locationJobId);
           }

      })
    }

    //选择项目页面事件
    var bindProjEvents=function () {
        //点击展开或者闭合
        $('#main').off('tap','.firstChild').on('tap','.firstChild',function (e) {
            var el=$(this).context.nextElementSibling;
            var in_flag=$(this).context.attributes[1].value;
            var img=$(this).find('.dropImage');
            if(in_flag=='true'){
                //当前已展开，需要闭合
                $(this).context.attributes[1].value ='false';
                $(el).css('display','none');
                $(img).attr("src","../assets/image/right.png");
            }else{
                //当前已闭合，需要展开
                $(this).context.attributes[1].value ='true';
                $(el).css('display','');
                $(img).attr("src","../assets/image/down.png");
            }
        })
        //点击查询
        $('#main').off('tap','#searchProj').on('tap','#searchProj',function (e) {
            e.stopPropagation();e.preventDefault();
            var searchVal=$('#myInput').val();
            var result=[];
            if(searchVal!=''&&searchVal!=null){
                result=getProjectsByName(searchVal);
            }else{
                result=cur_all_projects_cascade;
            }
            $('#projectList').html('');
            _.each(result,function (p) {
                if(searchVal==''){
                    $('#projectList').append(Layout.simple_projectInfo(p));
                }else{
                    $('#projectList').append(Layout.simple_projectInfo2(p));
                }
            })
        })
        //点击跳转
        $('#main').off('tap','.tab-second').on('tap','.tab-second',function (e) {
            var projectId=$(this).context.attributes[1].value;
            cur_projectId=projectId;
            global_projectId=projectId;
            flag=true;
            is_req_weather=true;
            layout_init();
            bindEvents();

        })
    }

    //根据查询的项目名称查询项目
    var getProjectsByName=function (proName) {
        var result=[];
        _.each(cur_all_projects,function (p) {
            if(p.name.indexOf(proName)!=-1){
                result.push(p);
            }
        })
        return result;
    }

    //获取用户项目列表
    var getProjectList=function (cb) {
        ToolBox.ajax({
            type:'get',
            url:'project/getProjectsList',
            data:{
                token:ToolBox.getCookie('token'),
                active:1
            },
            dataType:'json',
            success:function (res) {
                if(res&&res.status=='100'){
                    cb(res.data);
                }
            }
        })
    }

    /*frame*/
    var layout_init = function(){


        $('#main').html(Layout.basic_frame());

        //取消modal的遮罩
        $('body').find('div:last-child').removeClass('modal-backdrop').removeClass('in');
        if(is_req_weather){
            getLocation();
            setTimeout(function () {
                getCurrentDataByProject(cur_projectId,function (resp) {
                    var cur_data=resp.data;
                    cur_all_data=cur_data;
                    control_show(cur_data);
                    setTimeJob();
                    $('.bottom-menu').html(Layout.bottom_menu());
                    show_other_info();
                })
            },500);
        }else{
            getCurrentDataByProject(cur_projectId,function (resp) {
                var cur_data=resp.data;
                cur_all_data=cur_data;
                control_show(cur_data);
                setTimeJob();
                $('.bottom-menu').html(Layout.bottom_menu());
                show_other_info();
            })
        }

        if(is_req_weather){
            locationTimeJob();
            is_req_weather=false;
        }

    };


    var getLocation = function () {
        getProjectInfo(cur_projectId,function (res) {
            var long=res.data.longitude||'116.395645';
            var lat=res.data.latitude||'39.929985';
            var location=long+','+lat;
            $.ajax({
                type:'get',
                url:'https://free-api.heweather.com/s6/weather/now',
                data:{
                    location:location,
                    key:weather_key
                },
                dataType:'json',
                success:function (res) {
                    try{
                        address=res.HeWeather6[0].basic.location||'朝阳区';
                        weather=res.HeWeather6[0].now.cond_txt||'晴';
                    }catch (e) {
                        console.error('超过规定的请求次数')
                    }
                }
            })
        })
    }

    var locationTimeJob = function () {
        if(locationJobId!=-1){
            clearInterval(locationJobId);
        }
         locationJobId = setInterval(function () {
          getLocation();
        },locationJobFre);
    }


    //获取项目下挂载设备的实时数据
    var getCurrentDataByProject=function (projectId,cb) {
        ToolBox.ajax({
            type:'get',
            url:'project/getProjectCurrentItemData',
            data:{
                token:ToolBox.getCookie('token'),
                projectID:projectId
            },
            dataType:'json',
            success:function (res) {
                if(res&&res.status=='100'){
                    cb(res);
                }
            }
        })
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

    //获取变量组实时数据
    var getVdeviceCurData=function (vdeviceId,projectId,callback) {
        ToolBox.ajax({
            type:'get',
            url:'project/currentItemData',
            data:{
                token:ToolBox.getCookie('token'),
                vdeviceIds:vdeviceId,
                page:1,
                perPage:1000,
                projectId:projectId
            },
            async:false,
            dataType:'json',
            success:function (res) {
                callback(res.result);
            }
        })
    }

    //获取某个项目的基本信息
    var getProjectInfo=function (projectId,callback) {
        ToolBox.ajax({
            type:'get',
            url:'project/getProjectById',
            data:{
                token:ToolBox.getCookie('token'),
                projectId:projectId
            },
            dataType:'json',
            success:function (res) {
                if(res.status=='100'){
                    callback(res);
                }
            }
        })
    }

    //控制显示
    var control_show=function (data) {
        _.each(data,function (p) {
            if(p.itemname==Strformat(ToolBox.getConstant('Constant-System-Work-Mode'))){
                var mode=p.val;
                switch (parseInt(mode)){
                    case 0:
                        //自动
                        $('.content').html(Layout.auto_mode(address,weather));
                        break;
                    case 1:
                        //制冷
                        $('.content').html(Layout.cold_mode(address,weather));
                        break;
                    case 2:
                        //制热
                        $('.content').html(Layout.hot_mode(address,weather));
                        break;
                    case 3:
                        //通风
                        $('.content').html(Layout.wind_mode(address,weather));
                        break;
                    default:
                        //自动
                        $('.content').html(Layout.auto_mode(address,weather));
                        break;
                }
            }
        })
    }

    //显示其他信息
    var show_other_info=function () {
        require(['progress'],function () {
            _.each(cur_all_data,function (p) {
                if(p.itemname==Strformat(ToolBox.getConstant('Constant-Out-Temperature'))){
                    //室外温度
                    $('#out_temperature').html(p.val);
                }
                if(p.itemname==Strformat(ToolBox.getConstant('Constant-Out-Humidity'))){
                    //室外湿度
                    $('#out_humidity').html(p.val);
                }
                if(p.itemname==Strformat(ToolBox.getConstant('Constant-In-Temperature'))){
                    //室内温度
                    btn_fix_screen(ToolBox.screen_width,parseInt(p.val));
                    cur_temperature=p.val;
                }
                if(p.itemname==Strformat(ToolBox.getConstant('Constant-In-Humidity'))){
                    //室内湿度
                    $('#rh').html(p.val);
                }
                if(p.itemname==Strformat(ToolBox.getConstant('Constant-System-Setting-Temperature'))){
                    //设置的温度
                       cur_set_temperature=p.val;
                }
                if(p.itemname==Strformat(ToolBox.getConstant('Constant-In-PM25'))){
                    //PM25
                    $('#pm25').html(p.val);
                }
                if(p.itemname==Strformat(ToolBox.getConstant('Constant-In-VOC'))){
                    //VOC
                    var val=parseFloat(p.val);
                    $('#voc').html(val.toFixed(2));
                }
                if(p.itemname==Strformat(ToolBox.getConstant('Constant-In-CO2'))){
                    //CO2
                    $('#co2').html(p.val);
                }
                if(p.itemname==Strformat(ToolBox.getConstant('Constant-Alert-Show'))){
                    //故障显示
                    var show=parseInt(p.val);
                    if(show==0){
                       //正常
                        $('#show_alert').hide();
                    }else if(show==1){
                        //故障
                        $('#show_alert').show();
                    }
                }
                if(p.itemname==Strformat(ToolBox.getConstant('Constant-Out-Or-In-Home'))){
                    //在家
                    var home=parseInt(p.val);
                    cur_home=home;
                    if(home==0){
                        //在家
                       $('#homeIn').html('在家');
                       $('#home_pic').attr('src','../assets/image/homeOut.png');
                    }else if(home==1){
                      //离家
                        $('#homeIn').html('离家');
                        $('#home_pic').attr('src','../assets/image/homeIn.png');
                    }
                }
                if(p.itemname==Strformat(ToolBox.getConstant('Constant-System-Power'))){
                    //开机/关机
                    var power=parseInt(p.val);
                    cur_power=power;
                    if(power==0){
                        //关机
                        $('#powerStatus').html('关机');
                        $('#power_pic').attr('src','../assets/image/poweron.png');

                    }else if(power==1){
                        //开机
                        $('#powerStatus').html('开机');
                        $('#power_pic').attr('src','../assets/image/poweroff.png');
                    }
                }
                if(p.itemname==Strformat(ToolBox.getConstant('Constant-Config-Setting-HomeIn'))){
                  //当前设置在家离家的val
                    cur_set_home=parseInt(p.val);
                }
                if(p.itemname==Strformat(ToolBox.getConstant('Constant-Config-Setting-Power'))){
                    //设置在家离家的val
                    cur_set_power=parseInt(p.val);
                    cur_power_deviceId=p.devid;
                    cur_power_itemId=p.itemid;
                }
                if(p.itemname==Strformat(ToolBox.getConstant('Constant-Config-Setting-Temperature-Add'))){
                    //当前温度加的值
                    cur_add_set=parseInt(p.val);
                }
                if(p.itemname==Strformat(ToolBox.getConstant('Constant-Config-Setting-Temperature-Minus'))){
                    //当前温度减得值
                    cur_minus_set=parseInt(p.val);
                }
            })
        })
    }

    //去除字符串中的回车
    var Strformat=function (str) {
        return str.replace(/[\r\n]/g,"");
    }

    //获取设备的实时数据
    var getDeviceCurrentData=function (serailNumber,callback) {
        ToolBox.ajax({
            type:'get',
            url:'devicelist/paginationList',
            data:{
                token:ToolBox.getCookie('token'),
                page:1,
                perPage:100,
                serialNumber:serailNumber
            },
            dataType:'json',
            success:function (res) {
                if(res&&res.status=='100'){
                     getDevicedata(res.result.data[0].id,callback);
                }
            }
        })
    }

    //获取设备的实时数据
    var getDevicedata=function (deviceId,callback) {
           ToolBox.ajax({
               type:'get',
               url:'currentdata/pagination',
               data:{
                   token:ToolBox.getCookie('token'),
                   deviceId:deviceId,
                   page:1,
                   perPage:1000,
               },
               dataType:'json',
               success:function (res) {
                   if(res&&res.status=='100'){
                       callback(res);
                   }
               }
           })
    }

    //按钮按照屏幕适应
    var btn_fix_screen =function (w,t) {
        $('#minus_btn').css({
            'left':''+w*0.25+'px',
            'margin-top':''+w*0.5+'px'
        });
        $('#add_btn').css({
            'right':''+w*0.25+'px',
            'margin-top':''+w*0.5+'px'
        });
        //初始化温度控件
        $('.second.circle').circleProgress({
            value:0.65,
            temp:t,
            range:[0,50],
            size:w*0.65
        }).on('circle-animation-progress',function (event,progress) {
            $(this).find('>strong:nth-child(2)').html(parseInt( t * progress) + '<i>℃</i>');
            $(this).find('>strong:nth-child(3)').html(cur_set_temperature+'<i style="font-size: 12px">℃</i>');
        })
        var height=ToolBox.screen_height;
        $('.bottom-menu').css('height',''+height*0.1+'px');
    }

    //改变选择模式
    var change_mode = function (mode,callback) {
        $('.left-first').addClass('left-first-close');
        $('.left-second').addClass('left-second-close');
        $('.right-first').addClass('right-first-close');
        $('.right-second').addClass('right-second-close');
        setTimeout(function () {
            $('#menu_list').hide();
             change_cur_choice(mode,false,callback);
            $('.left-first').removeClass('left-first-close');
            $('.left-second').removeClass('left-second-close');
            $('.right-first').removeClass('right-first-close');
            $('.right-second').removeClass('right-second-close');
        },200);
    }

    //改变当前的选择项
    var change_cur_choice = function (mode,is_show,callback) {
           var auto,cold,hot,wind;
           _.each(cur_all_data,function (p) {
               if(p.itemname==Strformat(ToolBox.getConstant('Constant-Config-Setting-Auto'))){
                   //自动
                   auto=p;
               }
               if(p.itemname==Strformat(ToolBox.getConstant('Constant-Config-Setting-Cold'))){
                   //制冷
                   cold=p;
               }
               if(p.itemname==Strformat(ToolBox.getConstant('Constant-Config-Setting-Hot'))){
                   //制热
                   hot=p;
               }
               if(p.itemname==Strformat(ToolBox.getConstant('Constant-Config-Setting-Wind'))){
                   //通风
                   wind=p;
               }
           })
        switch (parseInt(mode)){
            case 0:
                //自动
                send_control(auto,1,is_show,callback);
                break;
            case 1:
                //制冷
                send_control(cold,1,is_show,callback);
                break;
            case 2:
                //制热
                send_control(hot,1,is_show,callback);
                break;
            case 3:
                //通风
                send_control(wind,1,is_show,callback);
                break;
            default:
                //自动
                send_control(auto,1,is_show,callback);
                break;
        }
    }

    //发送控制命令
    var send_control=function (item,val,is_show,callback) {
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
                if(typeof  res.data=='string'){
                     getControlResult(item.devid,item.itemid,res.data,val,is_show,callback);
                }
            }
        })
    }

    var getValByKey=function (key,callback) {
        _.each(cur_all_data,function (p) {
            if(p.itemname==Strformat(key)){
                callback(p);
            }
        })
    }
    
    //根据工作模式 返回item
    var getItemByMode=function (mode,callback) {
        _.each(cur_all_data,function (p) {
            switch (parseInt(mode)){
                case 0:
                    //自动模式
                    if(p.itemname==Strformat(ToolBox.getConstant('Constant-Config-Setting-Auto'))){
                        callback(p);
                    }
                    break;
                case 1:
                    if(p.itemname==Strformat(ToolBox.getConstant('Constant-Config-Setting-Cold'))){
                        callback(p);
                    }
                    //制冷
                    break;
                case 2:
                    if(p.itemname==Strformat(ToolBox.getConstant('Constant-Config-Setting-Hot'))){
                        //制热
                        callback(p);
                    }
                    //制热
                    break;
                case 3:
                    if(p.itemname==Strformat(ToolBox.getConstant('Constant-Config-Setting-Wind'))){
                        callback(p);
                    }
                    //通风
                    break;
                default:
                    if(p.itemname==Strformat(ToolBox.getConstant('Constant-Config-Setting-Auto'))){
                        callback(p);
                    }
                    //自动
                    break;
            }
        })
    }

    //获取控制结果
    var getControlResult = function (devid,itemid,sign,val,is_show,callback) {
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
                            //如果要显示
                            if(is_show){
                                $('#msg_control').html('控制超时');
                                $('#msg_control').addClass('margin-left-5');
                                setTimeout(function () {
                                    $('#loading').hide();
                                    layout_init();
                                    bindEvents();
                                    $('#msg_control').removeClass('margin-left-5');
                                    $('#msg_control').html('获取控制结果中...');
                                },800);
                            }
                            break;
                    }
                    if(count > 30){
                        //控制结果不明
                        clearInterval(timer);
                        callback('unknown');
                        //如果要显示
                        if(is_show){
                            $('#msg_control').html('控制结果不明');
                            $('#msg_control').addClass('margin-left-5');
                            setTimeout(function () {
                                $('#loading').hide();
                                layout_init();
                                bindEvents();
                                $('#msg_control').removeClass('margin-left-5');
                                $('#msg_control').html('获取控制结果中...');
                            },800);
                        }
                    }
                    count++;

                }
            })
        },2000);
    }

    //绑定事件
    var bindEvents = function () {
        //点击出现动画
        $('#main').off('tap','#cur_choice').on('tap','#cur_choice',function (e) {
            e.stopPropagation();e.preventDefault();
            var t_flag=$(this).attr("flag");
            if(t_flag=='true'){
                $(this).attr("flag","false");
                $('#cur_choice').hide();
                $('#menu_list').show();
            }
        })

        //点击＋
        $('#main').off('tap','#add_btn').on('tap','#add_btn',function (e) {
            e.stopPropagation();e.preventDefault();
            var $temp=$(e.currentTarget.parentNode);
            $temp.find('>strong:nth-child(3)').html('');
            if(cur_set_temperature<=49){
                var temp=parseInt(parseInt(cur_set_temperature)+1);
                $temp.find('>strong:nth-child(3)').html(parseInt(temp)+'<i style="font-size: 12px;">℃</i></span>');
            }
            else{
                $temp.find('>strong:nth-child(3)').html(parseInt(50)+'<i style="font-size: 12px;">℃</i></span>');
            }
            getValByKey(ToolBox.getConstant('Constant-Config-Setting-Temperature-Add'),function (item) {
                var setVal=0;
                if(cur_add_set==0){
                    setVal=1;
                }
                if(cur_add_set==1){
                    setVal=0;
                }
                send_control(item,parseInt(setVal),true,function (res) {
                    if(res=='success'){
                        layout_init();
                        bindEvents();
                        $('#msg_control').removeClass('margin-left-5');
                        $('#msg_control').html('获取控制结果中...');
                    }
                })
            })
        })

        //点击减号
        $('#main').off('tap','#minus_btn').on('tap','#minus_btn',function (e) {
            e.stopPropagation();e.preventDefault();
            var $temp=$(e.currentTarget.parentNode);
            $temp.find('>strong:nth-child(3)').html('');
            if(cur_set_temperature<=49){
                var temp=parseInt(parseInt(cur_set_temperature)-1);
                $temp.find('>strong:nth-child(3)').html(parseInt(temp)+'<i style="font-size: 12px;">℃</i></span>');
            }
            else{
                $temp.find('>strong:nth-child(3)').html(parseInt(50)+'<i style="font-size: 12px;">℃</i></span>');
            }

            getValByKey(ToolBox.getConstant('Constant-Config-Setting-Temperature-Minus'),function (item) {
                var setVal=0;
                if(cur_minus_set==0){
                    setVal=1;
                }
                if(cur_add_set==1){
                    setVal=0;
                }
                send_control(item,parseInt(setVal),true,function (res) {
                    if(res=='success'){
                        setTimeout(function () {
                            send_control(item,0,true,function (res) {
                                layout_init();
                                bindEvents();
                                $('#msg_control').removeClass('margin-left-5');
                                $('#msg_control').html('获取控制结果中...');
                            })
                        },1000);
                    }
                })
            })
        })

        //设置开关机
        $('#main').off('tap','#configPowerStatus').on('tap','#configPowerStatus',function (e) {
            e.stopPropagation();e.preventDefault();
            //0关机 1开机
            $('#changeHomeStatus').modal('show').css({
                width:ToolBox.screen_width*0.8,
                height:ToolBox.screen_height*0.4,
                'margin-left':function () {
                    return ToolBox.screen_width*0.1
                },
                'margin-top':function () {
                    return ToolBox.screen_height*0.3
                }
            })
            var text=(cur_power==1?'关机':'开机');
            $('#modal_msg').html('确定 '+text+' 吗?');

            //点击确定按钮
            $('#changeHomeStatus').off('tap','#power_confirm').on('tap','#power_confirm',function (e) {
                e.stopPropagation();e.preventDefault();
                $('#changeHomeStatus').modal('hide');
                $('#loading').show();
                getValByKey(ToolBox.getConstant('Constant-Config-Setting-Power'),function (item) {
                    var setVal=-1;
                    if(cur_set_power==0){
                        setVal=1;
                    }
                    if(cur_set_power==1){
                        setVal=0;
                    }
                     send_control(item,setVal,true,function (res) {
                        if(res=='success'){
                            $('#msg_control').html('控制成功');
                            $('#msg_control').addClass('margin-left-5');
                            setTimeout(function () {
                                $('#loading').hide();
                                layout_init();
                                bindEvents();
                                $('#msg_control').removeClass('margin-left-5');
                                $('#msg_control').html('获取控制结果中...');
                            },1000);
                        }
                     });
                 })
            })


        })

        //设置在家离家
        $('#main').off('tap','#configHomeIn').on('tap','#configHomeIn',function (e) {
            e.stopPropagation();e.preventDefault();
            $('#loading').show();
            getValByKey(ToolBox.getConstant('Constant-Config-Setting-HomeIn'),function (item) {
                var setVal=-1;
                if(cur_set_home==0){
                    setVal=1;
                }
                if(cur_set_home==1){
                    setVal=0;
                }
               send_control(item,setVal,true,function (res) {
                   if(res=='success'){
                       $('#msg_control').html('控制成功');
                       $('#msg_control').addClass('margin-left-5');
                       setTimeout(function () {
                           $('#loading').hide();
                           layout_init();
                           bindEvents();
                           $('#msg_control').removeClass('margin-left-5');
                           $('#msg_control').html('获取控制结果中...');
                       },800);

                   }
               })
            })
        })

        //点击设置模式
        $('#main').off('tap','.modeIndex').on('tap','.modeIndex',function (e) {
            e.stopPropagation();e.preventDefault();
            $('#menu_list').hide();
            $('#cur_choice').show();
            //设置的模式
            var mode = $(this).attr('index');

            getItemByMode(mode,function (item) {
                //置1
                send_control(item,1,true,function (res) {
                    if(res=='success'){
                        setTimeout(function () {
                            layout_init();
                            bindEvents();
                            $('#msg_control').html('获取控制结果中...');
                        },1000);
                    }
                })
            })
            //定时2s之后全部置为0
            var after_time = 5000;
            setTimeout(function () {
                _.each(list,function (p) {
                    getItemByMode(p.code,function (item) {
                        send_control(item,0,false,function (res) {
                        })
                    })
                })
            },after_time);
        })

        //房间设置
        $('#main').off('tap','#room_set').on('tap','#room_set',function (e) {
            e.stopPropagation();e.preventDefault();
             RoomSet.init();
        })

        //房间列表返回
        $('#main').off('tap','#back').on('tap','#back',function (e) {
            e.stopPropagation();e.preventDefault();
            is_req_weather = true;
            layout_init();
        })

        //高级
        $('#main').off('tap','#settings').on('tap','#settings',function (e) {
            e.stopPropagation();e.preventDefault();
            Settings.init(cur_power_deviceId,cur_power_itemId);
            $('body').css('background','#fff');
        })

        //高级返回
        $('#main').off('tap','#setting_back').on('tap','#setting_back',function (e) {
            e.stopPropagation();e.preventDefault();
            $('body').css('background','#d2d2d2');
            layout_init();
        })

    }

    //设置定时每1分钟刷新
    var setTimeJob=function () {
        //页面刷新 1分钟刷新
        if(flag){
            //清除主画面的定时任务
            if(timeJobId!=-1){
                //清除
                clearInterval(timeJobId);
            }
            //清除房间列表
            if(roomJobId!=-1){
                //清除
                clearInterval(roomJobId);
            }
            //开启
            timeJobId  = setInterval(function () {
                //只刷新页面
               //如果当前是非主页的刷新,则不需要刷新当前页
                if($("#cur_choice").is(":visible")){
                    layout_init();
                }
            },timeJobFre);
        }

    }

    return {
        start: function() {
            after_choice();
        }
        /*start:function () {
            layout_init();
            bindEvents();
        }*/
    };

});