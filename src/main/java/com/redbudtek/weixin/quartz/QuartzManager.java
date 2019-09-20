package com.redbudtek.weixin.quartz;

import com.redbudtek.weixin.model.JobEntity;
import org.apache.log4j.Logger;
import org.quartz.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * 定时任务动态加载
 * @author WANGJING
 */
@Component
public class QuartzManager {

    private static Logger logger = Logger.getLogger(QuartzManager.class);

    /**
     * 调度工厂
     */
    @Autowired
    private SchedulerFactory schedulerFactory;

    public void addJob(JobEntity jobEntity){
        String jobKey = jobEntity.getDevid()+"_"+jobEntity.getItemid()+"_"+jobEntity.getVal();
        String jobName = "JOB_NAME_"+jobKey;
        String triName = "TRI_NAME_"+jobKey;
        addJob(jobName,triName,DynamicJobQuartz.class,jobEntity);
    }
    public void removeJob(JobEntity jobEntity){
        String jobKey = jobEntity.getDevid()+"_"+jobEntity.getItemid()+"_"+jobEntity.getVal();
        String jobName = "JOB_NAME_"+jobKey;
        String triName = "TRI_NAME_"+jobKey;
        removeJob(jobName,Constants.JOB_GROUP_NAME,triName,Constants.TRIGGER_GROUP_NAME);
    }

    public void updateJob(JobEntity jobEntity){
        String jobKey = jobEntity.getDevid()+"_"+jobEntity.getItemid()+"_"+jobEntity.getVal();
        String triName = "TRI_NAME_"+jobKey;
        modifyJobTime(triName,jobEntity.getCronTime());
    }

    /**
     * @Description: 添加一个定时任务
     *
     * @param jobName 任务名 同组中的任务名不能重复
     * @param triggerName 触发器名 同组中的触发器名不能重复
     * @param jobClass  任务
     * @param ，参考quartz说明文档
     * val 开关机状态
     */
    @SuppressWarnings({ "unchecked", "rawtypes" })
    public void addJob(String jobName, String triggerName,Class jobClass,JobEntity jobEntity) {
        try {
            Scheduler scheduled = schedulerFactory.getScheduler();
            // 任务名，任务组，任务执行类
            JobDetail jobDetail= JobBuilder.newJob(jobClass).withIdentity(jobName, Constants.JOB_GROUP_NAME).build();
            jobDetail.getJobDataMap().put("val",jobEntity.getVal());
            jobDetail.getJobDataMap().put("itemid",jobEntity.getItemid());
            jobDetail.getJobDataMap().put("devid",jobEntity.getDevid());
            // 触发器
            TriggerBuilder<Trigger> triggerBuilder = TriggerBuilder.newTrigger();
            // 触发器名,触发器组
            triggerBuilder.withIdentity(triggerName, Constants.TRIGGER_GROUP_NAME);
            //使用这句可以防止定时器弥补
            triggerBuilder.startNow();
            // 触发器时间设定,不触发立即执行,等待下次Cron触发频率到达时刻开始按照Cron频率依次执行
            triggerBuilder.withSchedule(CronScheduleBuilder.cronSchedule(jobEntity.getCronTime()).withMisfireHandlingInstructionDoNothing());
            // 创建Trigger对象
            CronTrigger trigger = (CronTrigger) triggerBuilder.build();
            // 调度容器设置JobDetail和Trigger
            scheduled.scheduleJob(jobDetail, trigger);
            // 启动
            if (!scheduled.isShutdown()) {
                scheduled.start();
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException(e);
        }
    }

    /**
     * @param triggerName      触发器名
     * @param cron             时间设置，参考quartz说明文档
     * @Description: 修改一个任务的触发时间
     */
    public void modifyJobTime(String triggerName, String cron) {
        try {
            Scheduler sched = schedulerFactory.getScheduler();
            TriggerKey triggerKey = TriggerKey.triggerKey(triggerName, Constants.TRIGGER_GROUP_NAME);
            CronTrigger trigger = (CronTrigger) sched.getTrigger(triggerKey);
            if (trigger == null) {
                return;
            }
            String oldTime = trigger.getCronExpression();
            if (!oldTime.equalsIgnoreCase(cron)) {
                /** 方式一 ：调用 rescheduleJob 开始 */
                // 触发器
                TriggerBuilder<Trigger> triggerBuilder = TriggerBuilder.newTrigger();
                // 触发器名,触发器组
                triggerBuilder.withIdentity(triggerName, Constants.TRIGGER_GROUP_NAME);
                triggerBuilder.startNow();
                // 触发器时间设定
                triggerBuilder.withSchedule(CronScheduleBuilder.cronSchedule(cron).withMisfireHandlingInstructionDoNothing());
                // 创建Trigger对象
                trigger = (CronTrigger) triggerBuilder.build();
                // 方式一 ：修改一个任务的触发时间
                sched.rescheduleJob(triggerKey, trigger);
                /** 方式一 ：调用 rescheduleJob 结束 */
                /** 方式二：先删除，然后在创建一个新的Job  */
                /*JobDetail jobDetail = sched.getJobDetail(JobKey.jobKey(jobName, jobGroupName));
                Class<? extends Job> jobClass = jobDetail.getJobClass();
                removeJob(jobName, jobGroupName, triggerName, triggerGroupName);
                addJob(jobName, jobGroupName, triggerName, triggerGroupName, jobClass, cron);*/
                /** 方式二 ：先删除，然后在创建一个新的Job */
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * @Description: 移除一个任务
     *
     * @param jobName
     * @param jobGroupName
     * @param triggerName
     * @param triggerGroupName
     */
    public void removeJob(String jobName, String jobGroupName,
                                 String triggerName, String triggerGroupName) {
        try {
            Scheduler sched = schedulerFactory.getScheduler();

            TriggerKey triggerKey = TriggerKey.triggerKey(triggerName, triggerGroupName);
            // 停止触发器
            sched.pauseTrigger(triggerKey);
            // 移除触发器
            sched.unscheduleJob(triggerKey);
            // 删除任务
            sched.deleteJob(JobKey.jobKey(jobName, jobGroupName));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * @Description:启动所有定时任务
     */
    public void startJobs() {
        try {
            Scheduler sched = schedulerFactory.getScheduler();
            sched.start();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * @Description:关闭所有定时任务
     */
    public void shutdownJobs() {
        try {
            Scheduler sched = schedulerFactory.getScheduler();
            if (!sched.isShutdown()) {
                sched.shutdown();
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

}