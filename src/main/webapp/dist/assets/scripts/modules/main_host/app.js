define([
    'toolbox',
    'mobiscroll',
    'scripts/modules/main_host/layout',
    'scripts/plugins/room_set',
    'scripts/plugins/settings',
    'text!templates/main_host/layout.jst',
], function (ToolBox, MobiScroll, Layout, RoomSet, Settings, LayoutTemplate) {

    var template = _.template(LayoutTemplate);

    var list = [
        {
            code: 0,
            itemid: 'F014',
            name: '主机'
        },
        {
            code: 1,
            itemid: 'F015',
            name: '房控',
        },
        {
            code: 2,
            itemid: 'F016',
            name: '高级',
        }
    ]
    //当前所有的数据项
    var cur_all_data = [];
    //jiangzhiwei
    var devices = [];
    var temNum = "";
    //当前开关机状态
    var cur_power = -1;
    //在家/离家
    //var cur_home=-1,address='',weather='';
    var cur_home = -1, address = '', weather = '', temperature = '', humidity = '', wind = '', cond_code = '';//add by jiangzhiwei
    //当前设定温度
    var cur_set_temperature = -1;
    //当前温度
    var cur_temperature = -1;
    //当前项目ID
    var cur_projectId = -1;
    //当前设置在家、离家的val
    var cur_set_home = -1;
    //当前设置开关机的val
    var cur_set_power = -1;
    //当前设置加的val
    var cur_add_set = -1;
    //当前设置减得val
    var cur_minus_set = -1;
    //出水温度 jiangzhiwei
    var cur_out_temp;
    var cur_in_temp;
    var cur_sys_ext_temp;
    var run_status;
    var run_model;
    var deviceItems;//变量组数据
    var cur_item_data;//变量组实时数据
    //网关在线/离线
    var agent_condition = '';

    //当前所有项目列表
    var cur_all_projects = [];
    //当前带有层级的项目列表
    var cur_all_projects_cascade = [];
    //是否进行定时任务
    var flag = false;
    //开关机的设备Id
    var cur_power_deviceId = 0;
    //开关机的itemId
    var cur_power_itemId = 0;
    //是否重复请求天气接口  由于调用天气的接口每天调用有限制,所以要设置请求次数
    var is_req_weather = true;
    //首先选择项目
    var after_choice = function () {
        getProjectList(function (res) {
            var el = '';
            var parent_array = [];
            cur_all_projects = [];
            _.each(res, function (v) {
                if (v.parentId == undefined) {
                    var obj = {
                        name: v.name,
                        id: v.id,
                    }
                    parent_array.push(obj);
                } else {
                    if (v.hasPermission != undefined) {
                        cur_all_projects.push({
                            name: v.name,
                            id: v.id
                        })
                    }
                }
            })
            var result = [];
            _.each(parent_array, function (p) {
                var nodes = [];
                _.each(res, function (q) {
                    if (q.parentId != undefined && q.hasPermission != undefined) {
                        if (q.parentId == p.id) {
                            nodes.push({
                                name: q.name,
                                id: q.id,
                            })
                        }
                    }
                })
                result.push({
                    name: p.name,
                    id: p.id,
                    nodes: nodes
                })
            })
            var ttt = [];
            _.each(result, function (p) {
                if (p.nodes.length != 0) {
                    ttt.push({
                        name: p.name,
                        id: p.id,
                        nodes: p.nodes
                    })
                }
            })

            cur_all_projects_cascade = ttt;
            // if(ttt.length==1&&ttt[0].nodes.length==1){
            //     var projectId=ttt[0].nodes[0].id;
            //     cur_projectId=projectId;
            //     global_projectId=projectId;
            //     flag=true;
            //     layout_init();
            //     bindEvents();
            //     setTimeJob();
            // }else{
            //获取当前用户的项目列表
            $('#main').html(Layout.before_choice());
            bindProjEvents();
            var screen_height = ToolBox.screen_height;
            var h1 = $('.height1').outerHeight(true);
            var h2 = $('.height2').outerHeight(true)
            var h3 = $('.pro_list').outerHeight(true);
            if (h3 <= screen_height - h1 - h2) {
                $('.pro_list').css('height', screen_height - h1 - h2);
            } else {
            }
            _.each(ttt, function (p) {
                $('#projectList').append(Layout.simple_projectInfo(p));
            })
            // }
            //有可能从项目列表返回到当前页
            //所以到当前页删除所有的定时任务
            if (timeJobId != -1) {
                clearInterval(timeJobId)
            }
            if (roomJobId != -1) {
                clearInterval(roomJobId);
            }
            if (locationJobId != -1) {
                clearInterval(locationJobId);
            }
        })
    }

    //选择项目页面事件
    var bindProjEvents = function () {
        //点击展开或者闭合
        $('#main').off('tap', '.firstChild').on('tap', '.firstChild', function (e) {
            var el = $(this).context.nextElementSibling;
            var in_flag = $(this).context.attributes[1].value;
            var img = $(this).find('.dropImage');
            if (in_flag == 'true') {
                //当前已展开，需要闭合
                $(this).context.attributes[1].value = 'false';
                $(el).css('display', 'none');
                $(img).attr("src", "../assets/image/right.png");
            } else {
                //当前已闭合，需要展开
                $(this).context.attributes[1].value = 'true';
                $(el).css('display', '');
                $(img).attr("src", "../assets/image/down.png");
            }
        })
        //点击查询
        $('#main').off('tap', '#searchProj').on('tap', '#searchProj', function (e) {
            e.stopPropagation();
            e.preventDefault();
            var searchVal = $('#myInput').val();
            var result = [];
            if (searchVal != '' && searchVal != null) {
                result = getProjectsByName(searchVal);
            } else {
                result = cur_all_projects_cascade;
            }
            $('#projectList').html('');
            _.each(result, function (p) {
                if (searchVal == '') {
                    $('#projectList').append(Layout.simple_projectInfo(p));
                } else {
                    $('#projectList').append(Layout.simple_projectInfo2(p));
                }
            })
        })
        //点击跳转
        $('#main').off('tap', '.tab-second').on('tap', '.tab-second', function (e) {
            var projectId = $(this).context.attributes[1].value;
            cur_projectId = projectId;
            global_projectId = projectId;
            flag = true;
            is_req_weather = true;
            layout_init();
            bindEvents();
        })
    }

    //根据查询的项目名称查询项目
    var getProjectsByName = function (proName) {
        var result = [];
        _.each(cur_all_projects, function (p) {
            if (p.name.indexOf(proName) != -1) {
                result.push(p);
            }
        })
        return result;
    }

    //获取用户项目列表
    var getProjectList = function (cb) {
        ToolBox.ajax({
            type: 'get',
            url: 'project/getProjectsList',
            data: {
                token: ToolBox.getCookie('token'),
                active: 1
            },
            dataType: 'json',
            success: function (res) {
                if (res && res.status == '100') {
                    cb(res.data);
                }
            }
        })
    }

    /*frame*/
    var layout_init = function () {
        //取消modal的遮罩
        if (is_req_weather) {
            getLocation();
            getVdeviceItems(cur_projectId,function(res){
                var agents = res.data[0].dataItem[0].serialNumber;
                agentListCondition(agents,function(res1){
                    if(res1.status == 100){
                        agent_condition = res1.result.data[0].agentCondition;
                        run_status = agent_condition;
                    }
                })
            })
            setTimeout(function () {
                getCurrentDataByProject(cur_projectId, function (resp) {
                    var cur_data = resp.data;
                    cur_all_data = cur_data;
                    //显示主机

                    setTimeJob();
                    show_other_info();
                })
            }, 500);
        } else {
            getLocation();
            getVdeviceItems(cur_projectId,function(res){
                var agents = res.data[0].dataItem[0].serialNumber;
                agentListCondition(agents,function(res1){
                    if(res1.status == 100){
                        agent_condition = res1.result.data[0].agentCondition;
                        run_status = agent_condition;
                    }
                })
            })
            getCurrentDataByProject(cur_projectId, function (resp) {
                var cur_data = resp.data;
                cur_all_data = cur_data;
                setTimeJob();
                show_other_info();
            })

        }
        //取消日期刷新
        // if (is_req_weather) {
        //     locationTimeJob();
        //     is_req_weather = false;
        // }

    };

    //获取项目所在地的一些信息，包括天气温度等等
    var getLocation = function () {
        getProjectInfo(cur_projectId, function (res) {
            var long = res.data.longitude || '116.395645';
            var lat = res.data.latitude || '39.929985';
            var location = long + ',' + lat;
            $.ajax({
                type: 'get',
                url: 'https://free-api.heweather.com/s6/weather/now',
                data: {
                    location: location,
                    key: weather_key
                },
                dataType: 'json',
                success: function (res) {
                    try {
                        address = res.HeWeather6[0].basic.location || '朝阳区';
                        weather = res.HeWeather6[0].now.cond_txt || '晴';
                        // 需要温度、湿度、风向、天气4个信息
                        humidity = res.HeWeather6[0].now.hum;
                        temperature = res.HeWeather6[0].now.tmp;
                        wind = res.HeWeather6[0].now.wind_dir;
                        cond_code = res.HeWeather6[0].now.cond_code;
                        //需要根据天气提供页面图片
                        var air_img = getImgUrl(weather);
                        //初始化页面
                        $("#main").html(Layout.basic_frame(weather, humidity, temperature, wind, air_img));
                        $(".content").html(Layout.host_mode());
                    } catch (e) {
                        console.error('超过规定的请求次数')
                    }
                }
            })
        })
    }

    //获取某个项目的变量组列表
    var getVdeviceItems = function (projectId, callback) {
        ToolBox.ajax({
            type: 'get',
            url: 'project/vdeviceDataItem',
            data: {
                token: ToolBox.getCookie('token'),
                projectId: projectId
            },
            dataType: 'json',
            success: function (res) {
                deviceItems = res;
                callback(res);
            }
        })
    }

    //获取网关状态信息
    var agentListCondition = function(agentIds,callback){
        ToolBox.ajax({
            type:'get',
            url:'agentList/pagination',
            data:{
                token:ToolBox.getCookie('token'),
                agentId:agentIds,
                page:1,
                perPage:999
            },
            async:false,
            dataType:'json',
            success:function (res) {
                callback(res);
            }
        })
    }

    //根绝设备id获取这个设备下面的数据
    function getVdeviceItemsVal(vId,fk) {
        var items;
        for (var i = 0; i < deviceItems.data.length; i++){
            var id = deviceItems.data[i].vdeviceId + '';
            if(id == vId){
                items = deviceItems.data[i].dataItem;
            }
        }
        var itemVal;
        _.each(items, function (p) {
            if (p.itemName.indexOf(fk) != -1) {
                var itemName = p.itemName;
                //遍历实时数据
                _.each(cur_item_data.data, function (k) {
                    if(k.itemname == itemName){
                        itemVal = k.val;
                    }
                })
            }
        })
        return itemVal;
    }

    function getVdeviceItemsName(vId,fk) {
        var items;
        for (var i = 0; i < deviceItems.data.length; i++){
            var id = deviceItems.data[i].vdeviceId + '';
            if(id == vId){
                items = deviceItems.data[i].dataItem;
            }
        }
        var itemName;
        _.each(items, function (p) {
            if (p.itemName.indexOf(fk) != -1) {
                itemName = p.itemName;
            }
        })
        return itemName;
    }

    function getVdeviceItemsInfo(vId,fk) {
        var items;
        var item;
        for (var i = 0; i < deviceItems.data.length; i++){
            var id = deviceItems.data[i].vdeviceId + '';
            if(id == vId){
                items = deviceItems.data[i].dataItem;
            }
        }
        var itemVal;
        _.each(items, function (p) {
            if (p.itemName.indexOf(fk) != -1) {
                var itemName = p.itemName;
                //遍历实时数据
                _.each(cur_item_data.data, function (k) {
                    if(k.itemname == itemName){
                        item = k;
                    }
                })
            }
        })
        return item;
    }


    //根据天气获取图片地址
    function getImgUrl(weather) {
        var air_img = '';
        if (weather === "晴") {
            air_img = "../assets/image/air/qing.png";
        } else if (weather === "多云") {
            air_img = "../assets/image/air/duoyun.png";
        } else if (weather === "大雪") {
            air_img = "../assets/image/air/daxue.png";
        } else if (weather === "局部多云") {
            air_img = "../assets/image/air/jubuduoyun.png";
        } else if (weather === "雷阵雨") {
            air_img = "../assets/image/air/leizhenyu.png";
        } else if (weather === "强雷雨") {
            air_img = "../assets/image/air/qiangleiyu.png";
        } else if (weather === "夜晚晴朗") {
            air_img = "../assets/image/air/yewanqinglang.png";
        } else if (weather === "阴") {
            air_img = "../assets/image/air/yin.png";
        } else if (weather === "雨夹雪") {
            air_img = "../assets/image/air/yujiaxue.png";
        } else if (weather === "阵雨") {
            air_img = "../assets/image/air/zhenyu.png";
        } else if (weather === "中雨" | weather === "小雨") {
            air_img = "../assets/image/air/zhongyu.png";
        } else {
            air_img = "../assets/image/air/qing.png";
        }
        return air_img;
    }

    var locationTimeJob = function () {
        if (locationJobId != -1) {
            clearInterval(locationJobId);
        }
        locationJobId = setInterval(function () {
            getLocation();
        }, locationJobFre);
    }


    //获取项目下挂载设备的实时数据
    var getCurrentDataByProject = function (projectId, cb) {
        ToolBox.ajax({
            type: 'get',
            url: 'project/getProjectCurrentItemData',
            data: {
                token: ToolBox.getCookie('token'),
                projectID: projectId
            },
            dataType: 'json',
            success: function (res) {
                if (res && res.status === '100') {
                    cur_item_data = res;
                    cb(res);
                }
            }
        })
    }


    //获取某个项目的基本信息，比如东经北纬数值
    var getProjectInfo = function (projectId, callback) {
        ToolBox.ajax({
            type: 'get',
            url: 'project/getProjectById',
            data: {
                token: ToolBox.getCookie('token'),
                projectId: projectId
            },
            dataType: 'json',
            success: function (res) {
                if (res.status === '100') {
                    callback(res);
                }
            }
        })
    }

    //显示其他信息
    var show_other_info = function () {
        require(['progress'], function () {
            _.each(cur_all_data, function (p) {
                //add by jiangzhiwei
                if(p.itemname == "Sys_OutTemp"){
                    cur_out_temp = p.val;
                    $('#outTemp').html(cur_out_temp);
                }
                if(p.itemname == "Sys_InTemp"){
                    cur_in_temp = p.val;
                    $('#inTemp').html(cur_in_temp);
                }
                if(p.itemname == "Sys_ExtTemp"){
                    cur_sys_ext_temp = p.val;
                    $('#extTemp').html(cur_sys_ext_temp);
                }
                if(p.itemname == "Sys_RunSet"){
                    cur_power = p.val;
                    if(cur_power == '0'){
                        $("#host_switch").attr("src", "../assets/image/img/switch_off_o.png");
                        $("#host_switch").removeClass("on");
                    }else if(cur_power == '1'){
                        $("#host_switch").attr("src", "../assets/image/img/switch_on_o.png");
                        $("#host_switch").addClass("on")
                    }
                }
                //
                if(run_status == 1){
                    $(".online_status").attr("src", "../assets/image/img/online.png");
                    $(this).addClass("online")
                }else{
                    $(".online_status").attr("src", "../assets/image/img/offline.png");
                    $(this).removeClass("online")
                }//
                if(p.itemname == "Sys_ModelSet"){
                    run_model = p.val;
                    //1是制热 0是制冷
                    if(run_model == 0){
                        $("#cold_model").addClass("color_cold_active");
                        $("#hot_model").removeClass("color_hot_active");
                    }else{
                        $("#hot_model").addClass("color_hot_active")
                        $("#cold_model").removeClass("color_cold_active")
                    }
                }
            })
        })
    }

    //去除字符串中的回车
    var Strformat = function (str) {
        return str.replace(/[\r\n]/g, "");
    }

    //获取设备的实时数据
    var getDeviceCurrentData = function (serailNumber, callback) {
        ToolBox.ajax({
            type: 'get',
            url: 'devicelist/paginationList',
            data: {
                token: ToolBox.getCookie('token'),
                page: 1,
                perPage: 100,
                serialNumber: serailNumber
            },
            dataType: 'json',
            success: function (res) {
                if (res && res.status == '100') {
                    getDevicedata(res.result.data[0].id, callback);
                }
            }
        })
    }

    //获取设备的实时数据
    var getDevicedata = function (deviceId, callback) {
        ToolBox.ajax({
            type: 'get',
            url: 'currentdata/pagination',
            data: {
                token: ToolBox.getCookie('token'),
                deviceId: deviceId,
                page: 1,
                perPage: 1000,
            },
            dataType: 'json',
            success: function (res) {
                if (res && res.status == '100') {
                    callback(res);
                }
            }
        })
    }

    //按钮按照屏幕适应
    var btn_fix_screen = function (w, t) {
        $('#minus_btn').css({
            'left': '' + w * 0.25 + 'px',
            'margin-top': '' + w * 0.5 + 'px'
        });
        $('#add_btn').css({
            'right': '' + w * 0.25 + 'px',
            'margin-top': '' + w * 0.5 + 'px'
        });
        //初始化温度控件
        $('.second.circle').circleProgress({
            value: 0.65,
            temp: t,
            range: [0, 50],
            size: w * 0.65
        }).on('circle-animation-progress', function (event, progress) {
            $(this).find('>strong:nth-child(2)').html(parseInt(t * progress) + '<i>℃</i>');
            $(this).find('>strong:nth-child(3)').html(cur_set_temperature + '<i style="font-size: 12px">℃</i>');
        })
        var height = ToolBox.screen_height;
        $('.bottom-menu').css('height', '' + height * 0.1 + 'px');
    }

    //改变选择模式
    var change_mode = function (mode,val,callback) {
        setTimeout(function () {
            change_cur_choice(mode,val, false, callback);
        }, 200);
    }

    //改变当前的选择项
    var change_cur_choice = function (mode,val,is_show, callback) {
        var m,r,e;
        _.each(cur_all_data, function (p) {
            if (p.itemname == "Sys_ModelStus") {
                //运行模式
                m = p;
            }else if(p.itemname == "Sys_RunStus"){
                //运行状态
                r = p;
            }else if(p.itemname == "Sys_ExtTemp"){
                //温度
                e = p;
            }
        })
        switch (parseInt(mode)) {
            case 0:
                //制冷
                send_control(m, 0, is_show, callback);
                break;
            case 1:
                //制热
                send_control(m, 1, is_show, callback);
                break;
            case 3:
                //开机
                send_control(r, 1, is_show, callback);
                break;
            case 4:
                //关机
                send_control(r, 0, is_show, callback);
                break;
            case 5:
                //温度+
                send_control(e, val, is_show, callback);
                break;
            case 6:
                //温度-
                send_control(e, val, is_show, callback);
                break;
        }
    }

    //发送控制命令
    var send_control = function (item, val, is_show, callback) {
        ToolBox.ajax({
            type: 'put',
            url: 'control?' + $.param({
                token: ToolBox.getCookie('token'),
                hash: 'test',
                devid: item.devid,
                itemid: item.itemid,
                value: val,
            }),
            data: {},
            dataType: 'json',
            success: function (res) {
                if (typeof res.data == 'string') {
                    getControlResult(item.devid, item.itemid, res.data, val, is_show, callback);
                }
            }
        })
    }

    var send_control_new = function (devid,itemid,val,is_show,callback) {
        ToolBox.ajax({
            type: 'put',
            url: 'control?' + $.param({
                token: ToolBox.getCookie('token'),
                hash: 'test',
                devid: devid,
                itemid: itemid,
                value: val,
            }),
            data: {},
            dataType: 'json',
            success: function (res) {
                if (typeof res.data == 'string') {
                    getControlResult(devid,itemid, res.data, val, is_show, callback);
                }
            }
        })
    }

    var getValByKey = function (key, callback) {
        _.each(cur_all_data, function (p) {
            if (p.itemname == Strformat(key)) {
                callback(p);
            }
        })
    }

    var unbindUser = function (callback) {
        ToolBox.ajax({
            type: 'post',
            url: 'weixin/unbindAccount',
            data: JSON.stringify({
                token: ToolBox.getCookie('token'),
                weixin_id: ToolBox.getCookie('openId'),
                //     weixin_id:100,
            }),
            dataType: 'json',
            success: function (res) {
                callback(res);
            }
        })
    }

    //根据工作模式 返回item
    var getItemByMode = function (mode, callback) {
        _.each(cur_all_data, function (p) {
            switch (parseInt(mode)) {
                case 0:
                    //自动模式
                    if (p.itemname == Strformat(ToolBox.getConstant('Constant-Config-Setting-Auto'))) {
                        callback(p);
                    }
                    break;
                case 1:
                    if (p.itemname == Strformat(ToolBox.getConstant('Constant-Config-Setting-Cold'))) {
                        callback(p);
                    }
                    //制冷
                    break;
                case 2:
                    if (p.itemname == Strformat(ToolBox.getConstant('Constant-Config-Setting-Hot'))) {
                        //制热
                        callback(p);
                    }
                    //制热
                    break;
                case 3:
                    if (p.itemname == Strformat(ToolBox.getConstant('Constant-Config-Setting-Wind'))) {
                        callback(p);
                    }
                    //通风
                    break;
                default:
                    if (p.itemname == Strformat(ToolBox.getConstant('Constant-Config-Setting-Auto'))) {
                        callback(p);
                    }
                    //自动
                    break;
            }
        })
    }

    //获取控制结果
    var getControlResult = function (devid, itemid, sign, val, is_show, callback) {
        var count = 0;
        var timer = setInterval(function () {
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
                success: function (res) {
                    switch (res.data) {
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
                            if (is_show) {
                                $('#msg_control').html('控制超时');
                                $('#msg_control').addClass('margin-left-5');
                                setTimeout(function () {
                                    $('#loading').hide();
                                    layout_init();
                                    bindEvents();
                                    $('#msg_control').removeClass('margin-left-5');
                                    $('#msg_control').html('获取控制结果中...');
                                }, 800);
                            }
                            break;
                    }
                    if (count > 15) {
                        //控制结果不明
                        clearInterval(timer);
                        callback('unknown');
                        //如果要显示
                        if (is_show) {
                            $('#msg_control').html('控制结果不明');
                            $('#msg_control').addClass('margin-left-5');
                            setTimeout(function () {
                                $('#loading').hide();
                                layout_init();
                                bindEvents();
                                $('#msg_control').removeClass('margin-left-5');
                                $('#msg_control').html('获取控制结果中...');
                            }, 800);
                        }
                    }
                    count++;

                }
            })
        }, 2000);
    }

    //绑定事件
    var bindEvents = function () {

        //点击出现动画
        $('#main').off('tap', '#cur_choice').on('tap', '#cur_choice', function (e) {
            e.stopPropagation();
            e.preventDefault();
            var t_flag = $(this).attr("flag");
            if (t_flag == 'true') {
                $(this).attr("flag", "false");
                $('#cur_choice').hide();
                $('#menu_list').show();
            }
        })

        //---------------------主机start-----------------------------------
        //点击主机内容区域发生改变
        $("#main").off('tap', "#host").on('tap', '#host', function (e) {
            //移除所有按钮的激活class，并激活当前按钮
            $("#control").removeClass("active")
            $("#senior").removeClass("active")
            $(this).addClass("active")
            $(".content").html(Layout.host_mode())
            //显示数据 jiangzhiwei 需要重新加载数据
            init_index_page();
        })

        //绑定在线状态切换事件
        $("#main").off('tap', ".online_status").on('tap', '.online_status', function (e) {
            if ($(this).hasClass("online")) {
                $(this).attr("src", "../assets/image/img/offline.png");
                $(this).removeClass("online")
            } else {
                $(this).attr("src", "../assets/image/img/online.png");
                $(this).addClass("online")
            }
        })

        //绑定设定温度的增减事件
        $("#main").off('tap', "#minus_temp").on('tap', '#minus_temp', function (e) {
            var temp = Number($("#temNum").html());
            $("#temNum").html(temp - 1);
        })

        $("#main").off('tap', "#add_temp").on('tap', '#add_temp', function (e) {
            var temp = Number($("#temNum").html());
            $("#temNum").html(temp + 1);
        })

        //设定模式的动态模式
        $("#main").off('tap', "#cold_model").on('tap', '#cold_model', function (e) {
            $(this).addClass("color_cold_active");
            $("#hot_model").removeClass("color_hot_active");
            change_mode(0,null,function (res) {
                console.log("请求成功")
            })
        })

        $("#main").off('tap', "#hot_model").on('tap', '#hot_model', function (e) {
            $(this).addClass("color_hot_active");
            $("#cold_model").removeClass("color_cold_active");
            change_mode(1,null,function (res) {
                if(res.status == '100'){
                    console.log("请求成功")
                }
            })
        })

        //主界面 开关机  jiangzhiwei
        $("#main").off('tap', "#host_switch").on('tap', '#host_switch', function (e) {
            var msg = '';
            if(cur_power == '0'){
                msg = '确定开机吗?'
            }else{
                msg = '确定关机吗?'
            }
            ToolBox.confirm_alert({
                $container: $('#others'),
                afterCallback: function () {
                    if ($("#host_switch").hasClass('on')) {
                        $("#host_switch").attr("src", "../assets/image/img/switch_off_o.png");
                        $("#host_switch").removeClass("on");

                        getValByKey("Sys_RunSet",function (item) {
                            send_control(item, 0, true, function (res) {
                                console.log(res);
                                if (res == 'success') {
                                    layout_init();
                                    bindEvents();
                                }else{
                                    alert("控制失败");
                                }
                            })
                        })
                    } else {
                        $("#host_switch").attr("src", "../assets/image/img/switch_on_o.png");
                        $("#host_switch").addClass("on")
                        getValByKey("Sys_RunSet",function (item) {
                            console.log(item);
                            send_control(item, 1, true, function (res) {
                                if (res == 'success') {
                                    $('#msg_control').html('控制成功');
                                    $('#msg_control').addClass('margin-left-5');
                                    setTimeout(function () {
                                        layout_init();
                                        bindEvents();
                                        init_index_page();
                                    }, 800);

                                }
                            })
                        })
                    }
                },
                msg: msg
            })

        })


        //--------------------主机end-----------------------------------


        //-------------------------房控start-----------------------------
        //点击房控内容区域发生改变
        $("#main").off('tap', "#control").on('tap', '#control', function (e) {
            //移除所有按钮的激活class，并激活当前按钮
            $("#host").removeClass("active")
            $("#senior").removeClass("active")
            $(this).addClass("active")
            //先清空content的内容，补充各个单独房间样式
            // $(".content").html(Layout.control_mode());
            $(".content").html("");
            //加載防控数据 jiangzhiwei
            //jiangzhiwei  获取变量组数据 当点击的时候再去加载数据
            if(devices.length == 0){
                getVdeviceItems(cur_projectId, function (res) {
                    if(res.status == 100){
                        var agents = res.data[0].dataItem[0].serialNumber;
                        agentListCondition(agents,function(res1){
                            if(res1.status == 100){
                                agent_condition = res1.result.data[0].agentCondition;
                                run_status = agent_condition;
                                console.log("网关")
                                console.log(agent_condition)
                            }
                        })
                    }


                    _.each(res.data,function (p,index) {
                        var a = new Set();
                        if(index > 0){
                            //获取最后一个统计项
                            var lastitem = p.dataItem[p.dataItem.length-1].itemName;
                            var firstWeizhi = lastitem.indexOf('_');
                            var lastWeizhi = lastitem.lastIndexOf('_');
                            var count = lastitem.substring(firstWeizhi+1,lastWeizhi);
                            var obj ={
                                name:p.vdeviceName,
                                vid:p.vdeviceId,
                                count:count,
                                room_img:getRoomImg(p.vdeviceName)
                            };
                            devices.push(obj);
                        }

                    })
                    init_room_list(devices);
                })
            }else{
                init_room_list(devices);
            }


        })

        //初始化房间列表页面  jiangzhiwei
        var init_room_list = function (data) {
            var array = data;
            $('.content').html("");
            for (var i = 0; i < array.length; i++) {
                $('.content').append(Layout.room_device(array[i].room_img, array[i].name, array[i].count,array[i].vid));
            }
        }

        //初始化首页
        var init_index_page = function () {
            $('#outTemp').html(cur_out_temp);
            $('#inTemp').html(cur_in_temp);
            $('#extTemp').html(cur_sys_ext_temp);
            if(run_status == 1){
                $(".online_status").attr("src", "../assets/image/img/online.png");
                $(".online_status").addClass("online")
            }else{
                $(".online_status").attr("src", "../assets/image/img/offline.png");
                $(".online_status").removeClass("online")
            }
            if(run_model == 0){
                $("#cold_model").addClass("color_cold_active")
                $("#cold_model").removeClass("color_hot_active")
            }else{
                $("#cold_model").addClass("color_hot_active")
                $("#cold_model").removeClass("color_cold_active")
            }
            if(cur_power == '0'){
                $("#host_switch").attr("src", "../assets/image/img/switch_off_o.png");
                $("#host_switch").removeClass("on");
            }else if(cur_power == '1'){
                $("#host_switch").attr("src", "../assets/image/img/switch_on_o.png");
                $("#host_switch").addClass("on")
            }
        }

        //根据房间名获取对应图片
        var getRoomImg = function (name) {
            switch (name) {
                case '客厅':
                    return '../assets/image/img/keting.png';
                case '主卧':
                    return '../assets/image/img/zhuwo.png';
                case '次卧':
                    return '../assets/image/img/ciwo.png';
                case '阁楼':
                    return '../assets/image/img/gelou.png';
                case '公卫':
                    return '../assets/image/img/gongwei.png';
                default:
                    return '../assets/image/img/keting.png';
            }
        }

        //点击房控方向键,显示房间内细节
        $("#main").off('tap', '.control_sub_right').on('tap', '.control_sub_right', function (e) {
            var air_img = getImgUrl(weather);
            //初始化页面
            $("#main").html(Layout.room_detail_basic(weather, humidity, temperature, wind, air_img));

            var height = $(window).height();
            //获取当前房间设备的个数
            var count = $(this).attr("count");
            var vdeviceId = $(this).attr("id");
            var name = $(this).attr("name");

            //根据个数来创建设备信息
            //i后期使用装置ID来替换
            for (var i = 1; i <= count; i++) {

                var deviceId = vdeviceId +"_"+i;
                //获取开关 统计项的值
                var item_onoff = i+'_OnOff';
                var onoff = getVdeviceItemsVal(vdeviceId,item_onoff);
                var itemname_onoff = getVdeviceItemsName(vdeviceId,item_onoff);

                //模式
                var item_model = i+'_Model';
                var modelType = getVdeviceItemsVal(vdeviceId,item_model);
                var itemname_model = getVdeviceItemsName(vdeviceId,item_model);

                //获取Fk_1 前缀
                var item_pre = itemname_model.substring(0,itemname_model.lastIndexOf('_'));

                //房控温度
                var ext_temp = i+'_ExtTemp';
                var extTemp = getVdeviceItemsVal(vdeviceId,ext_temp);
                var deviceName = name+"房控"+i;

                //暂且认为奇数为制热 35℃ 偶数为制冷  23℃
                var model = (modelType == '0') ? "制冷" : "制热";
                var modelImg = (modelType % 2 === 0) ? "fa-snowflake-o" : "fa-sun-o";
                var preClass = (modelType % 2 === 0) ? "cold" : "hot"
                var parent = preClass + "_parent";
                var child = preClass + "_child";
                var temp = 0;
                var wraId = "circle_step" + i;
                var temId = "temp" + i;
                //默认均为低速
                var speed="低速";
                $(".swiper-wrapper").append(Layout.room_detail_basic_device(wraId, temId, parent, child, model, modelImg, temp,deviceId,speed,deviceName,itemname_onoff,itemname_model,item_pre));
                var size = $(".parent").width() * 0.8;
                if (model === "制热") {
                    $('#' + wraId).circleProgress({
                        value: 0.65,
                        temp: temp,
                        range: [0, 50],
                        size: size,
                        lineCap: 'round',
                        thickness: 15,
                        fill: {
                            gradient: ["#2CCBF3", "#B40608"]
                        }
                    });
                } else {
                    $('#' + wraId).circleProgress({
                        value: 0.65,
                        temp: temp,
                        range: [0, 50],
                        size: size,
                        lineCap: 'round',
                        thickness: 15,
                        fill: {
                            gradient: ["#21BFFE", "#67F7B2"]
                        }
                    });
                }
            }
            $(".parent").css("height", height * 0.6);
            $(".child").css("padding-top", height * 0.6 * 0.2);
            $(".control_temp").css("margin-top", -(height * 0.6 * 0.4));
            if(onoff == '1'){
                $(".device_switch").addClass("on");
            }else{
                $(".device_switch").removeClass("on");
            }
            var swiper = new Swiper('.swiper-container');
        })

        //房控里面的切换 jiangzhiwei
        //装置开关
        $("#main").off('tap', ".device_switch").on('tap', '.device_switch', function (e) {
            var itemname=$(this).attr("itemname");
            var deviceId=$(this).attr("deviceId");
            var vId = deviceId.substring(0,deviceId.indexOf('_'));
            var item = getVdeviceItemsInfo(vId,itemname)
            var $dom=$(this);
            if($dom.hasClass("on")){
                //当前为开机状态，提供关机功能
                ToolBox.device_on({
                    $container: $('#others'),
                    afterCallback: function () {
                            $dom.removeClass("on");
                            $dom.siblings().removeClass("onColor");
                            $dom.siblings().addClass("offColor");
                            send_control(item.devid,item.itemid,0,false,function (res) {
                                console.log(res);
                            })

                    },
                    msg: ToolBox.getConstant('Constant-turn-down-msg')
                })

            }else{
                //当前为关机状态，提供开机功能
                ToolBox.device_on({
                    $container: $('#others'),
                    afterCallback: function () {
                        $dom.addClass("on")
                        $dom.siblings().addClass("onColor");
                        $dom.siblings().removeClass("offColor");
                        send_control_new(item.devid,item.itemid,1,false,function (res) {
                            if(res == "success"){
                                alert(res.msg);
                            }
                        })
                    },
                    msg: ToolBox.getConstant('Constant-turn-on-msg')
                })
            }
        })

        //装置模式
        $("#main").off('tap', ".device_model").on('tap', '.device_model', function (e) {
            var itemname=$(this).attr("itemname");
            var deviceId = $(this).attr("deviceId");
            var vId = deviceId.substring(0,deviceId.indexOf('_'));
            deviceId = deviceId.substring(deviceId.indexOf('_')+1,deviceId.length);
            var item = getVdeviceItemsInfo(vId,itemname);
            console.log("itemName模式切换"+itemname);
            var $dom=$(this);
            //当前为开机状态，提供关机功能
            ToolBox.device_model({
                $container: $('#others'),
                afterCallbackCold: function () {
                    //获取当前温度、id信息
                    var id = "#temp"+deviceId;
                    var temp=$(id).html().trim();
                    temp=temp.substring(0,temp.indexOf('℃'));
                    var model =  "制冷";
                    var modelImg =  "fa-snowflake-o" ;
                    var preClass = "cold";
                    var parent = preClass + "_parent";
                    var child = preClass + "_child";
                    var wraId = "circle_step" + deviceId;
                    var temId = "temp" + deviceId;
                    var speed=$dom.siblings(".onColor").html();
                    $("#swiper"+deviceId).html(Layout.room_detail_basic_device_model(wraId, temId, parent, child, model, modelImg, temp,deviceId,speed));
                    var size = $(".parent").width() * 0.8;
                    $('#' + wraId).circleProgress({
                        value: 0.65,
                        temp: temp,
                        range: [0, 50],
                        size: size,
                        lineCap: 'round',
                        thickness: 15,
                        fill: {
                            gradient: ["#21BFFE", "#67F7B2"]
                        }
                    });
                    var height = $(window).height();
                    $(".parent").css("height", height * 0.6);
                    $(".child").css("padding-top", height * 0.6 * 0.2);
                    $(".control_temp").css("margin-top", -(height * 0.6 * 0.4));

                    send_control_new(item.devid,item.itemid,0,false,function (res) {
                        if(res != "success"){
                            alert("控制失败");
                        }
                    })
                },
                afterCallbackHot: function () {
                    //获取当前温度、id信息
                    var id = "#temp"+deviceId;
                    var temp=$(id).html();
                    temp=temp.substring(0,temp.indexOf('℃'));
                    var model =  "制热";
                    var modelImg =  "fa-sun-o" ;
                    var preClass = "hot";
                    var parent = preClass + "_parent";
                    var child = preClass + "_child";
                    var wraId = "circle_step" + deviceId;
                    var temId = "temp" + deviceId;
                    var speed=$(".device_speed").siblings(".onColor").html();
                    $("#swiper"+deviceId).html(Layout.room_detail_basic_device_model(wraId, temId, parent, child, model, modelImg, temp,deviceId,speed));
                    var size = $(".parent").width() * 0.8;
                    $('#' + wraId).circleProgress({
                        value: 0.65,
                        temp: temp,
                        range: [0, 50],
                        size: size,
                        lineCap: 'round',
                        thickness: 15,
                        fill: {
                            gradient: ["#2CCBF3", "#B40608"]
                        }
                    });
                    var height = $(window).height();
                    $(".parent").css("height", height * 0.6);
                    $(".child").css("padding-top", height * 0.6 * 0.2);
                    $(".control_temp").css("margin-top", -(height * 0.6 * 0.4));

                    send_control_new(item.devid,item.itemid,0,false,function (res) {
                        if(res != "success"){
                            alert("控制失败");
                        }
                    })
                }
            })
        })

        //风速
        $("#main").off('tap', ".device_speed").on('tap', '.device_speed', function (e) {
            var deviceId=$(this).attr("deviceId");
            var vId = deviceId.substring(0,deviceId.indexOf('_'));
            var itemPre = $(this).attr("itemPre");
            var $dom=$(this);
            var speed=$dom.siblings(".onColor").html();
            //当前为开机状态，提供关机功能
            ToolBox.device_speed({
                $container: $('#others'),
                afterCallback: function (data) {
                    $dom.siblings(".onColor").html(data);
                    if(data == '低速'){
                        var itemname = itemPre+'_Lwinds';
                        var item = getVdeviceItemsInfo(vId,itemname);
                        console.log("item : "+item);
                        send_control_new(item.devid,item.itemid,1,false,function (res) {
                            if(res != "success"){
                                alert("控制失败");
                            }
                        });
                    }else if(data == '高速'){
                        itemname = itemPre+'_Hwinds';
                        var item = getVdeviceItemsInfo(vId,itemname);
                        console.log("item : "+item);
                        send_control_new(item.devid,item.itemid,1,false,function (res) {
                            if(res != "success"){
                                alert("控制失败");
                            }
                        });
                    }else if(data == '中速'){
                        itemname = itemPre+'_Mwinds';
                        var item = getVdeviceItemsInfo(vId,itemname);
                        console.log("item : "+item);
                        send_control_new(item.devid,item.itemid,1,false,function (res) {
                            if(res != "success"){
                                alert("控制失败");
                            }
                        });
                    }
                },
                flag:speed
            })
        })


        //点击房控内部返回按钮
        $("#main").off('tap', ".control_top_icon").on('tap', '.control_top_icon', function (e) {
            //需要根据天气提供页面图片
            var air_img = getImgUrl(weather);
            $("#main").html(Layout.basic_frame(weather, humidity, temperature, wind, air_img));
            //移除所有按钮的激活class，并激活当前按钮
            $("#host").removeClass("active")
            $("#control").removeClass("active")
            $("#senior").removeClass("active")
            $("#control").addClass("active")
            //先清空content的内容，补充各个单独房间样式
            // $(".content").html(Layout.control_mode());
            $(".content").html("");
            //加載防控数据 jiangzhiwei
            init_room_list(devices);
        })
        //-------------------------房控end-----------------------------

        //-----------------------高级start-----------------------------
        //点击高级内容区域发生改变
        $("#main").off('tap', "#senior").on('tap', '#senior', function (e) {
            //移除所有按钮的激活class，并激活当前按钮
            $("#host").removeClass("active")
            $("#control").removeClass("active")
            $(this).addClass("active")
            $(".content").html(Layout.senior_mode())
        })

        //获取项目列表
        $("#main").off('tap', '#project_list').on('tap', '#project_list', function (e) {
            after_choice();
        })

        //返回高级页面
        $('#main').off('tap', '#backBtn').on('tap', '#backBtn', function (e) {
            $("#host").removeClass("active")
            $("#control").removeClass("active")
            $("#senior").addClass("active")
            setTimeout(function () {
                $(".content").html(Layout.senior_mode())
            }, 100)
        })

        //返回权限设置页面
        $('#main').off('tap', '#backRoleBtn').on('tap', '#backRoleBtn', function (e) {
            setTimeout(function () {
                $(".content").html(Layout.role_setting_mode())
            }, 100)

        })

        //注销
        $("#main").off('tap', '#logout').on('tap', '#logout', function (e) {
            ToolBox.confirm_alert({
                $container: $('#others'),
                afterCallback: function () {
                    unbindUser(function (res) {
                        if (res.status === '100') {
                            ToolBox.setCookie('token', '', 1);
                            //清空定时任务
                            clearInterval(timeJobId);
                        }
                        require(['app'], function (App) {
                            App.start();
                            //设置背景图片
                            $("body").css("background-image", "url(../assets/image/img/login.png)");
                            $("body").css("background-size", 'cover');
                            $("body").css("background-attachment", 'fixed');
                            $("body").css("background-repeat", 'no-repeat');
                        })
                    })
                },
                msg: ToolBox.getConstant('Constant-Logout-User')
            })
        })

        //权限设置
        $("#main").off('tap', '.role_setting').on('tap', '.role_setting', function (e) {
            setTimeout(function () {
                $(".content").html(Layout.role_setting_mode())
            }, 300)
        })


        //用户权限
        $("#main").off('tap', '#user_role').on('tap', '#user_role', function (e) {
            if ($("#user_role i").hasClass("fa-angle-right")) {
                $("#user_role i").removeClass("fa-angle-right");
                $("#user_role i").addClass("fa-angle-down");
                $(".user_sub").removeClass("disNone")
            } else {
                $("#user_role i").removeClass("fa-angle-down");
                $("#user_role i").addClass("fa-angle-right");
                $(".user_sub").addClass("disNone")
            }
        })


        //项目权限
        $("#main").off('tap', '#project_role i').on('tap', '#project_role i', function (e) {
            if ($(this).hasClass("fa-angle-right")) {
                $(this).removeClass("fa-angle-right");
                $(this).addClass("fa-angle-down");
                $(".project_sub").removeClass("disNone")
            } else {
                $(this).removeClass("fa-angle-down");
                $(this).addClass("fa-angle-right");
                $(".project_sub").addClass("disNone")
            }
        })

        //定时开关
        $("#main").off('tap', '.time_control i').on('tap', '.time_control i', function (e) {
            $(".content").html(Layout.time_swtich());
        })


        //定时开关的switch
        $("#main").off('tap', '#time_switch').on('tap', '#time_switch', function (e) {
            if($(this).hasClass("on")){
                $(this).removeClass("on")
                $(this).attr("src", "../assets/image/img/switch_off_full.png");
            }else{
                $(this).addClass("on")
                $(this).attr("src", "../assets/image/img/switch_on_full.png");
            }
        })

        //权限控制的开关
        $("#main").off('tap', '#control_role_switch').on('tap', '#control_role_switch', function (e) {
            if($(this).hasClass("on")){
                $(this).removeClass("on")
                $(this).attr("src", "../assets/image/img/switch_off_full.png");
            }else{
                $(this).addClass("on")
                $(this).attr("src", "../assets/image/img/switch_on_full.png");
            }
        })


        //主机权限
        $("#main").off('tap', '#host_role_switch').on('tap', '#host_role_switch', function (e) {
            if($(this).hasClass("on")){
                $(this).removeClass("on")
                $(this).attr("src", "../assets/image/img/switch_off_full.png");
            }else{
                $(this).addClass("on")
                $(this).attr("src", "../assets/image/img/switch_on_full.png");
            }
        })

        //房控权限
        $("#main").off('tap', '#room_control_switch').on('tap', '#room_control_switch', function (e) {
            if($(this).hasClass("on")){
                $(this).removeClass("on")
                $(this).attr("src", "../assets/image/img/switch_off_full.png");
            }else{
                $(this).addClass("on")
                $(this).attr("src", "../assets/image/img/switch_on_full.png");
            }
        })


        $("#main").off('tap', '#open_time_t,#open_time_i').on('tap', '#open_time_t,#open_time_i', function (e) {
            $("#open_time_t,#open_time_i").mobiscroll().time({
                theme: 'mobiscroll',
                display: 'bottom',
                rows: 5,
                lang: 'zh',
                dateformat: 'HH:mm',
                setText: '确认',
                cancelText: '取消',
                onBeforeShow: function (event, inst) {
                },
                onSelect: function (textVale, inst) { //选中时触发事件
                    if($('#time_switch').hasClass("on")){
                        $("#open_time_t").html(textVale);
                        var startUpTime = textVale;
                        var val = 1;//1是开机
                        getValByKey("Sys_RunSet",function (item) {
                            var devid = item.devid;
                            var itemid = item.itemid;
                            $.ajax({
                                type:'get',
                                url:'/device/addDeviceJob',
                                data:{
                                    token:ToolBox.getCookie("token"),
                                    devid: devid,
                                    val:val,
                                    itemid:itemid,
                                    time:startUpTime
                                },
                                success:function (res) {
                                    console.log(res);
                                },
                                error:function (err) {
                                    console.error(err);
                                }
                            })
                        })
                    }
                }
            });
        })

        $("#main").off('tap', '#close_time_t,#close_time_i').on('tap', '#close_time_t,#close_time_i', function (e) {
            $("#close_time_t,#close_time_i").mobiscroll().time({
                theme: 'mobiscroll',
                display: 'bottom',
                rows: 5,
                lang: 'zh',
                dateformat: 'HH:mm',
                setText: '确认',
                cancelText: '取消',
                onBeforeShow: function (event, inst) {
                },
                onSelect: function (textVale, inst) { //选中时触发事件
                    $("#close_time_t").html(textVale);
                    if($('#time_switch').hasClass("on")){
                        var shutdownTime = textVale;
                        var val = 0;//0是关机
                        getValByKey("Sys_RunSet",function (item) {
                            var devid = item.devid;
                            var itemid = item.itemid;
                            $.ajax({
                                type:'get',
                                url:'/device/addDeviceJob',
                                data:{
                                    token:ToolBox.getCookie("token"),
                                    devid: devid,
                                    val:val,
                                    itemid:itemid,
                                    time:shutdownTime
                                },
                                success:function (res) {
                                    console.log(res);
                                },
                                error:function (err) {
                                    console.error(err);
                                }
                            })
                        })
                    }
                }
            });
        })

        //我要报修，重新绘制content元素
        $("#main").off('tap', '#need_repair').on('tap', '#need_repair', function (e) {
            $(".content").html(Layout.need_repair())
        })

        //-----------------------高级end-----------------------------

        //点击＋
        $('#main').off('tap', '#add_temp').on('tap', '#add_temp', function (e) {
            console.log("点击了+号");
            var setVal=1;
            change_mode(5,setVal,function (res) {
                if(res == 'success'){
                    cur_sys_ext_temp = parseInt(cur_sys_ext_temp) + 1;
                    $('#extTemp').html(cur_sys_ext_temp);
                }
            })
        })

        //点击减号
        $('#main').off('tap', '#minus_temp').on('tap', '#minus_temp', function (e) {
            console.log("点击了-号");
            var setVal=-1;
            change_mode(6,setVal,function (res) {
                if(res == 'success'){
                    cur_sys_ext_temp = parseInt(cur_sys_ext_temp) - 1;
                    $('#extTemp').html(cur_sys_ext_temp);
                }
            })
        })

        //设置开关机
        $('#main').off('tap', '#configPowerStatus').on('tap', '#configPowerStatus', function (e) {
            e.stopPropagation();
            e.preventDefault();
            //0关机 1开机
            $('#changeHomeStatus').modal('show').css({
                width: ToolBox.screen_width * 0.8,
                height: ToolBox.screen_height * 0.4,
                'margin-left': function () {
                    return ToolBox.screen_width * 0.1
                },
                'margin-top': function () {
                    return ToolBox.screen_height * 0.3
                }
            })
            var text = (cur_power == 1 ? '关机' : '开机');
            $('#modal_msg').html('确定 ' + text + ' 吗?');

            //点击确定按钮
            $('#changeHomeStatus').off('tap', '#power_confirm').on('tap', '#power_confirm', function (e) {
                e.stopPropagation();
                e.preventDefault();
                $('#changeHomeStatus').modal('hide');
                $('#loading').show();
                getValByKey(ToolBox.getConstant('Constant-Config-Setting-Power'), function (item) {
                    var setVal = -1;
                    if (cur_set_power == 0) {
                        setVal = 1;
                    }
                    if (cur_set_power == 1) {
                        setVal = 0;
                    }
                    send_control(item, setVal, true, function (res) {
                        if (res == 'success') {
                            $('#msg_control').html('控制成功');
                            $('#msg_control').addClass('margin-left-5');
                            setTimeout(function () {
                                $('#loading').hide();
                                layout_init();
                                bindEvents();
                                $('#msg_control').removeClass('margin-left-5');
                                $('#msg_control').html('获取控制结果中...');
                            }, 1000);
                        }
                    });
                })
            })


        })

        //设置在家离家
        $('#main').off('tap', '#configHomeIn').on('tap', '#configHomeIn', function (e) {
            e.stopPropagation();
            e.preventDefault();
            $('#loading').show();
            getValByKey(ToolBox.getConstant('Constant-Config-Setting-HomeIn'), function (item) {
                var setVal = -1;
                if (cur_set_home == 0) {
                    setVal = 1;
                }
                if (cur_set_home == 1) {
                    setVal = 0;
                }
                send_control(item, setVal, true, function (res) {
                    if (res == 'success') {
                        $('#msg_control').html('控制成功');
                        $('#msg_control').addClass('margin-left-5');
                        setTimeout(function () {
                            $('#loading').hide();
                            layout_init();
                            bindEvents();
                            $('#msg_control').removeClass('margin-left-5');
                            $('#msg_control').html('获取控制结果中...');
                        }, 800);

                    }
                })
            })
        })

        //点击设置模式
        $('#main').off('tap', '.modeIndex').on('tap', '.modeIndex', function (e) {
            e.stopPropagation();
            e.preventDefault();
            $('#menu_list').hide();
            $('#cur_choice').show();
            //设置的模式
            var mode = $(this).attr('index');

            getItemByMode(mode, function (item) {
                //置1
                send_control(item, 1, true, function (res) {
                    if (res == 'success') {
                        setTimeout(function () {
                            layout_init();
                            bindEvents();
                            $('#msg_control').html('获取控制结果中...');
                        }, 1000);
                    }
                })
            })
            //定时2s之后全部置为0
            var after_time = 5000;
            setTimeout(function () {
                _.each(list, function (p) {
                    getItemByMode(p.code, function (item) {
                        send_control(item, 0, false, function (res) {
                        })
                    })
                })
            }, after_time);
        })

        //房间设置
        $('#main').off('tap', '#room_set').on('tap', '#room_set', function (e) {
            e.stopPropagation();
            e.preventDefault();
            RoomSet.init();
        })

        //房间列表返回
        $('#main').off('tap', '#back').on('tap', '#back', function (e) {
            e.stopPropagation();
            e.preventDefault();
            is_req_weather = true;
            layout_init();
        })

        //高级
        $('#main').off('tap', '#settings').on('tap', '#settings', function (e) {
            e.stopPropagation();
            e.preventDefault();
            Settings.init(cur_power_deviceId, cur_power_itemId);
            $('body').css('background', '#fff');
        })

        //高级返回
        $('#main').off('tap', '#setting_back').on('tap', '#setting_back', function (e) {
            e.stopPropagation();
            e.preventDefault();
            $('body').css('background', '#d2d2d2');
            layout_init();
        })

    }


    //设置定时每1分钟刷新
    var setTimeJob = function () {
        //页面刷新 1分钟刷新
        if (flag) {
            //清除主画面的定时任务
            if (timeJobId != -1) {
                //清除
                clearInterval(timeJobId);
            }
            //清除房间列表
            if (roomJobId != -1) {
                //清除
                clearInterval(roomJobId);
            }
            //开启
            timeJobId = setInterval(function () {
                //只刷新页面
                //如果当前是非主页的刷新,则不需要刷新当前页
                console.log("要刷新页面了")
                if ($("#cur_choice").is(":visible")) {
                    layout_init();
                }
            }, timeJobFre);
        }

        //房间列表返回
        $('#main').off('tap', '#repair_submit').on('tap', '#repair_submit', function (e) {
            console.log("1111");
        })


    }

    return {
        start: function () {
            after_choice();
        }
        /*start:function () {
            layout_init();
            bindEvents();
        }*/
    };

});