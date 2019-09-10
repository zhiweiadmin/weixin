package com.redbudtek.weixin.service;


import com.redbudtek.weixin.mapper.ProjectUserAuthMapper;
import com.redbudtek.weixin.model.ProjectUserAuth;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ProjectAuthService {

    @Autowired
    ProjectUserAuthMapper projectUserAuthMapper;

    public List<ProjectUserAuth> getAuth(String projectId){
        Map<String,Object> param = new HashMap<String,Object>();
        param.put("projectId",projectId);
        return projectUserAuthMapper.selectByFields(param);
    }

    public void insert(ProjectUserAuth projectUserAuth){
        projectUserAuthMapper.insert(projectUserAuth);
    }

    public void update(ProjectUserAuth projectUserAuth){
        projectUserAuthMapper.update(projectUserAuth);
    }

}
