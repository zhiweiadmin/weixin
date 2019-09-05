package com.redbudtek.weixin.job;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.redbudtek.weixin.util.ConstantUtil;
import com.redbudtek.weixin.util.HttpUtil;
import com.redbudtek.weixin.util.StringUtil;
import org.apache.log4j.Logger;

/**
 * @author jinxin.zhou
 * @date 2017/6/28
 */
public class AccessJob {

	private static Logger logger = Logger.getLogger(AccessJob.class);
	
	/*微信公众平台api的基地址*/
	private static final String weixin_url = "https://api.weixin.qq.com/cgi-bin/";
	
	/*定时更新access相关value*/
	public void updateAccess(){
//		logger.info("!!!!!!quartz job start.");
//		//获取access_token
//		String url = weixin_url + "token?grant_type=client_credential&appid=" + ConstantUtil.appid + "&secret=" + ConstantUtil.appsecret;
//		String accessTokenResult = HttpUtil.get(url);
//		logger.info(accessTokenResult);
//		JSONObject jobj = JSON.parseObject(accessTokenResult);
//		if(StringUtil.isStrNull(jobj.getString("access_token"))){
//			logger.error("!!!!!!access_token is null, get failed. ");
//			return;
//		}
//		ConstantUtil.access_token = jobj.getString("access_token");
//
//		//获取jsapi_ticket
//		url = weixin_url + "ticket/getticket?access_token=" + ConstantUtil.access_token + "&type=jsapi";
//		String jsapiTicketResult = HttpUtil.get(url);
//		logger.info(jsapiTicketResult);
//		jobj = JSON.parseObject(jsapiTicketResult);
//		if(StringUtil.isStrNull(jobj.getString("ticket"))){
//			logger.error("!!!!!!jsapi_ticket is null, get failed. ");
//			return;
//		}
//		ConstantUtil.jsapi_ticket = jobj.getString("ticket");
//
//		logger.info("!!!!!!quartz job end.");
	}
	
}
