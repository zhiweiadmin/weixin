package com.redbudtek.weixin.controller;

import com.alibaba.fastjson.JSONObject;
import com.redbudtek.weixin.constant.Result;
import com.redbudtek.weixin.model.UserEntity;
import com.redbudtek.weixin.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

@Controller
@RequestMapping("user")
public class UserController {

    @Autowired
    UserService userService;

    @ResponseBody
    @RequestMapping(value = "all",method = RequestMethod.GET)
    public Result all(){
        List<UserEntity> userEntityList = userService.getAllUsers();
        Result result = new Result();
        result.setData(userEntityList);
        return result;
    }

}
