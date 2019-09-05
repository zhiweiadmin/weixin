package com.redbudtek.weixin.quartz;

import com.alibaba.fastjson.JSONObject;
import com.baomidou.mybatisplus.toolkit.StringUtils;
import com.redbudtek.weixin.util.ConstantUtil;
import com.redbudtek.weixin.util.HttpUtil;
import org.quartz.Job;
import org.quartz.JobDetail;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.context.support.SpringBeanAutowiringSupport;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

public class DynamicJobQuartz implements Job{

    private static final Logger LOGGER = LoggerFactory.getLogger(DynamicJobQuartz.class);

    public void execute(JobExecutionContext jobExecutionContext){
        try{
            SpringBeanAutowiringSupport.processInjectionBasedOnCurrentContext(this);
            JobDetail jobDetail = jobExecutionContext.getJobDetail();
            Object val = jobDetail.getJobDataMap().get("val");
            Object devid = jobDetail.getJobDataMap().get("devid");
            Object itemid = jobDetail.getJobDataMap().get("itemid");
            Date date = new Date();
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String now = sdf.format(date);
            if(val == null || devid == null || itemid == null){
                LOGGER.error(now + " 参数不正确");
                return;
            }
            if("1".equals(val.toString())){
                LOGGER.info(now + " 执行了一次开机");
                String token = getAuthToken();
                if(token != null && !"".equals(token)){
                    String url = ConstantUtil.api_url+"control?"+"token="+token+"&hash=test&devid="+devid+"&itemid="+itemid+"&value=1";
                    String result = HttpUtil.put2(url);
                    System.out.println(result);
                    LOGGER.info(result);
                }else{
                    LOGGER.error("token获取失败");
                }

            }else if("0".equals(val.toString())){
                LOGGER.info(now + " 执行了一次关机");
                String token = getAuthToken();
                System.out.println("token为:"+token);
                if(token != null && !"".equals(token)){
                    String url = ConstantUtil.api_url+"control?"+"token="+token+"&hash=test&devid="+devid+"&itemid="+itemid+"&value=0";
                    String result = HttpUtil.put2(url);
                    System.out.println(result);
                    LOGGER.info(result);
                }else{
                    LOGGER.error("token获取失败");
                }

            }
        }catch (Exception e){
            System.out.println("执行定时任务出错!");
            e.printStackTrace();
        }

    }

    public String getAuthToken(){
        Map<String, Object> param = new HashMap<String, Object>();
        param.put("weixin_id", "123456");
        String result = HttpUtil.post(ConstantUtil.api_url+"weixin/associatedLogin", JSONObject.toJSONString(param));
        JSONObject jsonObject = JSONObject.parseObject(result);
        if(jsonObject != null && "100".equals(jsonObject.getString("status"))){
            return jsonObject.getString("data");
        }
        return "";
    }

}