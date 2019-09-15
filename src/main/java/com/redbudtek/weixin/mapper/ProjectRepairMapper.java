package com.redbudtek.weixin.mapper;

import com.redbudtek.weixin.model.ProjectRepair;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@Mapper
public interface ProjectRepairMapper {
    int deleteByPrimaryKey(Integer repairId);

    int insert(ProjectRepair record);

    ProjectRepair selectByPrimaryKey(Integer repairId);

    List<ProjectRepair> selectByFields(Map<String,Object> param);

    int getNextId();

    void uploadFile(Map<String,Object> param);

    List<Map<String,Object>> getUploadFiles(Integer repairId);

}