package com.redbudtek.weixin.model.alarm;

import java.util.Map;

/**
 * @author jinxin.zhou
 * @date 2017/2/16
 */
public class AlarmTemplateMsgPO {

    private String touser;

    private String template_id;

    private String url;

    private Map<String, Object> data;

    public String getTouser() {
        return touser;
    }

    public void setTouser(String touser) {
        this.touser = touser;
    }

    public String getTemplate_id() {
        return template_id;
    }

    public void setTemplate_id(String template_id) {
        this.template_id = template_id;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
      //  this.url = url;
    }

    public Map<String, Object> getData() {
        return data;
    }

    public void setData(Map<String, Object> data) {
        this.data = data;
    }

    @Override
    public String toString() {
/*        return "AlarmTemplateMsgPO{" +
                "touser='" + touser + '\'' +
                ", template_id='" + template_id + '\'' +
                ", url='" + url + '\'' +
                ", data=" + data +
                '}';*/
         return "AlarmTemplateMsgPO{"+
                 "touser='"+touser+'\''+
                 ",template_id='"+template_id+'\''+
                 ",data="+data+
             '}';
    }

    public AlarmTemplateMsgPO() {
    }
}
