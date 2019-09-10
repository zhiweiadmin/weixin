package com.redbudtek.weixin.controller;

import com.alibaba.fastjson.JSONObject;
import com.redbudtek.weixin.model.ProjectUserAuth;
import com.redbudtek.weixin.service.ProjectAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

@Controller
@RequestMapping("auth")
public class ProjectAuthController {

    @Autowired
    ProjectAuthService projectAuthService;

    @ResponseBody
    @RequestMapping(value = "/getProjectAuth", method = RequestMethod.GET,produces = "application/json;charset=UTF-8")
    public String getProjectAuth(@RequestParam String projectId){
        List<ProjectUserAuth> authList = projectAuthService.getAuth(projectId);
        JSONObject jsonObject = new JSONObject();
        if(authList != null && authList.size() > 0){
            ProjectUserAuth auth = authList.get(0);
            if(auth.getCtrlAuth() == 0){
                jsonObject.put("fkAuth",0);
                jsonObject.put("hostAuth",0);
            }else{
                jsonObject.put("fkAuth",auth.getFkAuth()==null?0:auth.getFkAuth());
                jsonObject.put("hostAuth",auth.getHostAuth()==null?0:auth.getHostAuth());
            }
        }else{
            jsonObject.put("fkAuth",0);
            jsonObject.put("hostAuth",0);
        }
        return jsonObject.toJSONString();
    }

}
