package com.redbudtek.weixin.service;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.redbudtek.weixin.util.ConstantUtil;
import com.redbudtek.weixin.util.HttpUtil;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @author jinxin.zhou
 * @date 2017/7/4
 */
@Service
public class DeviceService {

    private static final Logger logger = Logger.getLogger(DeviceService.class);

    /**
     * 获取设备列表
     * @author jinxin.zhou
     * @date 2017/7/10
     * @param token
     * @param page
     * @param perPage
     * @param flagAttrName
     * @param active
     * @param serialNumber
     * @param condition
     */
    public String getDeviceInfoList_extend(String token, Integer page, Integer perPage, String flagAttrName, Integer active,
                                           String serialNumber, Integer condition){
        logger.info("token:" + token);
        logger.info("page:" + page);
        logger.info("perPage:" + perPage);
        logger.info("flagAttrName:" + flagAttrName);
        logger.info("active:" + active);
        logger.info("serialNumber:" + serialNumber);
        logger.info("condition:" + condition);
        String result = HttpUtil.get(ConstantUtil.api_url + "deviceInfo/list?token=" +
                token + "&page=" + page + "&perPage=" + perPage + "&active="
                + active + "&serialNumber=" + serialNumber + "&condition=" + (condition == null?"":condition));
        logger.info(result);
        /**
         * 构造参数
         * @author jinxin.zhou
         * @date 2017/7/10
         */
        List<Integer> deviceIdList = new ArrayList<Integer>();
        JSONObject resultObj = JSONObject.parseObject(result);
        JSONObject dataObj = resultObj.getJSONObject("result");
        JSONArray devices = dataObj.getJSONArray("data");
        if(devices != null && devices.size() > 0) {
            for (int i = 0; i < devices.size(); i++) {
                JSONObject device = devices.getJSONObject(i);
                Integer deviceId = device.getInteger("deviceId");
                deviceIdList.add(deviceId);
            }
            Map<String, Object> param = new HashMap<String, Object>();
            param.put("token", token);
            param.put("deviceIds", deviceIdList);
            logger.info(JSONObject.toJSONString(param));

            /**
             * 获取用户列表
             * @author jinxin.zhou
             * @date 2017/7/10
             */
            result = HttpUtil.post(ConstantUtil.api_url + "userDevice/getUsersByDeviceIds", JSONObject.toJSONString(param));
            logger.info(result);
            JSONObject resultObj2 = JSONObject.parseObject(result);
            JSONArray userList = resultObj2.getJSONArray("data");
            resultObj.put("userList", JSON.toJSONString(userList));
        }
        return JSONObject.toJSONString(resultObj);
    }
    //根据变量组IDs获取实时数据
    public String get_vdevice_current_data(String token,String page,String perPage,String projectId,String vdeviceIds){
          JSONArray json_ary = JSONArray.parseArray(vdeviceIds);
          JSONObject res = new JSONObject();
          JSONArray result_ary = new JSONArray();
          for(int i=0;i<json_ary.size();i++){
              JSONObject obj = json_ary.getJSONObject(i);
              String vname = obj.getString("vname");
              String vid = obj.getString("vid");
              String result = "";
              result = HttpUtil.get(ConstantUtil.api_url+"project/currentItemData?token="+token+"&vdeviceIds="+vid+
                                                      "&page="+1+"&perPage="+perPage+"&projectId="+projectId);
              JSONObject jsonObject = JSONObject.parseObject(result);
              //遍历结果
              String res_length = jsonObject.getJSONObject("result").getJSONObject("pageInfo").getString("total");
              JSONArray array = new JSONArray();
              if("6".equals(res_length)){
                  JSONArray data = jsonObject.getJSONObject("result").getJSONArray("data");
                  Map<String,Object> map = new HashMap<String, Object>();
                  for(int j = 0;j < data.size(); j++){
                      Map<String,Object> map_data = new HashMap<String, Object>();
                      JSONObject data_obj = data.getJSONObject(j);
                      map_data.put("alias",data_obj.getString("alias"));
                      map_data.put("itemid",data_obj.getString("itemid"));
                      map_data.put("itemname",data_obj.getString("itemname"));
                      map_data.put("val",data_obj.getString("val"));
                      map_data.put("devid",data_obj.getString("devid"));
                      map_data.put("vdeviceName",data_obj.getString("vdeviceName"));
                      array.add(map_data);
                  }
                  map.put("name",vname);
                  map.put("id",vid);
                  map.put("items",array);
                  result_ary.add(map);
              }
          }
          res.put("data",result_ary);
        return JSONObject.toJSONString(res);
    }



}
