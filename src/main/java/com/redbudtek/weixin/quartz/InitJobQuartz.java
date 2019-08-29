package com.redbudtek.weixin.quartz;

import com.redbudtek.weixin.model.JobEntity;
import com.redbudtek.weixin.service.ScheduledService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

/**
 * 项目启动执行一次
 */
public class InitJobQuartz {

    private static final Logger LOGGER = LoggerFactory.getLogger(InitJobQuartz.class);

    @Autowired
    ScheduledService scheduledService;

    @Autowired
    QuartzManager quartzManager;

    private static final Integer ACTIVE = 1;

    public void execute(){
//        List<JobEntity> jobList = scheduledService.getActiveJobs(ACTIVE);
//        for(JobEntity jobEntity : jobList){
//            try{
//                String jobName = "JOB_NAME_"+jobEntity.getJobId();
//                String triName = "TRI_NAME_"+jobEntity.getJobId();
//                quartzManager.addJob(jobName,triName,DynamicJobQuartz.class,jobEntity.getPowerStatus(),jobEntity.getCronTime());
//            }catch (Exception e){
//                LOGGER.error("初始化动态创建定时任务失败",e);
//                e.printStackTrace();
//            }
//        }
        System.out.println("123");
    }

}
