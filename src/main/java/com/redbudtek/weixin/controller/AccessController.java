package com.redbudtek.weixin.controller;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.redbudtek.weixin.constant.ResultStatus;
import com.redbudtek.weixin.model.TemplateMsgConstant;
import com.redbudtek.weixin.model.alarm.AlarmTemplateMsgFactory;
import com.redbudtek.weixin.service.MapService;
import com.redbudtek.weixin.service.WeixinService;
import com.redbudtek.weixin.util.AESUtils;
import com.redbudtek.weixin.util.ConstantUtil;
import com.redbudtek.weixin.util.StringUtil;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.*;

/**
 * 微信公众号的连接
 * @author jinxin.zhou
 */
@Controller
@RequestMapping("access")
public class AccessController {

	/**
	 * 日志单例对象
	 * @author jinxin.zhou
	 * @date 2017/7/9
	 */
	private static final Logger logger = Logger.getLogger(AccessController.class);

	/**
	 * weixin service单例对象
	 * @author jinxin.zhou
	 * @date 2017/7/9
	 */
	@Autowired
	private WeixinService weixinService;

	/**
	 * 地图 service单例对象
	 * @author jinxin.zhou
	 * @date 2017/7/9
	 */
	@Autowired
	private MapService mapService;

	/**
	 * 返回给前台config微信权限验证配置所需的: nonceStr, appId, timestamp, signature
	 * @author jinxin.zhou
	 * @param token
	 */
	@ResponseBody
	@RequestMapping(value = "configs", method = RequestMethod.GET)
	public String getConfigs(@RequestParam(value="token") String token, @RequestParam(value="url") String url){
		Map<String, Object> map = new LinkedHashMap<String, Object>();
		Map<String, Object> configs = new HashMap<String, Object>();
		configs.put("nonceStr", ConstantUtil.noncestr);
		configs.put("appId", ConstantUtil.appid);
		configs.put("signature", ConstantUtil.updateSignature(url));
		configs.put("timestamp", ConstantUtil.timestamp);
		logger.info(configs.toString());
		map.put("status", ResultStatus.SUCCESS.toString());
		map.put("data", configs);
		return JSON.toJSONString(map);
	}

	/**
	 * 获取用户openId
	 * @author jinxin.zhou
	 * @date 2017/2/15
	 * @param code
	 */
	@ResponseBody
	@RequestMapping(value = "webAuth", method = RequestMethod.GET)
	public String getWebAuth(@RequestParam(value="code") String code){
//		Map<String, Object> map = new LinkedHashMap<String, Object>();
//		logger.info("[code]:" + code);
//		map.put("status", ResultStatus.SUCCESS.toString());
//		map.put("data", weixinService.getOpenId(code));
//		logger.info("retrun str:" + map.toString());
//		return JSON.toJSONString(map);
		Map<String, Object> map = new LinkedHashMap<String, Object>();
		logger.info("[code]:" + code);
		map.put("status", 100);
		map.put("data", "123456");
		logger.info("retrun str:" + map.toString());
		return JSON.toJSONString(map);
	}

	/**
	 * AES加密
	 * @author jinxin.zhou
	 * @date 2017/7/3
	 * @encrypted 待加密
	 */
	@ResponseBody
	@RequestMapping(value = "aes_ecb", method = RequestMethod.GET)
	public String aes_ecb(@RequestParam(value="encrypted") String encrypted){
		Map<String, Object> map = new LinkedHashMap<String, Object>();
		logger.info("encrypted:" + encrypted);
		try {
			map.put("status", ResultStatus.SUCCESS.toString());
			map.put("data", AESUtils.encryptData(encrypted));
		} catch (Exception e) {
			logger.error(e.getMessage());
			map.put("status", ResultStatus.SUCCESS.toString());
			map.put("msg", "加密失败");
		}
		return JSON.toJSONString(map);
	}

