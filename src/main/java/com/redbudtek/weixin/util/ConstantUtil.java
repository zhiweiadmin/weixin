package com.redbudtek.weixin.util;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import org.apache.log4j.Logger;

/**
 * 常量工具类
 * @author jinxin.zhou
 */
public class ConstantUtil {

	/*access_token: 公众号的全局唯一票据，有效时间7200秒（2小时），GET方式获取*/
	public static String access_token = null;
	
	/*jsapi_ticket: 公众号调用微信js接口的临时票据，有效时间7200秒（2小时），GET方式获取*/
	public static String jsapi_ticket = null;
	
	/*随机字符串: 用作签名加密*/
	public static final String noncestr = "LOdISAOaystYyUq4";
	
	/*appid: 微信的appid*/
	public static String appid = null;
	
	/*appsecret: 微信的appsecret*/
	public static String appsecret = null;
	
	/*时间戳*/
	public static int timestamp;

	/*云平台API地址*/
	public static String api_url = null;

	/*百度地图API地址*/
	public static String baidu_map_url = null;

	/*百度地图APi ak*/
	public static String baidu_map_ak = null;

	/**
	 * 日志单例对象
	 * @author jinxin.zhou
	 * @date 2017/7/9
	 */
	private static Logger logger = Logger.getLogger(ConstantUtil.class);
	
	/**
	 * 读取配置文件
	 * @author jinxin.zhou
	 * @date 2017/7/9
	 */
	static{
		Properties prop = new Properties();
		InputStream in = ConstantUtil.class.getClassLoader().getResourceAsStream("config.properties");
		try {
			prop.load(in);
			appid = prop.getProperty("appid").trim();
			appsecret = prop.getProperty("appsecret").trim();
			api_url = prop.getProperty("api_url").trim();
			baidu_map_url = prop.getProperty("baidu_map_url").trim();
			baidu_map_ak = prop.getProperty("baidu_map_ak").trim();
			AESUtils.HEX_KEY = prop.getProperty("aes_key").trim();
		} catch (IOException e) {
			logger.error(e.getMessage());
		}
	}	
	
	/**
	 * 生成签名，sha1安全哈希算法
	 * @author jinxin.zhou
	 * @date 2017/7/9
	 */
	public static String updateSignature(String url){
		timestamp = (int)(System.currentTimeMillis()/1000);
		StringBuffer decrypt = new StringBuffer();
		logger.info("jsapi_ticket=" + jsapi_ticket);
		logger.info("noncestr=" + noncestr);
		logger.info("timestamp=" + timestamp);
		logger.info("url=" + url);
		decrypt.append("jsapi_ticket=" + jsapi_ticket);
		decrypt.append("&noncestr=" + noncestr);
		decrypt.append("&timestamp=" + timestamp);
		decrypt.append("&url=" + url);
		return EncryptDecryptUtil.sha1(decrypt.toString());
	}
}
