package com.redbudtek.weixin;

import com.redbudtek.weixin.job.AccessJob;
import org.apache.log4j.Logger;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.stereotype.Component;

/**
 * @author jinxin.zhou
 * @date 2017/6/27
 */
@Component
public class AppInit implements ApplicationListener<ContextRefreshedEvent> {

    /**
     * 日志单例对象
     * @author jinxin.zhou
     * @date 2017/6/27
     */
    private static Logger logger = Logger.getLogger(AppInit.class);

    /**
     * spring启动后初始化回调
     * @author jinxin.zhou
     * @date 2017/6/27
     */
    //@Override
    public void onApplicationEvent(ContextRefreshedEvent contextRefreshedEvent) {
        logger.info("$$$$$$ ApplicationContext listener start. ");
        if(contextRefreshedEvent.getApplicationContext().getParent() != null){
            logger.info("$$$$$$ WebApplicationContext ok");
            AccessJob accessJob = (AccessJob) contextRefreshedEvent.getApplicationContext().getBean("accessJob");
            accessJob.updateAccess();
        }
        logger.info("$$$$$$ ApplicationContext listener end. ");
    }


}
