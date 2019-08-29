package com.redbudtek.weixin.util;

import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * 字符串工具类
 * @author jinxin.zhou
 */
public class StringUtil {

	/**
	 * 判断字符串是否为空
	 * @author jinxin.zhou
	 */
	public static boolean isStrNull(String str) {
        boolean bo = false;
        if (str == null || str.trim().length() == 0) {
            return true;
        }
        return bo;
    }

    /**
     * 将日期转换成字符串
     * @author jinxin.zhou
     * @date 2017/2/22
     * @param date
     */
    public static String yyyyMMddHHmmss(Date date){
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        return sdf.format(date);
    }
}
