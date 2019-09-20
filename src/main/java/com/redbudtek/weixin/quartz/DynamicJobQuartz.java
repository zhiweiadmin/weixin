package com.redbudtek.weixin.quartz;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.redbudtek.weixin.util.ConstantUtil;
import com.redbudtek.weixin.util.HttpUtil;
import org.apache.log4j.Logger;
import org.quartz.Job;
import org.quartz.JobDetail;
import org.quartz.JobExecutionContext;

import org.springframework.web.context.support.SpringBeanAutowiringSupport;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

public class DynamicJobQuartz implements Job{

    private static Logger logger = Logger.getLogger(QuartzManager.class);

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
                logger.error(now + " 参数不正确");
                return;
            }
            if("1".equals(val.toString())){
                logger.info(now + " 执行了一次开机");
                String token = getAuthToken();
                if(token != null && !"".equals(token)){
                    String url = ConstantUtil.api_url+"control?"+"token="+token+"&hash=test&devid="+devid+"&itemid="+itemid+"&value=1";
                    String result = HttpUtil.put2(url);
                    JSONObject jsonObject = JSON.parseObject(result);
                    logger.info(result);
                    if(!"100".equals(jsonObject.getString("status"))){
                        //重试3次
                        for(int i=0;i<3;i++){
                            String result1 = HttpUtil.put2(url);
                            logger.info("执行第"+(i+1)+"次重试，请求结果为:"+result1);
                        }
                    }
                }else{
                    logger.error("token获取失败");
                }

            }else if("0".equals(val.toString())){
                logger.info(now + " 执行了一次关机");
                String token = getAuthToken();
                System.out.println("token为:"+token);
                if(token != null && !"".equals(token)){
                    String url = ConstantUtil.api_url+"control?"+"token="+token+"&hash=test&devid="+devid+"&itemid="+itemid+"&value=0";
                    String result = HttpUtil.put2(url);
                    JSONObject jsonObject = JSON.parseObject(result);
                    logger.info(result);
                    if(!"100".equals(jsonObject.getString("status"))){
                        //重试3次
                        for(int i=0;i<3;i++){
                            String result1 = HttpUtil.put2(url);
                            logger.info("执行第"+(i+1)+"次重试，请求结果为:"+result1);
                        }
                    }
                }else{
                    logger.error("token获取失败");
                }

            }
        }catch (Exception e){
            logger.error("执行定时任务出错",e);
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