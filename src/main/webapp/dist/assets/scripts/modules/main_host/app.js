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
    var cur_home = -1, address = '',city = '', weather = '', temperature = '', humidity = '', wind = '', cond_code = '';//add by jiangzhiwei
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
    var run_status = 0;
    var run_model = 0;
    var deviceItems;//变量组数据
    var cur_item_data;//变量组实时数据
    //网关在线/离线
    var agent_condition = '';

    var cur_room_id=-1;

    //当前所有项目列表
    var cur_all_projects = [];
    //当前带有层级的项目列表
    var cur_all_projects_cascade = [];
    //是否进行定时任务
    var flag = true;
    //开关机的设备Id
    var cur_power_deviceId = 0;
    //开关机的itemId
    var cur_power_itemId = 0;
    //是否重复请求天气接口  由于调用天气的接口每天调用有限制,所以要设置请求次数
    var is_req_weather = true;

    //定时温度设置任务
    var tempTimeJob;
    //溫度設置多少就value就是多少
    var setTemp = 0;//不再使用 设置的温度结果 如果+5度  -3度  那就是2度

    var tempTimeDeviceJob;

    //用户权限 默认0
    var projectHostAuth = 0;
    var projectFkAuth = 0;

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

    var getUserProjectInfo = function () {
        ToolBox.ajax({
            type: 'get',
            url: 'rolePermission/getPermission',
            data: {
                token: ToolBox.getCookie('token'),
                projectID: cur_projectId
            },
            success: function (res) {
                if (res.data.length > 0) {
                    var roleName = res.data[0].roleName;
                    var roleId = res.data[0].role_id;
                    ToolBox.setCookie('roleName', roleName, 1);
                    ToolBox.setCookie('roleId', roleId, 1);
                } else {
                    ToolBox.setCookie('roleId', 1, 1);
                }

            }
        });
    };

    /**
     *
     * 判断的时候首先要判断是不是普通用户 普通用户的roleId  =  2
     * roleId = 2 && anth = 1 才能点击事件
     *
     */
    var getUserProjectAuth = function (callback) {

        $.ajax({
            type: 'GET',
            url: '/auth/getProjectAuth',
            data: {
                projectId: cur_projectId
            },
            dataType: 'json',
            success: function (res) {
                projectHostAuth = res.hostAuth;
                projectFkAuth = res.fkAuth;
                callback(res);
            }
        });
    };

    /*frame*/
    var layout_init = function () {
        //清除之前的数据
        recoveyData();
        //取消modal的遮罩
        if (is_req_weather) {
            getLocation();
            getVdeviceItems(cur_projectId, function (res) {
                if (res.data.length > 0) {
                    var agents = res.data[0].dataItem[0].serialNumber;
                    agentListCondition(agents, function (res1) {
                        if (res1.status == "100") {
                            if (res1.result.data.length > 0) {
                                agent_condition = res1.result.data[0].agentCondition;
                                if (typeof (agent_condition) == "undefined" || agent_condition === null) {
                                    run_status = 0;
                                }else{
                                    run_status = agent_condition;
                                }
                            } else {
                                run_status = 0;
                            }

                        }
                    })
                }
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
            getVdeviceItems(cur_projectId, function (res) {
                var agents = res.data[0].dataItem[0].serialNumber;
                agentListCondition(agents, function (res1) {
                    if (res1.status == 100) {
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
        getUserProjectInfo();
        getUserProjectAuth(function (res) {
        });
    };

    var recoveyData = function () {
        cur_out_temp = null;
        cur_in_temp  = null;
        cur_sys_ext_temp  = null;
        run_status = 0;
        run_model = 0;
        deviceItems = null;//变量组数据
        cur_item_data = null;//变量组实时数据
        agent_condition = 0;
        devices = [];
    }

    var layout_init_refresh = function () {
        //getLocation(); 会重新跳转到首页
        getVdeviceItems(cur_projectId, function (res) {
            var agents = res.data[0].dataItem[0].serialNumber;
            agentListCondition(agents, function (res1) {
                if (res1.status == 100) {
                    agent_condition = res1.result.data[0].agentCondition;
                    run_status = agent_condition;
                }
            })
            devices = [];
            _.each(res.data, function (p, index) {
                if (index > 0) {
                    //获取最后一个统计项
                    var lastitem = p.dataItem[p.dataItem.length - 1].itemName;
                    var count = 0;
                    if (typeof (lastitem) != "undefined") {
                        var firstWeizhi = lastitem.indexOf('_');
                        var lastWeizhi = lastitem.lastIndexOf('_');
                        count = lastitem.substring(firstWeizhi + 1, lastWeizhi);
                    }
                    var obj = {
                        name: p.vdeviceName,
                        vid: p.vdeviceId,
                        count: count,
                        room_img: getRoomImg(p.vdeviceName)
                    };
                    devices.push(obj);
                }

            })
        })
        getCurrentDataByProject(cur_projectId, function (resp) {
            var cur_data = resp.data;
            cur_all_data = cur_data;
            setTimeJob();
            show_other_info();
        })
        getUserProjectInfo();
        getUserProjectAuth(function (res) {
        });
    }

    //根据房间名获取对应图片
    var getRoomImg = function (name) {
        switch (name) {
            case '客厅':
                return '../assets/image/img/keting.png';
            case '主卧':
                return '../assets/image/img/zhuwo.png';
            case '卧室':
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

    //获取项目所在地的一些信息，包括天气温度等等
    var getLocation = function () {
        getProjectInfo(cur_projectId, function (res) {
            var location = res.data.city;
            city = res.data.city || '北京';
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
                        address = res.HeWeather6[0].basic.location || city;
                        weather = res.HeWeather6[0].now.cond_txt || '晴';
                        // 需要温度、湿度、风向、天气4个信息
                        humidity = res.HeWeather6[0].now.hum;
                        temperature = res.HeWeather6[0].now.tmp;
                        wind = res.HeWeather6[0].now.wind_dir;
                        cond_code = res.HeWeather6[0].now.cond_code;
                        //需要根据天气提供页面图片
                        var air_img = getImgUrl(weather);
                        //初始化页面
                        $("#main").html(Layout.basic_frame(weather, humidity, temperature, wind, air_img,city));
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
    var agentListCondition = function (agentIds, callback) {
        ToolBox.ajax({
            type: 'get',
            url: 'agentList/pagination',
            data: {
                token: ToolBox.getCookie('token'),
                agentId: agentIds,
                page: 1,
                perPage: 999
            },
            async: false,
            dataType: 'json',
            success: function (res) {
                callback(res);
            }
        })
    }

    /**
     * @param i 序号，房间内指定序号的设备
     * @param roomId 房间号
     */
    function getSingleDeviceData(i, roomId) {
        var device = {};
        //首先根据房间号拿出该房间内所有的信息
        var deviceInfos;
        for (var j = 0; j < deviceItems.data.length; j++) {
            var id = deviceItems.data[j].vdeviceId + '';
            if (id == roomId) {
                deviceInfos = deviceItems.data[j].dataItem;
            }
        }
        //然后按需获取属性名及属性值
        var item_onoff = i + '_OnOff';
        var item_model = i + '_Model';
        var ext_temp = i + '_ExtTemp';
        //风速 低速 中速 高速
        var low = i + '_Lwinds';
        var mid = i + '_Mwinds';
        var high = i + '_Hwinds';
        _.each(deviceInfos, function (p) {
            //开关
            if (p.itemName.indexOf(item_onoff) != -1) {
                device.onoffName = p.itemName;
                //遍历实时数据
                device.onoffVal = getItemValueByName(device.onoffName);
            }
            //模式
            if (p.itemName.indexOf(item_model) != -1) {
                device.modelName = p.itemName;
                //遍历实时数据
                device.modelVal = getItemValueByName(device.modelName);
            }
            //温度
            if (p.itemName.indexOf(ext_temp) != -1) {
                device.tempName = p.itemName;
                //遍历实时数据
                device.tempVal = getItemValueByName(device.tempName);
            }
            //低速
            if (p.itemName.indexOf(low) != -1) {
                device.lowName = p.itemName;
                //遍历实时数据
                device.lowVal = getItemValueByName(device.lowName);
            }
            //中速
            if (p.itemName.indexOf(mid) != -1) {
                device.midName = p.itemName;
                //遍历实时数据
                device.midVal = getItemValueByName(device.midName);
            }
            //高速
            if (p.itemName.indexOf(high) != -1) {
                device.highName = p.itemName;
                //遍历实时数据
                device.highVal = getItemValueByName(device.highName);
            }
        })
        //获取当前速度
        device.speed = getSpeed(device);
        return device;
    }

    //获取当前速度
    function getSpeed(device) {
        var speed = '低速';
        if (Number(device.highVal) === 1) {
            speed = '高速';
        } else if (Number(device.midVal) === 1) {
            speed = '中速';
        } else {
            speed = '低速';
        }
        return speed;
    }

    //根据属性名获取对应的值
    function getItemValueByName(name) {
        var value;
        _.each(cur_item_data.data, function (k) {
            if (k.itemname == name) {
                // console.log("属性名为：" + name + ",数值位：" + k.val)
                value = k.val;
            }
        })
        return value;
    }

    function getVdeviceItemsInfo(vId, fk) {
        var items;
        var item;
        for (var i = 0; i < deviceItems.data.length; i++) {
            var id = deviceItems.data[i].vdeviceId + '';
            if (id == vId) {
                items = deviceItems.data[i].dataItem;
            }
        }
        var itemVal;
        _.each(items, function (p) {
            if (p.itemName.indexOf(fk) != -1) {
                var itemName = p.itemName;
                //遍历实时数据
                _.each(cur_item_data.data, function (k) {
                    if (k.itemname == itemName) {
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

    /**
     * 延迟2s刷新数据
     * @param projectId
     * @param cb
     */
    var refreshCurrentDataByProjectDelay = function (projectId, cb) {
        var job = setTimeout(function () {
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
        }, 5000);
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
                if (p.itemname == "Sys_OutTemp") {
                    cur_out_temp = p.val;
                    $('#outTemp').html(cur_out_temp);
                }
                if (p.itemname == "Sys_InTemp") {
                    cur_in_temp = p.val;
                    $('#inTemp').html(cur_in_temp);
                }
                if (p.itemname == "Sys_ExtTemp") {
                    cur_sys_ext_temp = p.val;
                    $('#extTemp').html(cur_sys_ext_temp);
                }
                if (p.itemname == "Sys_RunSet") {
                    cur_power = p.val;
                    if (cur_power == '0') {
                        $("#host_switch").attr("src", "../assets/image/img/switch_off_o.png");
                        $("#host_switch").removeClass("on");
                    } else if (cur_power == '1') {
                        $("#host_switch").attr("src", "../assets/image/img/switch_on_o.png");
                        $("#host_switch").addClass("on")
                    }
                }
                //
                if (run_status == 1) {
                    $(".online_status").attr("src", "../assets/image/img/online.png");
                    $(this).addClass("online")
                } else {
                    $(".online_status").attr("src", "../assets/image/img/offline.png");
                    $(this).removeClass("online")
                }//
                if (p.itemname == "Sys_ModelSet") {
                    run_model = p.val;
                    //1是制热 0是制冷
                    if (run_model == 0) {
                        $("#cold_model").addClass("color_cold_active");
                        $("#hot_model").removeClass("color_hot_active");
                    } else {
                        $("#hot_model").addClass("color_hot_active")
                        $("#cold_model").removeClass("color_cold_active")
                    }
                }
            })
        })
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

    //根据统计想名称获取数据 然后去设置温度
    var change_device_temp = function (itemname, val, callback) {
        if (tempTimeDeviceJob != 'undefined') {
            window.clearTimeout(tempTimeDeviceJob);
        }
        tempTimeDeviceJob = setTimeout(function () {
            console.log('当前设置的温度是:' + val);
            set_device_temp(itemname, val, callback);
        }, 4000)
    }

    var set_device_temp = function (itemname, val, callback) {
        getValByKey(itemname, function (item) {
            send_control(item, val, false, callback);
        })
    }

    //延迟执行任务 jiangzhiwei
    var change_mode_time = function (mode, val, callback) {
        if (tempTimeJob != 'undefined') {
            window.clearTimeout(tempTimeJob);
        }
        tempTimeJob = setTimeout(function () {
            var loading = layer.load(2, {shade: [0.5, '#fff']});
            change_mode(mode, val, callback);
            layer.close(loading);
        }, 2000);

    }

    //改变选择模式
    var change_mode = function (mode, val, callback) {
        setTimeout(function () {
            change_cur_choice(mode, val, false, callback);
        }, 200);
    }

    //改变当前的选择项
    var change_cur_choice = function (mode, val, is_show, callback) {
        var m, r, e;
        _.each(cur_all_data, function (p) {
            if (p.itemname == "Sys_ModelSet") {
                //运行模式
                m = p;
            } else if (p.itemname == "Sys_RunStus") {
                //运行状态
                r = p;
            } else if (p.itemname == "Sys_ExtTemp") {
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

    var send_control_new = function (devid, itemid, val, is_show, callback) {
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
                    getControlResult(devid, itemid, res.data, val, is_show, callback);
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
                    if (count > 8) {
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

        //初始化首页
        var init_index_page = function () {
            $('#outTemp').html(cur_out_temp);
            $('#inTemp').html(cur_in_temp);
            $('#extTemp').html(cur_sys_ext_temp);
            if (Number(run_status) === 1) {
                $(".online_status").attr("src", "../assets/image/img/online.png");
                $(".online_status").addClass("online")
            } else {
                $(".online_status").attr("src", "../assets/image/img/offline.png");
                $(".online_status").removeClass("online")
            }
            if (Number(run_model) === 0) {
                $("#cold_model").addClass("color_cold_active")
                $("#hot_model").removeClass("color_hot_active")
            } else {
                $("#hot_model").addClass("color_hot_active")
                $("#cold_model").removeClass("color_cold_active")
            }
            if (Number(cur_power) === 0) {
                $("#host_switch").attr("src", "../assets/image/img/switch_off_o.png");
                $("#host_switch").removeClass("on");
            } else if (cur_power == '1') {
                $("#host_switch").attr("src", "../assets/image/img/switch_on_o.png");
                $("#host_switch").addClass("on")
            }
        }


        //绑定在线状态切换事件
        // $("#main").off('tap', ".online_status").on('tap', '.online_status', function (e) {
        //     if ($(this).hasClass("online")) {
        //         $(this).attr("src", "../assets/image/img/offline.png");
        //         $(this).removeClass("online")
        //     } else {
        //         $(this).attr("src", "../assets/image/img/online.png");
        //         $(this).addClass("online")
        //     }
        // })

        //绑定设定温度的增减事件

        //点击＋
        $('#main').off('tap', '#add_temp').on('tap', '#add_temp', function (e) {
            //判断是否有权限
            getUserProjectAuth(function (res) {
                var roleId = ToolBox.getCookie("roleId");
                //作为普通用户没有主机权限
                if (Number(roleId) === 2 & Number(res.hostAuth) === 0) {
                    singleAlter("Constant-account-no-permission-msg")
                } else {
                    cur_sys_ext_temp = parseInt(cur_sys_ext_temp) + 1;
                    $('#extTemp').html(cur_sys_ext_temp);
                    change_mode_time(5, cur_sys_ext_temp, function (res) {
                        if (res != 'success') {
                            alert('控制失败!');
                            getValByKey('Sys_ExtTemp', function (res) {
                                $('#extTemp').html(res.val);
                            })
                        } else {
                            refreshCurrentDataByProjectDelay(cur_projectId, function () {
                                console.log("刷新成功");
                            })
                        }
                    })
                }
            });
        })

        //点击减号
        $('#main').off('tap', '#minus_temp').on('tap', '#minus_temp', function (e) {
            //判断是否有权限
            getUserProjectAuth(function (res) {
                var roleId = ToolBox.getCookie("roleId");
                //作为普通用户没有主机权限
                if (Number(roleId) === 2 & Number(res.hostAuth) === 0) {
                    singleAlter("Constant-account-no-permission-msg")
                } else {
                    cur_sys_ext_temp = parseInt(cur_sys_ext_temp) - 1;
                    $('#extTemp').html(cur_sys_ext_temp);
                    change_mode_time(6, cur_sys_ext_temp, function (res) {
                        if (res != 'success') {
                            alert('控制失败!');
                            getValByKey('Sys_ExtTemp', function (res) {
                                $('#extTemp').html(res.val);
                            })
                        } else {
                            refreshCurrentDataByProjectDelay(cur_projectId, function () {
                                console.log("刷新成功");
                            })
                        }
                    })
                }
            });
        })


        //设定模式的动态模式 开启制冷模式
        $("#main").off('tap', "#cold_model").on('tap', '#cold_model', function (e) {
            //判断是否有权限
            getUserProjectAuth(function (res) {
                var roleId = ToolBox.getCookie("roleId");
                //作为普通用户没有主机权限
                if (Number(roleId) === 2 & Number(res.hostAuth) === 0) {
                    singleAlter("Constant-account-no-permission-msg")
                } else {
                    //开启loading
                    var loading = layer.load(2, {shade: [0.5, '#fff']});
                    change_mode(0, null, function (res) {
                        //关闭loading
                        layer.close(loading);
                        if (res !== 'success') {
                            alert('控制模式失败!')
                            $("#hot_model").addClass("color_hot_active");
                            $("#cold_model").removeClass("color_cold_active");
                        } else {
                            $("#cold_model").addClass("color_cold_active");
                            $("#hot_model").removeClass("color_hot_active");
                            refreshCurrentDataByProjectDelay(cur_projectId, function () {
                                console.log("刷新成功");
                            })
                        }
                    })
                }
            });
        })

        //开机制热模式
        $("#main").off('tap', "#hot_model").on('tap', '#hot_model', function (e) {
            getUserProjectAuth(function (res) {
                var roleId = ToolBox.getCookie("roleId");
                //作为普通用户没有主机权限
                if (Number(roleId) === 2 & Number(res.hostAuth) === 0) {
                    singleAlter("Constant-account-no-permission-msg")
                } else {
                    //开启loading
                    var loading = layer.load(2, {shade: [0.5, '#fff']});
                    change_mode(1, null, function (res) {
                        //关闭loading
                        layer.close(loading);
                        if (res !== 'success') {
                            alert('控制模式失败!')
                            $('#hot_model').removeClass("color_hot_active");
                            $("#cold_model").addClass("color_cold_active");
                        } else {
                            $("#hot_model").addClass("color_hot_active");
                            $("#cold_model").removeClass("color_cold_active");
                            refreshCurrentDataByProjectDelay(cur_projectId, function () {
                                console.log("刷新成功");
                            })
                        }
                    })
                }
            });

        })

        //主界面 开关机  jiangzhiwei
        $("#main").off('tap', "#host_switch").on('tap', '#host_switch', function (e) {
            getUserProjectAuth(function (res) {
                var roleId = ToolBox.getCookie("roleId");
                //作为普通用户没有主机权限
                if (Number(roleId) === 2 & Number(res.hostAuth) === 0) {
                    singleAlter("Constant-account-no-permission-msg")
                } else {
                    var msg = '';
                    if (cur_power == '0') {
                        msg = '确定开机吗?'
                    } else {
                        msg = '确定关机吗?'
                    }
                    ToolBox.confirm_alert({
                        $container: $('#others'),
                        afterCallback: function () {
                            $('#confirm-alert').modal('hide');
                            //开启loading
                            var loading = layer.load(2, {shade: [0.5, '#fff']});
                            if ($("#host_switch").hasClass('on')) {
                                getValByKey("Sys_RunSet", function (item) {
                                    send_control(item, 0, true, function (res) {
                                        if (res == 'success') {
                                            $("#host_switch").attr("src", "../assets/image/img/switch_off_o.png");
                                            $("#host_switch").removeClass("on");
                                            layout_init();
                                            bindEvents();
                                        } else {
                                            alert("关机控制失败");
                                        }
                                        //关闭loading
                                        layer.close(loading);
                                    })
                                })
                            } else {
                                getValByKey("Sys_RunSet", function (item) {
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
                                            $("#host_switch").attr("src", "../assets/image/img/switch_on_o.png");
                                            $("#host_switch").addClass("on")
                                        } else {
                                            alert("开机控制失败");
                                        }
                                        //关闭loading
                                        layer.close(loading);
                                    })
                                })
                            }
                        },
                        msg: msg
                    })
                }
            });

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
            $(".content").html("");
            //加載房控数据 jiangzhiwei
            //jiangzhiwei  获取变量组数据 当点击的时候再去加载数据 devices：房控房间
            if (devices.length === 0) {
                getVdeviceItems(cur_projectId, function (res) {
                    if (res.status === 100) {
                        var agents = res.data[0].dataItem[0].serialNumber;
                        agentListCondition(agents, function (res1) {
                            if (res1.status === 100) {
                                agent_condition = res1.result.data[0].agentCondition;
                                run_status = agent_condition;
                            }
                        })
                    }
                    _.each(res.data, function (p, index) {
                        if (index > 0) {
                            //获取最后一个统计项
                            var lastitem = p.dataItem[p.dataItem.length - 1].itemName;
                            var count = 0;
                            if (typeof (lastitem) != "undefined") {
                                var firstWeizhi = lastitem.indexOf('_');
                                var lastWeizhi = lastitem.lastIndexOf('_');
                                count = lastitem.substring(firstWeizhi + 1, lastWeizhi);
                            }
                            var obj = {
                                name: p.vdeviceName,
                                vid: p.vdeviceId,
                                count: count,
                                room_img: getRoomImg(p.vdeviceName)
                            };
                            devices.push(obj);
                        }

                    })
                    init_room_list(devices);
                })
            } else {
                init_room_list(devices);
            }
        })

        //初始化房间列表页面  jiangzhiwei
        var init_room_list = function (data) {
            var array = data;
            $('.content').html("");
            for (var i = 0; i < array.length; i++) {
                $('.content').prepend(Layout.room_device(array[i].room_img, array[i].name, array[i].count, array[i].vid));
            }
        }

        //根据房间名获取对应图片
        var getRoomImg = function (name) {
            switch (name) {
                case '客厅':
                    return '../assets/image/img/keting.png';
                case '主卧':
                    return '../assets/image/img/zhuwo.png';
                case '卧室':
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
        $("#main").off('tap', '.controle_row .control_right_div').on('tap', '.controle_row .control_right_div', function (e) {
            //获取当前房间设备的个数
            var count = $(this).parent('.controle_row').attr("count");
            if (count == "0" || typeof (count) == "undefined") {
                return;
            }
            var air_img = getImgUrl(weather);
            $("#main").html(Layout.room_detail_basic(weather, humidity, temperature, wind, air_img,city));
            var height = $(window).height();

            //房间ID
            var roomId = $(this).parent('.controle_row').attr("id");
            var name = $(this).parent('.controle_row').attr("name");
            //根据个数来创建设备信息
            //i后期使用装置ID来替换
            for (var i = 1; i <= count; i++) {
                var deviceId = roomId + "_" + i;
                //获取当前房间内指定设备的开关状态、模式、风速
                var deviceObj = getSingleDeviceData(i, roomId);
                //获取Fk_1 前缀
                var item_pre = deviceObj.modelName.substring(0, deviceObj.modelName.lastIndexOf('_'));
                var model = (Number(deviceObj.modelVal) === 0) ? "制冷" : "制热";
                var modelImg = (Number(deviceObj.modelVal) === 0) ? "fa-snowflake-o" : "fa-sun-o";
                var preClass = (Number(deviceObj.modelVal) === 0) ? "cold" : "hot"
                var parent = preClass + "_parent";
                var child = preClass + "_child";
                var circleId = "child" + deviceId;
                //默认均为低速
                var speed = deviceObj.speed;
                $(".swiper-wrapper").append(Layout.room_detail_basic_device(parent, child, model, modelImg, deviceObj.tempVal, deviceId, speed, name + i, deviceObj.tempName, deviceObj.onoffName, deviceObj.modelName, item_pre));
                var size = $(".parent").width() * 0.8;
                if (model === "制热") {
                    $('#' + circleId).circleProgress({
                        value: 0.65,
                        temp: deviceObj.tempVal,
                        range: [0, 50],
                        size: size,
                        lineCap: 'round',
                        thickness: 15,
                        fill: {
                            gradient: ["#2CCBF3", "#B40608"]
                        }
                    });
                } else {
                    $('#' + circleId).circleProgress({
                        value: 0.65,
                        temp: deviceObj.tempVal,
                        range: [0, 50],
                        size: size,
                        lineCap: 'round',
                        thickness: 15,
                        fill: {
                            gradient: ["#21BFFE", "#67F7B2"]
                        }
                    });
                }
                //针对开关机进行房控细节梳理
                if (Number(deviceObj.onoffVal) === 0) {
                    renderClose(deviceId);
                } else {
                    renderOpen(deviceId);
                }
                $(".parent").css("height", height * 0.6);
                $(".child").css("padding-top", height * 0.6 * 0.2);
                $(".control_temp").css("margin-top", -(height * 0.6 * 0.4));
                var swiper = new Swiper('.swiper-container');
            }

        })

        $("#main").off('tap', '.main_room').on('tap', '.main_room', function (e) {
            e.stopPropagation();e.preventDefault();
            var room_name = $(this).html();
            cur_room_id = Number($(this).parent('.col-xs-7').parent('.controle_row').attr('id'));
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
            //开启loading
            var loading = layer.load(2, {shade: [0.5, '#fff']});
            $('body').css('overflow','hidden');
            var v_name=$('#edit_room_name_input').val();
            editVdeviceName(cur_room_id,v_name,function (res) {
                //关闭loading
                layer.close(loading);
                if(res.status=="100"){
                    var $el = $(".content_body").find("div[id='"+cur_room_id+"']").find(".main_room");
                    $el.text(v_name);
                    getVdeviceItems(cur_projectId,function (res) {
                        //重新去加载数据
                        devices = [];
                    });
                }else{
                    alert("控制失败")
                }
            })
        })

        //开机状态页面渲染
        function renderOpen(deviceId) {
            //首先下发菜单字体颜色
            $(".icon" + deviceId).addClass("onColor");
            $("#switch" + deviceId).addClass("on")
            $("#parent" + deviceId).removeClass("close_parent")
            var temp = $("#temp" + deviceId).html().trim();
            var tempture = Number(temp.substring(0, temp.indexOf('℃')));
            if ($('#child' + deviceId).hasClass("cold_child")) {
                $('#child' + deviceId).circleProgress({
                    temp: tempture,
                    fill: {
                        gradient: ["#21BFFE", "#67F7B2"]
                    }
                });
            } else {
                $('#child' + deviceId).circleProgress({
                    temp: tempture,
                    fill: {
                        gradient: ["#2CCBF3", "#B40608"]
                    }
                });
            }
        }

        //关机状态页面渲染
        function renderClose(deviceId) {
            //首先下发菜单字体颜色
            $(".icon" + deviceId).removeClass("onColor");
            $("#switch" + deviceId).removeClass("on")
            $("#parent" + deviceId).addClass("close_parent")
            $('#child' + deviceId).circleProgress({
                temp: 50,
                fill: {
                    gradient: ["#BEC1C6", "#878A8F"]
                }
            });
        }

        //房控里面的切换 jiangzhiwei
        //装置开关
        $("#main").off('tap', ".device_switch").on('tap', '.device_switch', function (e) {
            var itemname = $(this).attr("itemname");
            var deviceId = $(this).attr("deviceId");
            var vId = deviceId.substring(0, deviceId.indexOf('_'));
            var item = getVdeviceItemsInfo(vId, itemname)
            var $dom = $(this);
            //判断是否有权限
            getUserProjectAuth(function (res) {
                var roleId = ToolBox.getCookie("roleId");
                //作为普通用户没有主机权限
                if (Number(roleId) === 2 & Number(res.fkAuth) === 0) {
                    singleAlter("Constant-account-no-permission-msg")
                } else {
                    if ($dom.hasClass("on")) {
                        //当前为开机状态，提供关机功能
                        ToolBox.device_on({
                            $container: $('#others'),
                            afterCallback: function () {
                                //开启loading
                                $('#confirm-alert').modal('hide');
                                var loading = layer.load(2, {shade: [0.5, '#fff']});
                                send_control_new(item.devid, item.itemid, 0, false, function (res) {
                                    renderClose(deviceId);
                                    //关闭loading
                                    layer.close(loading);
                                    //刷新数据
                                    refreshCurrentDataByProjectDelay(cur_projectId, function () {
                                        console.log("刷新数据成功")
                                    });
                                    // if (res.status != "100") {
                                    //     alert("控制失败");
                                    // }else{
                                    //     console.log(deviceId)
                                    //     renderClose(deviceId);
                                    //     //刷新数据
                                    //     getCurrentDataByProject(cur_projectId,function () {
                                    //         console.log("刷新数据成功")
                                    //     });
                                    // }
                                })
                            },
                            msg: ToolBox.getConstant('Constant-turn-down-msg')
                        })

                    } else {
                        //当前为关机状态，提供开机功能
                        ToolBox.device_on({
                            $container: $('#others'),
                            afterCallback: function () {
                                //开启loading
                                $('#confirm-alert').modal('hide');
                                var loading = layer.load(2, {shade: [0.5, '#fff']});
                                send_control_new(item.devid, item.itemid, 1, false, function (res) {
                                    renderOpen(deviceId);
                                    //关闭loading
                                    layer.close(loading);
                                    //刷新数据
                                    refreshCurrentDataByProjectDelay(cur_projectId, function () {
                                        console.log("刷新数据成功")
                                    });

                                    // if (res.status != "100") {
                                    //     alert("控制失败");
                                    // }else{
                                    //     renderOpen(deviceId);
                                    //     //刷新数据
                                    //     getCurrentDataByProject(cur_projectId,function () {
                                    //         console.log("刷新数据成功")
                                    //     });
                                    // }
                                })
                            },
                            msg: ToolBox.getConstant('Constant-turn-on-msg')
                        })
                    }
                }
            });
        })
        //温度减
        $("#main").off('tap', ".device_minus").on('tap', '.device_minus', function (e) {
            //开机状态
            var deviceId = $(this).attr("deviceId");
            //判断是否有权限
            getUserProjectAuth(function (res) {
                var roleId = ToolBox.getCookie("roleId");
                //作为普通用户没有主机权限
                if (Number(roleId) === 2 & Number(res.fkAuth) === 0) {
                    singleAlter("Constant-account-no-permission-msg")
                } else {
                    if ($("#switch" + deviceId).hasClass("on")) {
                        //开机状态
                        var id = "#temp" + deviceId;
                        var temp = $(id).html().trim();
                        var tempNum = Number(temp.substring(0, temp.indexOf('℃')));
                        tempNum = tempNum - 1;
                        //重新设置页面的温度和环形
                        $(id).html(tempNum + '℃');
                        var wraId = "circle_step" + deviceId;
                        $('#' + wraId).circleProgress({
                            temp: tempNum
                        });
                        //延迟5s进行操作
                        console.log("装置：" + deviceId + ",当前温度为：" + temp + "执行减操作")
                        var itemname = $(id).attr("itemname");
                        change_device_temp(itemname, tempNum, function () {
                            console.log('已经执行完操作了');
                            refreshCurrentDataByProjectDelay(cur_projectId, function () {
                                console.log("刷新数据成功")
                            });
                        })
                    } else {
                        singleAlter("Constant-warn-close-msg")
                        // alert("已关机，请开机后操作")
                    }
                }
            });

        })
        //温度加
        $("#main").off('tap', ".device_plus").on('tap', '.device_plus', function (e) {
            var deviceId = $(this).attr("deviceId");
            //判断是否有权限
            getUserProjectAuth(function (res) {
                var roleId = ToolBox.getCookie("roleId");
                //作为普通用户没有主机权限
                if (Number(roleId) === 2 & Number(res.fkAuth) === 0) {
                    singleAlter("Constant-account-no-permission-msg")
                } else {
                    if ($("#switch" + deviceId).hasClass("on")) {
                        var id = "#temp" + deviceId;
                        var temp = $(id).html().trim();
                        var tempNum = Number(temp.substring(0, temp.indexOf('℃')));
                        tempNum = tempNum + 1;
                        //重新设置页面的温度和环形
                        $(id).html(tempNum + '℃');
                        var wraId = "child" + deviceId;
                        $('#' + wraId).circleProgress({
                            temp: tempNum,
                        });
                        //延迟5s进行操作
                        console.log("装置：" + deviceId + ",当前温度为：" + temp + "执行加操作");
                        var itemname = $(id).attr("itemname");
                        change_device_temp(itemname, tempNum, function () {
                            console.log('已经执行完操作了')
                            refreshCurrentDataByProjectDelay(cur_projectId, function () {
                                console.log("刷新数据成功")
                            });
                        })
                    } else {
                        singleAlter("Constant-warn-close-msg");
                        // alert("已关机，请开机后操作")
                    }
                }
            });

        })
        //装置模式
        $("#main").off('tap', ". ").on('tap', '.device_model', function (e) {
            var deviceId = $(this).attr("deviceId");
            var itemname_model = $(this).attr("itemname");
            //判断是否有权限
            getUserProjectAuth(function (res) {
                var roleId = ToolBox.getCookie("roleId");
                //作为普通用户没有主机权限
                if (Number(roleId) === 2 & Number(res.fkAuth) === 0) {
                    singleAlter("Constant-account-no-permission-msg")
                } else {
                    if ($("#switch" + deviceId).hasClass("on")) {
                        var vId = deviceId.substring(0, deviceId.indexOf('_'));
                        var item = getVdeviceItemsInfo(vId, itemname_model);
                        //当前为开机状态，提供关机功能
                        ToolBox.device_model({
                            $container: $('#others'),
                            afterCallbackCold: function () {
                                $('#confirm-alert').modal('hide');
                                var loading = layer.load(2, {shade: [0.5, '#fff']});
                                send_control_new(item.devid, item.itemid, 0, false, function (res) {
                                    //修改环形颜色和背景颜色
                                    $('#child' + deviceId).circleProgress({
                                        fill: {
                                            gradient: ["#21BFFE", "#67F7B2"]
                                        }
                                    });
                                    $('#parent' + deviceId).removeClass("hot_parent");
                                    $('#parent' + deviceId).addClass("cold_parent");
                                    $('#child' + deviceId).removeClass("hot_child");
                                    $('#child' + deviceId).addClass("cold_child");
                                    $("#modelImg" + deviceId).removeClass("fa-sun-o");
                                    $("#modelImg" + deviceId).addClass("fa-snowflake-o");
                                    $("#modelText" + deviceId).html("制冷");
                                    if (res != "success") {
                                        alert("控制失败");
                                    } else {
                                        refreshCurrentDataByProjectDelay(cur_projectId, function () {
                                            console.log("刷新数据成功")
                                        });
                                    }
                                    //关闭loading
                                    layer.close(loading);
                                })
                            },
                            afterCallbackHot: function () {
                                $('#confirm-alert').modal('hide');
                                var loading = layer.load(2, {shade: [0.5, '#fff']});
                                send_control_new(item.devid, item.itemid, 1, false, function (res) {
                                    //修改环形颜色和背景颜色
                                    $('#child' + deviceId).circleProgress({
                                        fill: {
                                            gradient: ["#2CCBF3", "#B40608"]
                                        }
                                    });
                                    $('#parent' + deviceId).addClass("hot_parent");
                                    $('#parent' + deviceId).removeClass("cold_parent");
                                    $('#child' + deviceId).removeClass("cold_child");
                                    $('#child' + deviceId).addClass("hot_child");
                                    $("#modelImg" + deviceId).removeClass("fa-snowflake-o");
                                    $("#modelImg" + deviceId).addClass("fa-sun-o");
                                    $("#modelText" + deviceId).html("制热");
                                    if (res != "success") {
                                        alert("控制失败");
                                    } else {
                                        refreshCurrentDataByProjectDelay(cur_projectId, function () {
                                            console.log("刷新数据成功")
                                        });
                                    }
                                    //关闭loading
                                    layer.close(loading);
                                })
                            }
                        })
                    } else {
                        singleAlter("Constant-warn-close-msg");
                    }
                }
            });
        })

        //风速
        $("#main").off('tap', ".device_speed").on('tap', '.device_speed', function (e) {
            var deviceId = $(this).attr("deviceId");
            var itemPre = $(this).attr("itemPre");
            //判断是否有权限
            getUserProjectAuth(function (res) {
                var roleId = ToolBox.getCookie("roleId");
                //作为普通用户没有主机权限
                if (Number(roleId) === 2 & Number(res.fkAuth) === 0) {
                    singleAlter("Constant-account-no-permission-msg")
                } else {
                    if ($("#switch" + deviceId).hasClass("on")) {
                        var vId = deviceId.substring(0, deviceId.indexOf('_'));
                        var speed = $("#speedT" + deviceId).html();
                        ToolBox.device_speed({
                            $container: $('#others'),
                            afterCallback: function (data) {
                                $('#confirm-alert').modal('hide');
                                var loading = layer.load(2, {shade: [0.5, '#fff']});
                                $("#speedT" + deviceId).html(data);
                                //分别获取低速、中速、高速的item
                                var lowItemname = itemPre + '_Lwinds';
                                var lowItem = getVdeviceItemsInfo(vId, lowItemname);
                                var midItemname = itemPre + '_Mwinds';
                                var midItem = getVdeviceItemsInfo(vId, midItemname);
                                var highItemname = itemPre + '_Hwinds';
                                var highItem = getVdeviceItemsInfo(vId, highItemname);
                                if (data === '低速') {
                                    updateLowSpeed(lowItem.devid, lowItem.itemid, 1);
                                    updateMidSpeed(midItem.devid, midItem.itemid, 0);
                                    updateHighSpeed(highItem.devid, highItem.itemid, 0);
                                } else if (data === '高速') {
                                    updateLowSpeed(lowItem.devid, lowItem.itemid, 0);
                                    updateMidSpeed(midItem.devid, midItem.itemid, 0);
                                    updateHighSpeed(highItem.devid, highItem.itemid, 1);
                                } else if (data === '中速') {
                                    updateLowSpeed(lowItem.devid, lowItem.itemid, 0);
                                    updateMidSpeed(midItem.devid, midItem.itemid, 1);
                                    updateHighSpeed(highItem.devid, highItem.itemid, 0);
                                }
                                //关闭loading
                                layer.close(loading);
                            },
                            flag: speed
                        })
                    } else {
                        singleAlter("Constant-warn-close-msg");
                    }
                }
            });

        })

        //修改低速状态值
        function updateLowSpeed(devid, itemid, val) {
            send_control_new(devid, itemid, val, false, function (res) {
                if (res != "success") {
                    alert("控制失败");
                } else {
                    refreshCurrentDataByProjectDelay(cur_projectId, function () {
                        console.log("刷新数据成功")
                    });
                }
            });
        }

        //修改中速状态值
        function updateMidSpeed(devid, itemid, val) {
            send_control_new(devid, itemid, val, false, function (res) {
                if (res != "success") {
                    alert("控制失败");
                } else {
                    refreshCurrentDataByProjectDelay(cur_projectId, function () {
                        console.log("刷新数据成功")
                    });
                }
            });
        }

        //修改高速状态值
        function updateHighSpeed(devid, itemid, val) {
            send_control_new(devid, itemid, val, false, function (res) {
                if (res != "success") {
                    alert("控制失败");
                } else {
                    refreshCurrentDataByProjectDelay(cur_projectId, function () {
                        console.log("刷新数据成功")
                    });
                }
            });
        }


        //定时
        $("#main").off('tap', ".device_time").on('tap', '.device_time', function (e) {
            var deviceId = $(this).attr("deviceId");
            var itemname = $(this).attr("itemname");
            //判断是否有权限
            getUserProjectAuth(function (res) {
                var roleId = ToolBox.getCookie("roleId");
                //作为普通用户没有主机权限
                if (Number(roleId) === 2 & Number(res.fkAuth) === 0) {
                    singleAlter("Constant-account-no-permission-msg")
                } else {
                    if ($("#switch" + deviceId).hasClass("on")) {
                        //需要根据天气提供页面图片
                        var air_img = getImgUrl(weather);
                        $("#main").html(Layout.basic_frame(weather, humidity, temperature, wind, air_img,city));
                        //移除所有按钮的激活class，并激活当前按钮
                        $("#host").removeClass("active")
                        $("#control").removeClass("active")
                        $("#senior").addClass("active")
                        getValByKey(itemname, function (item) {
                            var devid = item.devid;
                            var itemid = item.itemid;
                            var loading;
                            $.ajax({
                                type: 'get',
                                url: '/device/getDeviceJob',
                                data: {
                                    devid: devid,
                                    itemid: itemid,
                                },
                                //开启loading
                                beforeSend: function () {
                                    loading = layer.load(2, {shade: [0.5, '#fff']});
                                },
                                dataType: "json",
                                success: function (res) {
                                    $(".content").html(Layout.time_swtich());
                                    //添加itemname属性
                                    $("#time_switch").attr('itemname', itemname);
                                    //服务端结束处理后，重置状态
                                    if (res.data.length > 0) {
                                        for (var step = 0; step < res.data.length; step++) {
                                            var cronTime = res.data[step].cronTime;
                                            var arra = cronTime.split(" ");
                                            var min = Number(arra[1]) < 10 ? '0' + Number(arra[1]) : Number(arra[1]);
                                            var time = arra[2] + ":" + min;
                                            if (Number(res.data[step].val) === 1) {
                                                //开机时间
                                                $("#open_time_t").html(time);
                                            } else {
                                                //关机时间
                                                $("#close_time_t").html(time);
                                            }
                                        }
                                        //取第一个的定时器的状态
                                        var onoff = Number(res.data[0].jobStatus);
                                        if (onoff === 1) {
                                            //开机
                                            $("#time_switch").removeClass("on");
                                            $("#time_switch").addClass("on");
                                            $("#time_switch").attr("src", "../assets/image/img/switch_on_full.png");
                                        } else {
                                            //关机
                                            $("#time_switch").removeClass("on");
                                            $("#time_switch").attr("src", "../assets/image/img/switch_off_full.png");
                                        }
                                    }
                                    //关闭loading
                                    layer.close(loading);
                                }
                            })
                        })
                    } else {
                        singleAlter("Constant-warn-close-msg");
                    }
                }
            });
        })

        //点击房控内部返回按钮
        $("#main").off('tap', ".control_top_icon").on('tap', '.control_top_icon', function (e) {
            //需要根据天气提供页面图片
            var air_img = getImgUrl(weather);
            setTimeout(function () {
                $("#main").html(Layout.basic_frame(weather, humidity, temperature, wind, air_img,city));
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
            }, 300)
        })
        //-------------------------房控end-----------------------------

        //-----------------------高级start-----------------------------
        //点击高级内容区域发生改变
        $("#main").off('tap', "#senior").on('tap', '#senior', function (e) {
            //移除所有按钮的激活class，并激活当前按钮
            $("#host").removeClass("active")
            $("#control").removeClass("active")
            $(this).addClass("active")
            var roleId = ToolBox.getCookie("roleId");
            if (roleId != "2") {
                $(".content").html(Layout.senior_mode())
            } else {
                $(".content").html(Layout.senior_mode_common())
            }


        })

        //获取项目列表
        $("#main").off('tap', '.project_list').on('tap', '.project_list', function (e) {
            after_choice();
        })

        //返回高级页面
        $('#main').off('tap', '.role_header').on('tap', '.role_header', function (e) {
            $("#host").removeClass("active")
            $("#control").removeClass("active")
            $("#senior").addClass("active")
            setTimeout(function () {
                var roleId = ToolBox.getCookie("roleId");
                if (roleId != "2") {
                    $(".content").html(Layout.senior_mode())
                } else {
                    $(".content").html(Layout.senior_mode_common())
                }
            }, 100)
        })

        //返回高级页面
        $('#main').off('tap', '.repair_title').on('tap', '.repair_title', function (e) {
            //清除图片等信息
            fileall = [];
            $(".z_addImg").remove();

            $("#host").removeClass("active")
            $("#control").removeClass("active")
            $("#senior").addClass("active")
            setTimeout(function () {
                var roleId = ToolBox.getCookie("roleId");
                if (roleId != "2") {
                    $(".content").html(Layout.senior_mode())
                } else {
                    $(".content").html(Layout.senior_mode_common())
                }
            }, 100)
        })

        //返回权限设置页面
        $('#main').off('tap', '.backRoleBtn').on('tap', '.backRoleBtn', function (e) {
            setTimeout(function () {
                $(".content").html(Layout.role_setting_mode())
            }, 100)

        })

        //注销
        $("#main").off('tap', '.logout').on('tap', '.logout', function (e) {
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
                //回显
                $.ajax({
                    type: 'GET',
                    url: '/auth/getProjectAuthOri',
                    data: {
                        projectId: cur_projectId
                    },
                    dataType: 'json',
                    success: function (res) {
                        if(res.ctrlAuth == 1){
                            $("#control_role_switch").addClass("on");
                            $("#control_role_switch").attr("src", "../assets/image/img/switch_on_full.png");
                        }else{
                            $("#control_role_switch").removeClass("on");
                            $("#control_role_switch").attr("src", "../assets/image/img/switch_off_full.png");
                            res.fkAuth = 0;
                            res.hostAuth = 0;
                        }

                        if(res.fkAuth == 1){
                            $("#room_control_switch").addClass("on");
                            $("#room_control_switch").attr("src", "../assets/image/img/switch_on_full.png");
                        }else{
                            $("#room_control_switch").removeClass("on");
                            $("#room_control_switch").attr("src", "../assets/image/img/switch_off_full.png");
                        }

                        if(res.hostAuth == 1){
                            $("#host_role_switch").addClass("on");
                            $("#host_role_switch").attr("src", "../assets/image/img/switch_on_full.png");
                        }else{
                            $("#host_role_switch").removeClass("on");
                            $("#host_role_switch").attr("src", "../assets/image/img/switch_off_full.png");
                        }
                    }
                });
            }, 300)
        })


        //用户权限
        $("#main").off('tap', '.user_role').on('tap', '.user_role', function (e) {
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
        $("#main").off('tap', '.project_role_1').on('tap', '.project_role_1', function (e) {
            if ($("#project_role i").hasClass("fa-angle-right")) {
                $("#project_role i").removeClass("fa-angle-right");
                $("#project_role i").addClass("fa-angle-down");
                $(".project_sub").removeClass("disNone")
            } else {
                $("#project_role i").removeClass("fa-angle-down");
                $("#project_role i").addClass("fa-angle-right");
                $(".project_sub").addClass("disNone")
            }
        })

        //定时开关
        $("#main").off('tap', '.time_control_1').on('tap', '.time_control_1', function (e) {
            //判断是否有权限
            getUserProjectAuth(function (res) {
                var roleId = ToolBox.getCookie("roleId");
                //作为普通用户没有主机权限
                if (Number(roleId) === 2 & Number(res.fkAuth) === 0) {
                    singleAlter("Constant-account-no-permission-msg")
                } else {
                    //定时开关页面需要更新开机时间和关机时间
                    getValByKey("Sys_RunSet", function (item) {
                        var devid = item.devid;
                        var itemid = item.itemid;
                        var loading;
                        $.ajax({
                            type: 'get',
                            url: '/device/getDeviceJob',
                            data: {
                                devid: devid,
                                itemid: itemid,
                            }, //开启loading
                            beforeSend: function () {
                                loading = layer.load(2, {shade: [0.5, '#fff']});
                            },
                            dataType: "json",
                            success: function (res) {
                                $(".content").html(Layout.time_swtich());
                                //服务端结束处理后，重置状态
                                if (res.data.length > 0) {
                                    for (var step = 0; step < res.data.length; step++) {
                                        var cronTime = res.data[step].cronTime;
                                        var arra = cronTime.split(" ");
                                        var min = Number(arra[1]) < 10 ? '0' + Number(arra[1]) : Number(arra[1]);
                                        var time = arra[2] + ":" + min;
                                        if (Number(res.data[step].val) === 1) {
                                            //开机时间
                                            $("#open_time_t").html(time);
                                        } else {
                                            //关机时间
                                            $("#close_time_t").html(time);
                                        }
                                    }
                                    //取第一个的定时器的状态
                                    var onoff = Number(res.data[0].jobStatus);
                                    if (onoff === 1) {
                                        //开机
                                        $("#time_switch").removeClass("on");
                                        $("#time_switch").addClass("on");
                                        $("#time_switch").attr("src", "../assets/image/img/switch_on_full.png");
                                    } else {
                                        //关机
                                        $("#time_switch").removeClass("on");
                                        $("#time_switch").attr("src", "../assets/image/img/switch_off_full.png");
                                    }
                                }
                                //关闭loading
                                layer.close(loading);
                            }
                        })
                    })
                }
            });
        })

        //权限控制的开关
        $("#main").off('tap', '#control_role_switch').on('tap', '#control_role_switch', function (e) {
            if ($(this).hasClass("on")) {
                $(this).removeClass("on")
                $(this).attr("src", "../assets/image/img/switch_off_full.png");
            } else {
                $(this).addClass("on")
                $(this).attr("src", "../assets/image/img/switch_on_full.png");
            }
            var ctrlAuth = 0;
            var hostAuth = 0;
            var fkAuth = 0;
            if($("#control_role_switch").hasClass("on")){
                ctrlAuth = 1;
            }
            if($("#host_role_switch").hasClass("on")){
                hostAuth = 1;
            }
            if($("#room_control_switch").hasClass("on")){
                fkAuth = 1;
            }
            $.ajax({
                type: 'GET',
                url: '/auth/changeUserAuth',
                data: {
                    projectId: cur_projectId,
                    ctrlAuth:ctrlAuth,
                    hostAuth:hostAuth,
                    fkAuth:fkAuth
                },
                dataType: 'json',
                success: function (res) {
                    if(res.status = '100'){
                        if(!$(this).hasClass("on")){
                            $('#host_role_switch').removeClass("on")
                            $('#host_role_switch').attr("src", "../assets/image/img/switch_off_full.png");

                            $('#room_control_switch').removeClass("on")
                            $('#room_control_switch').attr("src", "../assets/image/img/switch_off_full.png");
                        }
                    }
                }
            });
        })


        //主机权限
        $("#main").off('tap', '#host_role_switch').on('tap', '#host_role_switch', function (e) {

            if(!$("#control_role_switch").hasClass("on")){
                singleAlter("Constant-account-no-permission-msg-2");
                return;
            }

            if ($(this).hasClass("on")) {
                $(this).removeClass("on")
                $(this).attr("src", "../assets/image/img/switch_off_full.png");
            } else {
                $(this).addClass("on")
                $(this).attr("src", "../assets/image/img/switch_on_full.png");
            }
            var ctrlAuth = 0;
            var hostAuth = 0;
            var fkAuth = 0;
            if($("#control_role_switch").hasClass("on")){
                ctrlAuth = 1;
            }
            if($("#host_role_switch").hasClass("on")){
                hostAuth = 1;
            }
            if($("#room_control_switch").hasClass("on")){
                fkAuth = 1;
            }
            $.ajax({
                type: 'GET',
                url: '/auth/changeUserAuth',
                data: {
                    projectId: cur_projectId,
                    ctrlAuth:ctrlAuth,
                    hostAuth:hostAuth,
                    fkAuth:fkAuth
                },
                dataType: 'json',
                success: function (res) {
                    console.log(res)
                }
            });
        })

        //房控权限
        $("#main").off('tap', '#room_control_switch').on('tap', '#room_control_switch', function (e) {

            if(!$("#control_role_switch").hasClass("on")){
                singleAlter("Constant-account-no-permission-msg-2")
                return;
            }

            if ($(this).hasClass("on")) {
                $(this).removeClass("on")
                $(this).attr("src", "../assets/image/img/switch_off_full.png");
            } else {
                $(this).addClass("on")
                $(this).attr("src", "../assets/image/img/switch_on_full.png");
            }
            var ctrlAuth = 0;
            var hostAuth = 0;
            var fkAuth = 0;
            if($("#control_role_switch").hasClass("on")){
                ctrlAuth = 1;
            }
            if($("#host_role_switch").hasClass("on")){
                hostAuth = 1;
            }
            if($("#room_control_switch").hasClass("on")){
                fkAuth = 1;
            }
            $.ajax({
                type: 'GET',
                url: '/auth/changeUserAuth',
                data: {
                    projectId: cur_projectId,
                    ctrlAuth:ctrlAuth,
                    hostAuth:hostAuth,
                    fkAuth:fkAuth
                },
                dataType: 'json',
                success: function (res) {
                    console.log(res)
                }
            });
        })
        //开机时间的业务代码控制
        var onflag = 0, offflag = 0, timeOn, timeOff, switchflag = 0, timeSwitch;

        //开机时间的后台处理
        function addDeviceJobServiceOpen(token, devid, val, itemid, startUpTime, onoff) {
            $.ajax({
                type: 'get',
                url: '/device/addDeviceJob',
                data: {
                    token: token,
                    devid: devid,
                    val: val,
                    itemid: itemid,
                    time: startUpTime,
                    onoff: onoff
                },
                beforeSend: function () {
                    //发送前置为状态1
                    onflag = 1;
                },
                success: function (res) {
                    //服务端结束处理后，重置状态
                    onflag = 0;
                    console.log(res);
                },
                error: function (err) {
                    //服务端结束处理后，重置状态
                    onflag = 0;
                    console.error(err);
                }
            })
        }

        //关机时间的后台处理
        function addDeviceJobServiceClose(token, devid, val, itemid, shutdownTime, onoff) {
            $.ajax({
                type: 'get',
                url: '/device/addDeviceJob',
                data: {
                    token: token,
                    devid: devid,
                    val: val,
                    itemid: itemid,
                    time: shutdownTime,
                    onoff: onoff
                },
                beforeSend: function () {
                    //发送前置为状态1
                    offflag = 1;
                },
                success: function (res) {
                    //服务端结束处理后，重置状态
                    offflag = 0;
                    console.log(res);
                },
                error: function (err) {
                    //服务端结束处理后，重置状态
                    offflag = 0;
                    console.error(err);
                }
            })
        }

        //定时开关是否开启或关闭
        function addDeviceJobServiceSwtich(devid, itemid, onoff) {
            $.ajax({
                type: 'get',
                url: '/device/timeSwtich',
                data: {
                    devid: devid,
                    itemid: itemid,
                    onoff: onoff
                },
                beforeSend: function () {
                    //发送前置为状态1
                    switchflag = 1;
                },
                success: function (res) {
                    //服务端结束处理后，重置状态
                    switchflag = 0;
                    console.log(res);
                },
                error: function (err) {
                    //服务端结束处理后，重置状态
                    switchflag = 0;
                    console.error(err);
                }
            })
        }

        //定时开关的switch 0 关机 1 开机
        $("#main").off('tap', '#time_switch').on('tap', '#time_switch', function (e) {
            if ($(this).hasClass("on")) {
                //判断是否有itemname属性 如果有 说明是房控进来的
                var itemname = $(this).attr('itemname');
                if (itemname === 'undefined' | itemname === undefined) {
                    itemname = 'Sys_RunSet';
                }
                getValByKey(itemname, function (item) {
                    var devid = item.devid;
                    var itemid = item.itemid;
                    //发送前判断业务代码状态
                    if (switchflag === 0) {
                        //还没发送业务请求，先清空，再请求
                        clearTimeout(timeSwitch);
                        timeSwitch = setTimeout(function () {
                            addDeviceJobServiceSwtich(devid, itemid, 0)
                        }, 3000);
                    } else {
                        //已经发送业务请求，将用户当前改动请求后台
                        timeSwitch = setTimeout(function () {
                            addDeviceJobServiceSwtich(devid, itemid, 0)
                        }, 3000);
                    }
                })
                $(this).removeClass("on")
                $(this).attr("src", "../assets/image/img/switch_off_full.png");
            } else {
                var itemname = $(this).attr('itemname');
                if (itemname === 'undefined' | itemname === undefined) {
                    itemname = 'Sys_RunSet';
                }
                getValByKey(itemname, function (item) {
                    var devid = item.devid;
                    var itemid = item.itemid;
                    //发送前判断业务代码状态
                    if (switchflag === 0) {
                        //还没发送业务请求，先清空，再请求
                        clearTimeout(timeSwitch);
                        timeSwitch = setTimeout(function () {
                            addDeviceJobServiceSwtich(devid, itemid, 1)
                        }, 3000);
                    } else {
                        //已经发送业务请求，将用户当前改动请求后台
                        timeSwitch = setTimeout(function () {
                            addDeviceJobServiceSwtich(devid, itemid, 1)
                        }, 3000);
                    }
                })
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
                    $("#open_time_t").html(textVale);
                    var startUpTime = textVale;
                    var val = 1;//1是开机
                    var onoff = 0;//0是关
                    if ($('#time_switch').hasClass("on")) {
                        onoff = 1;
                    }
                    //判断是否有itemname属性 如果有 说明是房控进来的
                    var itemname = $('#time_switch').attr('itemname');
                    if (itemname === 'undefined' | itemname === undefined) {
                        itemname = 'Sys_RunSet';
                    }
                    getValByKey(itemname, function (item) {
                        var devid = item.devid;
                        var itemid = item.itemid;
                        var token = ToolBox.getCookie("token");
                        //发送前判断业务代码状态
                        if (onflag === 0) {
                            //还没发送业务请求，先清空，再请求
                            clearTimeout(timeOn);
                            timeOn = setTimeout(function () {
                                addDeviceJobServiceOpen(token, devid, val, itemid, startUpTime, onoff)
                            }, 5000);
                        } else {
                            //已经发送业务请求，将用户当前改动请求后台
                            timeOn = setTimeout(function () {
                                addDeviceJobServiceOpen(token, devid, val, itemid, startUpTime, onoff)
                            }, 5000);
                        }
                    })
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
                    var shutdownTime = textVale;
                    var val = 0;//0是关机
                    var onoff = 0;//0是关
                    if ($('#time_switch').hasClass("on")) {
                        onoff = 1;
                    }
                    //判断是否有itemname属性 如果有 说明是房控进来的
                    var itemname = $('#time_switch').attr('itemname');
                    if (itemname === 'undefined' | itemname === undefined) {
                        itemname = 'Sys_RunSet';
                    }
                    getValByKey(itemname, function (item) {
                        var devid = item.devid;
                        var itemid = item.itemid;
                        var token = ToolBox.getCookie("token");
                        //发送前判断业务代码状态
                        if (offflag === 0) {
                            //还没发送业务请求，先清空，再请求
                            clearTimeout(timeOff);
                            timeOff = setTimeout(function () {
                                addDeviceJobServiceClose(token, devid, val, itemid, shutdownTime, onoff);
                            }, 5000)

                        } else {
                            //已经发送业务请求，将用户当前改动请求后台
                            timeOff = setTimeout(function () {
                                addDeviceJobServiceClose(token, devid, val, itemid, shutdownTime, onoff);
                            }, 5000)
                        }
                    })
                }
            });
        })


        //我要报修，重新绘制content元素
        $("#main").off('tap', '.need_repair').on('tap', '.need_repair', function (e) {
            $(".content").html(Layout.need_repair())
        })


        //提交我要报修
        $('#main').off('tap', '#repair_submit').on('tap', '#repair_submit', function (e) {
            var reason = $("#repair_reason").val().replace(/(^\s*)|(\s*$)/g, '');
            var describe = $("#repair_describe").val().replace(/(^\s*)|(\s*$)/g, '');
            if (reason == "") {
                singleAlter("Constant-account-reason-msg")
                return;
            }
            if (describe == "") {
                singleAlter("Constant-account-describe-msg")
                return;
            }

            //jiangzhiwei
            var formData = new FormData();
            for(var i=0;i<fileall.length;i++){
                formData.append("file",fileall[i]);
            }
            var phone = ToolBox.getCookie("phone");
            var userName = ToolBox.getCookie("userName");
            if(typeof phone == 'undefined'){
                phone = '';
            }
            if (typeof userName == 'undefined'){
                userName = '';
            }

            var json = {
                projectId: global_projectId,
                weixinId: ToolBox.getCookie("openId"),
                phone: phone,
                userName: userName,
                reason: reason,
                repairDesc: describe,
                userType: 0
            }
            formData.append("payLoad",JSON.stringify(json))

            var loading;
            // $.ajax({
            //     type: "POST",
            //     url: "/device/addProjectRepair",
            //     data: JSON.stringify({
            //         projectId: global_projectId,
            //         weixinId: ToolBox.getCookie("openId"),
            //         phone: ToolBox.getCookie("phone"),
            //         userName: ToolBox.getCookie("username"),
            //         reason: reason,
            //         repairDesc: describe,
            //         userType: 0
            //     }),
            //     beforeSend: function () {
            //         loading = layer.load(2, {shade: [0.5, '#fff']});
            //     },
            //     contentType: 'application/json',
            //     dataType: 'json',
            //     success: function (res) {
            //         if (res.status == 100) {
            //             //成功报修
            //             singleAlter("Constant-account-repair-success-msg")
            //             $("#repair_reason").val('');
            //             $("#repair_describe").val('');
            //         } else {
            //             //报修失败
            //             singleAlter("Constant-account-repair-fail-msg")
            //         }
            //         //关闭loading
            //         layer.close(loading);
            //
            //     }
            // })

            $.ajax({
                type: "POST",
                url: "/device/addProjectRepairNew",
                data: formData,
                beforeSend: function () {
                    loading = layer.load(2, {shade: [0.5, '#fff']});
                },
                cache: false,
                processData: false,
                contentType: false,
                dataType: "json",
                success: function (res) {
                    if (res.status == 100) {
                        //成功报修
                        singleAlter("Constant-account-repair-success-msg")
                        $("#repair_reason").val('');
                        $("#repair_describe").val('');
                    } else {
                        //报修失败
                        singleAlter("Constant-account-repair-fail-msg")
                    }
                    //清空
                    fileall = [];
                    $(".z_addImg").remove();
                    //关闭loading
                    layer.close(loading);

                }
            })

        })

        //报修记录，重新绘制content元素
        $("#main").off('tap', '.repair_log').on('tap', '.repair_log', function (e) {
            //首先获取角色
            var roleId = ToolBox.getCookie("roleId");
            //根据角色获取报修记录，此次报修记录将用户名、报修时间、报修原因、报修内容、聊天记录、维修记录的索引
            //初始化
            $("#main").html(Layout.basic_repair("报修记录", "repair_list_back"))
            var repairList = [];
            var loading;
            $.ajax({
                type: 'get',
                url: '/device/getUserProjectRepairs',
                data: {
                    openId: ToolBox.getCookie("openId"),
                    projectId: global_projectId,
                    roleId: roleId
                },
                beforeSend: function () {
                    loading = layer.load(2, {shade: [0.5, '#fff']});
                },
                dataType: 'json',
                success: function (res) {
                    _.each(res.repairList, function (p) {
                        var record = {
                            reason: p.reason,
                            repairId: p.repairId
                        }
                        repairList.push(record);
                    })
                    if (repairList.length > 0) {
                        _.each(res.repairList, function (p) {
                            $(".log_list").prepend(Layout.repair_list(p.reason, p.repairId))
                        })
                    }
                    //关闭loading
                    layer.close(loading);
                }
            })
            //内容框给最小高度
            $(".log_content").css("min-height", document.documentElement.clientHeight - 70)
            //判断是否有维修记录
            $(".log_list").html("");


        })

        //返回到高级页面
        $("#main").off('tap', '.repair_list_back').on('tap', '.repair_list_back', function (e) {
            //需要根据天气提供页面图片
            var air_img = getImgUrl(weather);
            setTimeout(function () {
                $("#main").html(Layout.basic_frame(weather, humidity, temperature, wind, air_img,city));
                //移除所有按钮的激活class，并激活当前按钮
                $("#host").removeClass("active")
                $("#control").removeClass("active")
                $("#senior").removeClass("active")
                $("#senior").addClass("active")
                //先清空content的内容，补充各个单独房间样式
                $(".content").html("");
                var roleId = ToolBox.getCookie("roleId");
                if (roleId != 2) {
                    $(".content").html(Layout.senior_mode())
                } else {
                    $(".content").html(Layout.senior_mode_common())
                }
            }, 300)
        })


        //点击某维修记录
        $("#main").off('tap', '.repair_list_row').on('tap', '.repair_list_row', function (e) {
            var repairId = $(this).attr('id');
            var roleId = ToolBox.getCookie("roleId");
            var userType = 0;
            if (roleId != '2') {
                userType = 1;
            }
            $.ajax({
                type: 'get',
                url: '/device/getRepairRecord',
                data: {
                    repairId: repairId,
                    userType: userType
                },
                dataType: 'json',
                contentType: "application/json;charset=utf-8",
                success: function (res) {
                    console.log(res);
                    //初始化
                    $("#main").html(Layout.basic_repair("报修内容", "repair_content_back"))
                    $(".log_list").html("");
                    $(".log_list").prepend(Layout.repair_content(repairId, res.username, res.phone, res.time, res.desc, res.detail, res.msg))
                    $.each(res.fileList,function(index,file){
                        var divImg = "<div class='z_addImg boxer' href='"+file.filepath+"'><img src='"+file.filepath+"'></div>"
                        //var divImg = "<div class='z_addImg boxer' href='http://goldcontrol.link/file/test.jpg'><img src='http://goldcontrol.link/file/test.jpg'></div>"
                        $(".z_photo").prepend(divImg);
                    });
                    var viewer = new Viewer(document.getElementById('files'));
                }
            })
        })

        //报修内容点击返回到报修记录页面
        $("#main").off('tap', '.repair_content_back').on('tap', '.repair_content_back', function (e) {
            setTimeout(function () {
                var repairList = [];
                //首先获取角色
                var roleId = ToolBox.getCookie("roleId");
                $.ajax({
                    type: 'get',
                    url: '/device/getUserProjectRepairs',
                    data: {
                        openId: ToolBox.getCookie("openId"),
                        projectId: global_projectId,
                        roleId: roleId
                    },
                    dataType: 'json',
                    success: function (res) {
                        _.each(res.repairList, function (p) {
                            var record = {
                                reason: p.reason,
                                repairId: p.repairId
                            }
                            repairList.push(record);
                        })
                        if (repairList.length > 0) {
                            _.each(res.repairList, function (p) {
                                $(".log_list").prepend(Layout.repair_list(p.reason, p.repairId))
                            })
                        }
                    }
                })
                //初始化
                $("#main").html(Layout.basic_repair("报修记录", "repair_list_back"))
                //内容框给最小高度
                $(".log_content").css("min-height", document.documentElement.clientHeight - 70)
                //判断是否有维修记录
                $(".log_list").html("");
            }, 200);
        })

        $("#main").off('tap', '.boxer-content').on('tap', '.boxer-content', function (e) {
            this.hidden();
        })

        //报修内容点击提交
        $("#main").off('tap', '#repaire_content_submit').on('tap', '#repaire_content_submit', function (e) {
            var repairId = $("#repairId").html();
            var reply = $("#reply").val();
            var roleId = ToolBox.getCookie("roleId");
            var userType = 0;
            if (roleId != '2') {
                userType = 1;
            }
            setTimeout(function () {
                $.ajax({
                    type: 'post',
                    url: '/device/addRepairRecord',
                    data: JSON.stringify({
                        weixinId: ToolBox.getCookie('openId'),
                        userType: userType,
                        repairId: repairId,
                        msg: reply,
                    }),
                    contentType: 'application/json',
                    dataType: 'json',
                    success: function (res) {
                        if (res.status == 100) {
                            $.ajax({
                                type: 'get',
                                url: '/device/getRepairRecord',
                                data: {
                                    repairId: repairId,
                                    userType: userType
                                },
                                dataType: 'json',
                                contentType: "application/json;charset=utf-8",
                                success: function (res) {
                                    $("#detail").html(res.msg);
                                }
                            })
                        }
                    }
                })
            }, 200);
        })


        //联系我们
        $("#main").off('tap', '.contact_us').on('tap', '.contact_us', function (e) {
            $(".content").html(Layout.contact_us())
        })

        //-----------------------高级end-----------------------------


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
            //开启
            timeJobId = setInterval(function () {
                //只刷新页面
                //如果当前是非主页的刷新,则不需要刷新当前页
                console.log("要刷新页面了")
                layout_init_refresh();
                // if ($("#cur_choice").is(":visible")) {
                //     layout_init();
                // }
            }, timeJobFre);
        }

    }

    //提示框，单按钮
    function singleAlter(msg) {
        ToolBox.warn_open({
            $container: $('#others'),
            msg: ToolBox.getConstant(msg)
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