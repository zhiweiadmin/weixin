package com.redbudtek.weixin.model.alarm;

import com.redbudtek.weixin.model.MapFactory;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * @author jinxin.zhou
 * @date 2017/2/22
 */
public class AlarmTemplateMsgFactory {

    /**
     * 生产AlarmTemplateMsgPO实例的方法
     * @author jinxin.zhou
     * @date 2017/2/22
     * @param touser
     * @param template_id
     * @param url
     * @param first
     * @param device
     * @param time
     * @param remark
     * @param color
     */
    public static AlarmTemplateMsgPO produce(String touser, String template_id, String url, String first,
                                             String device, String time, String remark, String color,int flag) throws Exception {
        AlarmTemplateMsgPO templateMsgPO = (AlarmTemplateMsgPO) Class.forName(AlarmTemplateMsgPO.class.getName()).newInstance();
        templateMsgPO.setTouser(touser);
        templateMsgPO.setTemplate_id(template_id);
        templateMsgPO.setUrl(url);
        Map<String, Object> dataMap = new LinkedHashMap<String, Object>();
        if(flag==1){
            //已恢复
            first=first+"已恢复";
        }else{
            //未恢复
            first = first;
        }
        dataMap.put("first", MapFactory.produce(first, color));
        dataMap.put("device", MapFactory.produce(device, color));
        dataMap.put("time", MapFactory.produce(time, color));
        dataMap.put("remark", MapFactory.produce(remark, color));
        templateMsgPO.setData(dataMap);
        return templateMsgPO;
    }

    /**
     * 生产AlarmTemplateMsgPO实例的方法
     * @author jinxin.zhou
     * @date 2018/1/19
     * @param touser
     * @param template_id
     * @param url
     * @param first
     * @param keyword1 工程名称
     * @param keyword2 序列号
     * @param keyword3 报警时间
     * @param keyword4 告警数据项
     * @param remark
     * @param color
     */
    public static AlarmTemplateMsgPO produce(String touser, String template_id, String url, String first,
                                             String keyword1, String keyword2, String keyword3, String keyword4,
                                             String remark, String color) throws Exception {
        AlarmTemplateMsgPO templateMsgPO = (AlarmTemplateMsgPO) Class.forName(AlarmTemplateMsgPO.class.getName()).newInstance();
        templateMsgPO.setTouser(touser);
        templateMsgPO.setTemplate_id(template_id);
        templateMsgPO.setUrl(url);
        Map<String, Object> dataMap = new LinkedHashMap<String, Object>();
        dataMap.put("first", MapFactory.produce(first, color));
        dataMap.put("keyword1", MapFactory.produce(keyword1, color));
        dataMap.put("keyword2", MapFactory.produce(keyword2, color));
        dataMap.put("keyword3", MapFactory.produce(keyword3, color));
        dataMap.put("keyword4", MapFactory.produce(keyword4, color));
        dataMap.put("remark", MapFactory.produce(remark, color));
        templateMsgPO.setData(dataMap);
        return templateMsgPO;
    }

    /**
     * 生成first字符串
     * @author jinxin.zhou
     * @date 2017/2/22
     * @param serialNumber
     * @param deviceName
     * @param deviceId
     */
    public static String generateFirst(String serialNumber, String deviceName, Integer deviceId){
        return deviceName+"("+serialNumber+")";
        //return deviceName + "(序列号:" + serialNumber + ",ID:" + deviceId + ")";
    }

    /**
     * 生成remark字符串
     * @author jinxin.zhou
     * @date 2017/2/22
     * @param itemName
     * @param alias
     */
    public static String generateRemark(String alarmDesc, String itemName, String alias){

//        int flag = alarmDesc.indexOf(" ");
//        if(flag!=-1){
//            String content = alarmDesc.substring(0,flag);
//            String text = alarmDesc.substring(flag+1,alarmDesc.length());
//            String time = text.substring(text.indexOf("到")+1,text.lastIndexOf("截止"));
//            return "报警内容："+content+"\n"+"报警恢复："+time+"恢复";
//        }else{
//           return "报警内容："+alarmDesc;
//        }
        int flag =alarmDesc.indexOf(" ");
        if(flag!=-1){
            String content = alarmDesc.substring(0,flag);
            return "报警内容："+content+"恢复正常";
        }else{
            return  "报警内容："+alarmDesc;
        }

    }

    public static int isDone(String alarmDesc, String alias){
        int flag = 0;
        int tmp = alarmDesc.indexOf(" ");
        if(tmp!=-1&&alias!=""){
            //已恢复
            flag = 1;
        }else{
            //未恢复
            flag = 0;
        }
        return flag;
    }

}
