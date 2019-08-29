package com.redbudtek.weixin.util;

import com.alibaba.fastjson.JSONObject;
import com.redbudtek.weixin.model.JobEntity;
import com.redbudtek.weixin.quartz.ScheduleJob;
import com.redbudtek.weixin.service.ScheduledService;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class JobTest extends BaseTest{

    /** 计划任务map */
    private static Map<String, ScheduleJob> jobMap = new HashMap<String, ScheduleJob>();

    static {
        for (int i = 0; i < 5; i++) {
            ScheduleJob job = new ScheduleJob();
            job.setJobId("10001" + i);
            job.setJobName("data_import" + i);
            job.setJobGroup("dataWork");
            job.setJobStatus("1");
            job.setCronExpression("0/5 * * * * ?");
            job.setDesc("数据导入任务");
            addJob(job);
        }
    }

    /**
     * 添加任务
     * @param scheduleJob
     */
    public static void addJob(ScheduleJob scheduleJob) {
        jobMap.put(scheduleJob.getJobGroup() + "_" + scheduleJob.getJobName(), scheduleJob);
    }

    @Autowired
    ScheduledService scheduledService;

    @Test
    public void getAllJob(){
        List<JobEntity> list = scheduledService.getActiveJobs(1);
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("list",list);
        System.out.println(jsonObject.toJSONString());
    }

}
