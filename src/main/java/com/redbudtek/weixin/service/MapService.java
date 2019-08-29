package com.redbudtek.weixin.service;

import com.redbudtek.weixin.util.ConstantUtil;
import com.redbudtek.weixin.util.HttpUtil;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Service;

/**
 * 地图
 * @author jinxin.zhou
 * @date 2017/7/9
 */
@Service
public class MapService {

    /**
     * 日志单例对象
     * @author jinxin.zhou
     * @date 2017/7/9
     */
    private static final Logger logger = Logger.getLogger(MapService.class);

    /**
     * 根据经纬度获取地点位置
     * @author jinxin.zhou
     * @date 2017/7/9
     * @param longitude
     * @param latitude
     */
    public String getLocation(Double longitude, Double latitude){
        String result = HttpUtil.get(ConstantUtil.baidu_map_url + "?ak=" + ConstantUtil.baidu_map_ak +
            "&callback=renderReverse&location=" + latitude.toString() + "," + longitude.toString() + "&output=json&pois=1");
        logger.info("baidu map api return result:");
        logger.info(result);
        return result;
    }
}
