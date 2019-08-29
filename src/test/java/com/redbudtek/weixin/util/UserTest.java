package com.redbudtek.weixin.util;

import com.alibaba.fastjson.JSONObject;
import com.redbudtek.weixin.model.UserEntity;
import com.redbudtek.weixin.service.UserService;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

public class UserTest extends BaseTest{

    @Autowired
    UserService userService;

    @Test
    public void getAllUser(){
        List<UserEntity> userList =  userService.getAllUsers();
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("list",userList);
        System.out.println(jsonObject.toJSONString());
    }

}
