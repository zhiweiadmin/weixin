/*版本号*/
var version = "0.1.0";
/*微信域名*/
var domain = "http://goldcontrol.link";
/*
*
* */
/*云平台API地址*/
var apiUrl = "http://112.126.98.10:8600/";
//jiangzhiwei 有效期600分钟
var token_get = "613399db-4a4f-451f-b4d4-33710a6537b0";
/*机型*/
var device_type = [
    {
        name: "单双压机二联供",
        value: "outes_twoPressTwoJointSupply"
    },
    {
        name: "单双压机热水机",
        value: "outes_twoPressWaterHeater"
    }
];
/*根据value找name*/
var getDeviceTypeNameByValue = function(value){
    for(var index in device_type){
        if(device_type[index].value == value){
            return device_type[index].name;
        }
    }
};
/*设备台账key-value*/
var device_info = {
    installTime: {
        key: 1,
        value: "安装时间"
    },
    acNumber: {
        key: 2,
        value: "空调序列号"
    },
    type: {
        key: 3,
        value: "设备型号"
    },
    installPlace: {
        key: 4,
        value: "安装地址"
    },
    householdName: {
        key: 5,
        value: "住户姓名"
    },
    phone: {
        key: 6,
        value: "联系电话"
    },
    serialNumber: {
        key: 7,
        value: "SE序列号"
    }
};
//空调型号
var air_type="aircondition_type";
//空调编号
var air_num = "aircondition_num";
//网络号
var net_num = "net_number";

/*空调设备台账唯一标识属性*/
var device_pk_attr_name = "acNumber";
/*微信ID*/
var weixin_app_id = "wx68bdb6bb594eb39c";
/*普通用户的用户名前缀*/
var normal_user_prefix = "normalUser_";
/*是否启动常规数据展示（设备数据模板筛选展示），注：与温感不兼容*/
var support_device_template = true;
/*是否支持温感模块*/
var support_temperature_module = false;
/*温感模块对应模板配置文件名称*/
var temperature_config_name = "haier_1";
/*温感模块设备的个数*/
var temperature_module_collection = [0, 1, 2, 3, 4, 5];
//定时任务的ID
var timeJobId = -1;
//房间列表页面的定时任务ID
var roomJobId = -1;
//当前项目ID
var global_projectId = -1;
//定时任务频率 60s
var timeJobFre = 1000*20; //20s
//房间列表定时任务频率
var roomJobFre = 1000*20; //20s
//获取位置信息的定时任务
var locationJobId = -1;
//获取位置信息的频率
var locationJobFre = 60000*3;//3分钟
var weather_key = '7345b4989e684f40b871051bd2fe54a2'
