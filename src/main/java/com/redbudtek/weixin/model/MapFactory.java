package com.redbudtek.weixin.model;

import java.util.HashMap;

/**
 * @author jinxin.zhou
 * @date 2017/2/22
 */
public class MapFactory {

    /**
     * 生产map实例
     * @author jinxin.zhou
     * @date 2017/2/22
     * @param value
     * @param color
     */
    public static HashMap<String, String> produce(String value, String color){
        HashMap<String, String> map = new HashMap<String, String>();
        map.put("value", value);
        map.put("color", color);
        return map;
    }
}