	/**
	 * 根据经纬度获取百度地图的定位位置信息
	 * @author jinxin.zhou
	 * @date 2017/7/9
	 * @param longitude 经度
	 * @param latitude 纬度
	 */
	@ResponseBody
	@RequestMapping(value = "location", method = RequestMethod.GET, produces = "application/json; charset=utf-8")
	public String getLocation(@RequestParam(value = "longitude") Double longitude, @RequestParam(value = "latitude") Double latitude){
		Map<String, Object> map = new LinkedHashMap<String, Object>();
		map.put("status", ResultStatus.SUCCESS.toString());
		map.put("data", mapService.getLocation(longitude, latitude));
		return JSON.toJSONString(map);
	}

	@ResponseBody
	@RequestMapping(value = "/alarm", method = RequestMethod.GET)
	public String receiveAlarms(@RequestParam(value="parameter") String parameter){
		Map<String, Object> map = new LinkedHashMap<String, Object>();
		try {
			parameter = URLDecoder.decode(parameter, "utf-8");
		} catch (UnsupportedEncodingException e) {
			logger.error(e.getMessage());
			return JSON.toJSONString(map);
		}
		JSONObject json = JSON.parseObject(parameter);
		Integer deviceId = json.getInteger("deviceId");
		String serialNumber = json.getString("serial_number");
		String deviceName = json.getString("device_name");
		Integer severity = json.getInteger("severity");
		Long htime = json.getLong("htime");
		String itemName = json.getString("item_name");
		String alias = json.getString("alias");
		String ruleName = json.getString("rule_name");
		String alarmDesc = json.getString("alarm_desc");
		JSONArray openIds = json.getJSONArray("openid");
		logger.info("接收到的参数为：");
		logger.info("[deviceId]:" + deviceId);
		logger.info("[serial_number]:" + serialNumber);
		logger.info("[device_name]:" + deviceName);
		logger.info("[severity]:" + severity);
		logger.info("[htime]:" + htime);
		logger.info("[item_name]:" + itemName);
		logger.info("[alias]:" + alias);
		logger.info("[rule_name]:" + ruleName);
		logger.info("[alarm_desc]:" + alarmDesc);
		logger.info("[openid]:" + openIds.toJSONString());
		logger.info("结束.");
		for(Object object : openIds){
			String openId = ((JSONObject)object).getString("weixinId");
			logger.info("ready to send msg to [openid]:" + openId);
			try {
				weixinService.sendTemplateMsg(openId, AlarmTemplateMsgFactory.produce(openId,
						TemplateMsgConstant.ALARM_TEMPLATE_ID, TemplateMsgConstant.TEMPLATE_URL,
						ruleName,
						AlarmTemplateMsgFactory.generateFirst(serialNumber, deviceName, deviceId),
						StringUtil.yyyyMMddHHmmss(new Date(htime)),
						AlarmTemplateMsgFactory.generateRemark(alarmDesc, itemName, alias),
						TemplateMsgConstant.TEMPLATE_COLOR,
						AlarmTemplateMsgFactory.isDone(alarmDesc,alias)));
			} catch (Exception e) {
				logger.error(e.getMessage());
			}
		}
		return JSON.toJSONString(map);
	}

	@ResponseBody
	@RequestMapping(value = "/weixin/bindAccount", method = RequestMethod.GET)
	public String bindAccount(@RequestBody JSONObject jsonObject){
		JSONObject jsonObject1 = new JSONObject();
		jsonObject1.put("status","100");
		jsonObject1.put("data","123456");
		return jsonObject1.toJSONString();
	}

	@ResponseBody
	@RequestMapping(value = "/weixin/associatedLogin", method = RequestMethod.GET)
	public String associatedLogin(@RequestBody JSONObject jsonObject){
		JSONObject jsonObject1 = new JSONObject();
		jsonObject1.put("status","100");
		jsonObject1.put("data","123456");
		return jsonObject1.toJSONString();
	}

}
