package com.redbudtek.weixin.quartz;

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
        Integer powerStatus = (Integer) jobDetail.getJobDataMap().get("val");
        if(powerStatus == 1){
            System.out.println(jobDetail.getKey().getName()+"正在定时开机--------");
        }else if(powerStatus == 0){
            System.out.println(jobDetail.getKey().getName()+"正在定时关机--------");
        }
    }
}