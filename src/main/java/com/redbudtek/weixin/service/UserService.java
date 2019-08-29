package com.redbudtek.weixin.service;

import com.redbudtek.weixin.mapper.UserEntityMapper;
import com.redbudtek.weixin.model.UserEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    UserEntityMapper userDao;

    public List<UserEntity> getAllUsers() {
        return userDao.getAllUsers();
    }

}
