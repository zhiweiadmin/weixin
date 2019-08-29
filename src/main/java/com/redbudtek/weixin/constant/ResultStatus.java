package com.redbudtek.weixin.constant;

public enum ResultStatus {
    SUCCESS(100), //成功

    AUTHORITY_ERROR(101), //权限错误

    OUTTIME_ERROR(102),  //超时错误

    PARAMETER_ERROR(103), //参数错误

    TOKEN_ERROR(104), //无效的token

    COMMAND_ERROR(105), //命令执行中

    CONTROL_USER_ERROR(106),//其他用户控制中

    LOGIN_ERROR(107),  //用户名或密码错误

    NO_SUCH_DEVICE_ERROR(108),//没有这个设备

    NO_SUCH_USER_ERROR(109),//没有这个用户

    USER_ALEADY_EXISTS_ERROR(110),//用户名已存在

    UNKNOWN_ERROR(111),//未知错误

    NO_PERMISSION(112),//设备未授权

    USERGROUP_ALEADY_EXISTS_ERROR(113),//用户组名已存在

    DEVICEGROUP_ALEADY_EXISTS_ERROR(114),//设备组名已存在

    USER_LOCKED(115),//用户已被锁定

    ERROR_PASSWORD(116),//登录密码错误

    VPN_INUSE(117), //VPN服务器已经被使用

    VPN_SERVER_UNAVAILABLE(118), //VPN服务不可用

    VPN_IP_UNAVAILABLE(119), //设备没有VPN信息，比如没有设置网段信息

    VPN_IP_FULL(120); //没有可用的IP，请重新分配VPN环境

    private int errorCode;
    private ResultStatus(int errorCode)
    {
        this.errorCode=errorCode;
    }

    @Override
    public String toString() {
        return String.valueOf ( this.errorCode );
    }
}
