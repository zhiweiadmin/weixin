package com.redbudtek.weixin.controller;

import com.alibaba.fastjson.JSONObject;
import com.redbudtek.weixin.model.ProjectUserAuth;
import com.redbudtek.weixin.service.ProjectAuthService;
import org.apache.log4j.Logger;
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

    private static final Logger logger = Logger.getLogger(ProjectAuthController.class);

    @Autowired
    ProjectAuthService projectAuthService;

    @ResponseBody
    @RequestMapping(value = "/getProjectAuthOri", method = RequestMethod.GET,produces = "application/json;charset=UTF-8")
    public String getProjectAuthOri(@RequestParam String projectId){
        List<ProjectUserAuth> authList = projectAuthService.getAuth(projectId);
        JSONObject jsonObject = new JSONObject();
        if(authList != null && authList.size() > 0){
            ProjectUserAuth auth = authList.get(0);
            jsonObject.put("ctrlAuth",auth.getCtrlAuth());
            jsonObject.put("fkAuth",auth.getFkAuth());
            jsonObject.put("hostAuth",auth.getHostAuth());
        }else{
            jsonObject.put("ctrlAuth",0);
            jsonObject.put("fkAuth",0);
            jsonObject.put("hostAuth",0);
        }
        return jsonObject.toJSONString();
    }

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

    @ResponseBody
    @RequestMapping(value = "/changeUserAuth", method = RequestMethod.GET,produces = "application/json;charset=UTF-8")
    public String changeUserAuth(@RequestParam String projectId,
                                 @RequestParam Integer ctrlAuth,
                                 @RequestParam Integer hostAuth,
                                 @RequestParam Integer fkAuth){
        JSONObject result = new JSONObject();
        result.put("status",100);
        try{
            List<ProjectUserAuth> authList = projectAuthService.getAuth(projectId);
            if(authList != null && authList.size() > 0){
                ProjectUserAuth userAuth = authList.get(0);
                userAuth.setCtrlAuth(ctrlAuth);
                userAuth.setHostAuth(hostAuth);
                userAuth.setFkAuth(fkAuth);
                projectAuthService.update(userAuth);
            }else{
                ProjectUserAuth userAuth = new ProjectUserAuth();
                userAuth.setCtrlAuth(ctrlAuth);
                userAuth.setHostAuth(hostAuth);
                userAuth.setFkAuth(fkAuth);
                projectAuthService.insert(userAuth);
            }
        }catch (Exception e){
            logger.error("changeUserAuth error :" , e);
            result.put("status",200);
        }

        return result.toJSONString();
    }



}
