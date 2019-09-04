package com.redbudtek.weixin.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletResponse;

@Controller
@RequestMapping("/")
public class WxConfigController {

    @ResponseBody
    @RequestMapping(value = "MP_verify_4wf1jx1Zm7trmRTW.txt",method = RequestMethod.GET)
    private String returnConfigFile(HttpServletResponse response) {
        return "4wf1jx1Zm7trmRTW";
    }

}
