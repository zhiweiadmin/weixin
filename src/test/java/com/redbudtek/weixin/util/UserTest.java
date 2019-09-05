package com.redbudtek.weixin.util;

import com.alibaba.fastjson.JSONObject;
import com.redbudtek.weixin.mapper.ProjectRepairMapper;
import com.redbudtek.weixin.mapper.ProjectRepairRecordMapper;
import com.redbudtek.weixin.model.ProjectRepair;
import com.redbudtek.weixin.model.ProjectRepairRecord;
import com.redbudtek.weixin.model.UserEntity;
import com.redbudtek.weixin.service.UserService;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class UserTest extends BaseTest{

    @Autowired
    UserService userService;

    @Autowired
    ProjectRepairMapper projectRepairMapper;

    @Autowired
    ProjectRepairRecordMapper projectRepairRecordMapper;

    @Test
    public void getAllUser(){
        List<UserEntity> userList =  userService.getAllUsers();
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("list",userList);
        System.out.println(jsonObject.toJSONString());
    }

    @Test
    public void addProjectRepair(){
        ProjectRepair repair = new ProjectRepair();
        repair.setProjectId("12");
        repair.setWeixinId("123456");
        repair.setPhone("15961757187");
        repair.setReason("開不了機器");
        repair.setRepairDesc("描述");
        repair.setUpdateDttm(new Date());
        repair.setCreateDttm(new Date());
        repair.setUserName("jiangzhiwei");
        projectRepairMapper.insert(repair);
    }

    @Test
    public void selectByPrimaryKey(){
        Map<String,Object> param = new HashMap<String, Object>();
        param.put("weixinId","123456");
        List<ProjectRepair> repair = projectRepairMapper.selectByFields(param);
        System.out.println(repair.toString());
    }

    @Test
    public void addProjectRepairRecord(){
        ProjectRepairRecord repair = new ProjectRepairRecord();
        repair.setWeixinId("123456");
        repair.setUpdateDttm(new Date());
        repair.setCreateDttm(new Date());
        repair.setMsg("這是回復");
        repair.setUserType(0);
        repair.setRepairId(1);
        projectRepairRecordMapper.insert(repair);
    }

    @Test
    public void select(){
        List<ProjectRepairRecord> list = projectRepairRecordMapper.selectByRepairId(1);
        System.out.println(list);
    }

}
