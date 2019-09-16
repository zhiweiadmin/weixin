package com.redbudtek.weixin.model;

import org.apache.log4j.Logger;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

/**
 * @author jinxin.zhou
 * @date 2017/2/22
 */
public class TemplateMsgConstant {

    public static String ALARM_TEMPLATE_ID = "";

    public static final String TEMPLATE_URL = "http://112.126.98.10:8600";

    public static final String TEMPLATE_COLOR = "#000000";

    private static Logger logger = Logger.getLogger(TemplateMsgConstant.class);

    static {
        Properties prop = new Properties();
        InputStream in = TemplateMsgConstant.class.getClassLoader().getResourceAsStream("config.properties");
        try {
            prop.load(in);
            ALARM_TEMPLATE_ID = prop.getProperty("alarm_templateid").trim();
        } catch (IOException e) {
            logger.error(e.getMessage());
        }
    }

}
