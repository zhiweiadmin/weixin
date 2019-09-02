package com.redbudtek.weixin.service;

import com.redbudtek.weixin.mapper.ScheduledMapper;
import com.redbudtek.weixin.model.JobEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ScheduledService {

    @Autowired
    ScheduledMapper scheduledMapper;

    public List<JobEntity> getActiveJobs(Integer jobStatus){
        Map<String,Object> param = new HashMap<String,Object>();
        param.put("jobStatus",jobStatus);
        return scheduledMapper.selectJobByFields(param);
    }

    public void addJob(JobEntity jobEntity){
        scheduledMapper.insert(jobEntity);
    }

    public void updateJob(JobEntity jobEntity){
        scheduledMapper.update(jobEntity);
    }

    public List<JobEntity> getJob(String devid,String itemid){
        Map<String,Object> param = new HashMap<String,Object>();
        param.put("devid",devid);
        param.put("itemid",itemid);
        return scheduledMapper.selectJobByFields(param);
    }

    public boolean checkIfExists(String devid,String itemid,String val){
        Map<String,Object> param = new HashMap<String,Object>();
        param.put("devid",devid);
        param.put("itemid",itemid);
        param.put("val",val);
        List<JobEntity> list = scheduledMapper.selectJobByFields(param);
        if(list == null && list.size() == 0){
            return true;
        }
        return false;
    }

}
