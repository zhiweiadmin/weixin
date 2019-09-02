package com.redbudtek.weixin.mapper;

import com.redbudtek.weixin.model.JobEntity;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@Mapper
public interface ScheduledMapper {

    int insert(JobEntity jobEntity);

    int update(JobEntity jobEntity);

    List<JobEntity> selectJobByFields(Map<String,Object> param);

}
