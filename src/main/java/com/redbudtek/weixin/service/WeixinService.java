package com.redbudtek.weixin.service;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.redbudtek.weixin.util.ConstantUtil;
import com.redbudtek.weixin.util.HttpUtil;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Service;

/**
 * @author jinxin.zhou
 * @date 2017/6/28
 */
@Service
public class WeixinService {

    private static final Logger logger = Logger.getLogger(WeixinService.class);

    private static final String OAUTH = "https://api.weixin.qq.com/sns/oauth2";

    private static final String SEND_MSG = "https://api.weixin.qq.com/cgi-bin/message/template/send";

    /**
     * 获取openId
     * @author jinxin.zhou
     * @date 2017/2/15
     * @param code
     */
    public String getOpenId(String code){
        String result = HttpUtil.get(OAUTH + "/access_token?appid=" + ConstantUtil.appid + "&secret=" + ConstantUtil.appsecret +
                "&code=" + code + "&grant_type=authorization_code");
        logger.info(result);
        JSONObject obj = JSON.parseObject(result);
        return obj.getString("openid");
    }

    /**
     * 发送模版消息
     * @author jinxin.zhou
     * @date 2017/2/22
     * @param openId
     * @param templateMsgPO
     */
    public void sendTemplateMsg(String openId, Object templateMsgPO){
        logger.info("send msg to [openId]:" + openId + ";[params]:" + JSON.toJSONString(templateMsgPO));
        String result = HttpUtil.post(SEND_MSG + "?access_token=" + ConstantUtil.access_token, JSON.toJSONString(templateMsgPO));
        logger.info(result);
        logger.info(".");
    }

}
