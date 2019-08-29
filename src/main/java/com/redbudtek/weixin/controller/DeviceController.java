package com.redbudtek.weixin.controller;

import com.alibaba.fastjson.JSONObject;
import com.redbudtek.weixin.service.DeviceService;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.net.InetAddress;
import java.net.UnknownHostException;

/**
 * @author jinxin.zhou
 * @date 2017/7/4
 */
@Controller
@RequestMapping("device")
public class DeviceController {

    private static final Logger logger = Logger.getLogger(DeviceController.class);

    /**
     * service单例对象
     * @author jinxin.zhou
     * @date 2017/7/4
     */
    @Autowired
    private DeviceService deviceService;
    @Autowired
    private HttpServletRequest request;

    /**
     * 获取设备信息列表
     * @author jinxin.zhou
     * @date 2017/7/10
     * @param token
     * @param page
     * @param perPage
     * @param flagAttrName
     * @param active
     * @param serialNumber
     * @param condition
     */
    @ResponseBody
    @RequestMapping(value = "list_extend", method = RequestMethod.GET, produces="application/json;charset=UTF-8")
    public String getList_extendInfo(@RequestParam(value = "token") String token, @RequestParam(value = "page") Integer page,
                                     @RequestParam(value = "perPage") Integer perPage, @RequestParam(value = "flagAttrName") String flagAttrName,
                                     @RequestParam(value = "active") Integer active, @RequestParam(value = "serialNumber") String serialNumber,
                                     @RequestParam(value = "condition", required = false) Integer condition){
        return deviceService.getDeviceInfoList_extend(token, page, perPage, flagAttrName, active, serialNumber, condition);
    }

    //根据vdeviceIds获取变量组的实时数据
    @ResponseBody
    @RequestMapping(value = "current_data_vdevice",method = RequestMethod.POST,produces = "application/json;charset=UTF-8")
    public String getCurrentItemData(@RequestBody String payLoad,HttpServletRequest request){
        JSONObject json = JSONObject.parseObject(payLoad);
        String token = json.getString("token");
        String page = json.getString("page");
        String perPage = json.getString("perPage");
        String projectId = json.getString("projectId");
        String vdeviceIds = json.getString("vdeviceIds");
        return deviceService.get_vdevice_current_data(token,page,perPage,projectId,vdeviceIds);
    }

    private String getIpAddr (HttpServletRequest request){
        String ip = request.getHeader("x-forwarded-for");
        if(ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if(ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if(ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
            if(ip.equals("127.0.0.1")){
                //根据网卡取本机配置的IP
                InetAddress inet=null;
                try {
                    inet = InetAddress.getLocalHost();
                } catch (UnknownHostException e) {
                    e.printStackTrace();
                }
                ip= inet.getHostAddress();
            }
        }
        // 对于通过多个代理的情况，第一个IP为客户端真实IP,多个IP按照','分割
        if(ip != null && ip.length() > 15){
            if(ip.indexOf(",")>0){
                ip = ip.substring(0,ip.indexOf(","));
            }
        }
        return ip;
    }

}
