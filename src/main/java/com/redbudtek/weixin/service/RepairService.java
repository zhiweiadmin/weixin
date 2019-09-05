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
    public JSONObject getUserRepairs(String weixinId){
        Map<String,Object> param = new HashMap<String,Object>();
        param.put("weixinId",weixinId);
        List<ProjectRepair> repairList = projectRepairMapper.selectByFields(param);
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("repairList",repairList);
        return jsonObject;
    }

    /**
     * 获取用户单个维修记录的留言信息
     * @param repairId
     * @return
     */
    public JSONObject getRepairRecord(Integer repairId){
        List<ProjectRepairRecord> recordList = projectRepairRecordMapper.selectByRepairId(repairId);
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("recordList",recordList);
        return jsonObject;
    }

}
