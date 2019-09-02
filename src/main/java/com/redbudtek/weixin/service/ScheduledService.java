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

}
