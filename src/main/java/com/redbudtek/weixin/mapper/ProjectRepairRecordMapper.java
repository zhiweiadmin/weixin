package com.redbudtek.weixin.mapper;


import com.redbudtek.weixin.model.ProjectRepairRecord;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@Mapper
public interface ProjectRepairRecordMapper {
    int deleteByPrimaryKey(Integer recordId);

    int insert(ProjectRepairRecord record);

    int insertSelective(ProjectRepairRecord record);

    ProjectRepairRecord selectByPrimaryKey(Integer recordId);

    List<ProjectRepairRecord> selectByRepairId(Integer repairId);

    int updateByPrimaryKeySelective(ProjectRepairRecord record);

    int updateByPrimaryKey(ProjectRepairRecord record);


}