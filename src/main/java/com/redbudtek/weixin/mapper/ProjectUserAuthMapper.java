package com.redbudtek.weixin.mapper;

import com.redbudtek.weixin.model.ProjectUserAuth;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@Mapper
public interface ProjectUserAuthMapper {

    int insert(ProjectUserAuth projectUserAuth);

    int update(ProjectUserAuth projectUserAuth);

    List<ProjectUserAuth> selectByFields(Map<String,Object> param);

}
