package com.redbudtek.weixin.quartz;

import com.redbudtek.weixin.util.ConstantUtil;
import com.redbudtek.weixin.util.HttpUtil;
import org.quartz.Job;
import org.quartz.JobDetail;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.context.support.SpringBeanAutowiringSupport;

public class DynamicJobQuartz implements Job{

    private static final Logger LOGGER = LoggerFactory.getLogger(DynamicJobQuartz.class);

    public void execute(JobExecutionContext jobExecutionContext){
        SpringBeanAutowiringSupport.processInjectionBasedOnCurrentContext(this);
        JobDetail jobDetail = jobExecutionContext.getJobDetail();
        Integer val = (Integer) jobDetail.getJobDataMap().get("val");
        Object devid = jobDetail.getJobDataMap().get("devid");
        Object itemid = jobDetail.getJobDataMap().get("itemid");
        Object token = jobDetail.getJobDataMap().get("token");
        if(val == 1){
            System.out.println(jobDetail.getKey().getName()+"执行了定时开机--------");
            HttpUtil.get(ConstantUtil.api_url+"control?token="+token+"&devid="+devid+
                    "&itemid="+itemid+"&value=1");
        }else if(val == 0){
            System.out.println(jobDetail.getKey().getName()+"执行了定时关机--------");
            HttpUtil.get(ConstantUtil.api_url+"control?token="+token+"&devid="+devid+
                    "&itemid="+itemid+"&value=0");
        }
    }
}