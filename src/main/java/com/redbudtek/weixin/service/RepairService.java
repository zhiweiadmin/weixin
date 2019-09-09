package com.redbudtek.weixin.service;

import com.alibaba.fastjson.JSONObject;
import com.redbudtek.weixin.mapper.ProjectRepairMapper;
import com.redbudtek.weixin.mapper.ProjectRepairRecordMapper;
import com.redbudtek.weixin.model.ProjectRepair;
import com.redbudtek.weixin.model.ProjectRepairRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class RepairService {

    @Autowired
    ProjectRepairMapper projectRepairMapper;

    @Autowired
    ProjectRepairRecordMapper projectRepairRecordMapper;

    public void addRepair(ProjectRepair repair){
        projectRepairMapper.insert(repair);
    }

    /**
     * 获取用户维修记录
     * @param weixinId
     * @return
     */
    public JSONObject getUserRepairs(String roleId,String weixinId,String projectId){
        Map<String,Object> param = new HashMap<String,Object>();
        if("2".equals(roleId)){
            param.put("projectId",projectId);
            param.put("weixinId",weixinId);
        }
        List<ProjectRepair> repairList = projectRepairMapper.selectByFields(param);
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("repairList",repairList);
        return jsonObject;
    }

    /**
     * 回复功能
     */
    public void addRepairRecord(ProjectRepairRecord repairRecord){
        projectRepairRecordMapper.insert(repairRecord);
    }

    /**
     * 获取用户单个维修记录的留言信息
     * @param repairId
     * @return
     */
    public JSONObject getRepairRecord(Integer repairId,Integer userType){
        List<ProjectRepairRecord> recordList = projectRepairRecordMapper.selectByRepairId(repairId);
        JSONObject jsonObject = new JSONObject();
        StringBuffer msg = new StringBuffer();
        for(ProjectRepairRecord repairRecord : recordList){
            if(userType == 0){//普通用户
                if(repairRecord.getUserType() == 0){
                    String itemMsg = "<span style='color:blue;word-wrap: break-word;word-break: break-all;overflow: hidden;'>我:"+repairRecord.getMsg()+"</span><br/>";
                    msg.append(itemMsg);
                }else{
                    String itemMsg = "<span style='color:red;word-wrap: break-word;word-break: break-all;overflow: hidden;'>客服:"+repairRecord.getMsg()+"</span><br/>";
                    msg.append(itemMsg);
                }
            }else{//管理员
                if(repairRecord.getUserType() == 0){
                    String itemMsg = "<span style='color:blue;word-wrap: break-word;word-break: break-all;overflow: hidden;'>客户:"+repairRecord.getMsg()+"</span><br/>";
                    msg.append(itemMsg);
                }else{
                    String itemMsg = "<span style='color:red;word-wrap: break-word;word-break: break-all;overflow: hidden;'>管理员:"+repairRecord.getMsg()+"</span><br/>";
                    msg.append(itemMsg);
                }
            }

        }
        jsonObject.put("msg",msg);
        jsonObject.put("phone","15961757187");
        jsonObject.put("username","张三");
        jsonObject.put("reason","原因");
        jsonObject.put("desc","这里是内容");
        jsonObject.put("detail","detail");
        jsonObject.put("time","2019-01-01 12:00:03");
        return jsonObject;
    }

}
