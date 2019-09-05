package com.redbudtek.weixin.controller;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.redbudtek.weixin.model.JobEntity;
import com.redbudtek.weixin.model.ProjectRepair;
import com.redbudtek.weixin.quartz.QuartzManager;
import com.redbudtek.weixin.service.DeviceService;
import com.redbudtek.weixin.service.RepairService;
import com.redbudtek.weixin.service.ScheduledService;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

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

    @Autowired
    RepairService repairService;

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

    @Autowired
    ScheduledService scheduledService;

    @Autowired
    QuartzManager quartzManager;

    /**
     * 添加设备定时开关机
     * @return
     */
    @ResponseBody
    @RequestMapping(value = "addDeviceJob",method = RequestMethod.GET)
    public String addDeviceJob(Integer onoff,String devid,String itemid,String time,String val) throws ParseException {
        if(onoff == null){
            onoff = 0;
        }
        //根据时间 生成cron表达式
        JobEntity jobEntity = new JobEntity();
        jobEntity.setJobId(null);
        jobEntity.setJobStatus(onoff);
        jobEntity.setDevid(devid);
        jobEntity.setItemid(itemid);

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        String date = sdf.format(new Date());

        String newDate = date + " " + time;
        SimpleDateFormat sdf1 = new SimpleDateFormat("yyyy-MM-dd HH:mm");
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(sdf1.parse(newDate));
        int hour = calendar.get(Calendar.HOUR_OF_DAY);
        int min = calendar.get(Calendar.MINUTE);

        String cronTime = "0 "+min+" "+hour+" * * ? *";
        jobEntity.setCronTime(cronTime);
        jobEntity.setVal(val);
        if(scheduledService.checkIfExists(devid,itemid,val)){
            scheduledService.addJob(jobEntity);
            quartzManager.addJob(jobEntity);
        }else{
            scheduledService.updateJob(jobEntity);
            quartzManager.updateJob(jobEntity);
        }

        return "success";
    }

    @ResponseBody
    @RequestMapping(value = "getDeviceJob",method = RequestMethod.GET)
    public String getDeviceJob(String devid,String itemid){
        List<JobEntity> jobEntityList = scheduledService.getJob(devid,itemid);
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("data",jobEntityList);
        return jsonObject.toJSONString();
    }

    /**
     * 添加报修
     * @param payLoad
     * @return
     */
    @ResponseBody
    @RequestMapping(value = "addProjectRepair",method = RequestMethod.POST,produces = "application/json;charset=UTF-8")
    public String addProjectRepair(@RequestBody String payLoad){
        try{
            ProjectRepair projectRepair = JSONObject.parseObject(payLoad,ProjectRepair.class);
            repairService.addRepair(projectRepair);
            return "success";
        }catch (Exception e){
            logger.error("addProjectRepair",e);
            return "fail";
        }
    }

    /**
     * 获取用户填报的维修记录
     * @param openId
     * @return
     */
    @ResponseBody
    @RequestMapping(value = "getUserRepairs", method = RequestMethod.GET)
    public String getUserRepairs(@RequestParam String openId){
        JSONObject jsonObject = repairService.getUserRepairs(openId);
        if(jsonObject == null){
            jsonObject = new JSONObject();
        }
        return jsonObject.toJSONString();
    }

    @ResponseBody
    @RequestMapping(value = "getRepairRecord", method = RequestMethod.GET)
    public String getRepairRecord(@RequestParam Integer repairdId){
        JSONObject jsonObject = repairService.getRepairRecord(repairdId);
        return jsonObject.toJSONString();
    }


}
