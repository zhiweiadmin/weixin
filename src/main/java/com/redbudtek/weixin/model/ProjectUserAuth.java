package com.redbudtek.weixin.model;

import java.util.Date;

public class ProjectUserAuth {

    private Integer id;

    private String projectId;

    private Integer userType;

    private Integer ctrlAuth;

    private Integer hostAuth;

    private Integer fkAuth;

    private Date createDttm;

    private Date updateDttm;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public Integer getUserType() {
        return userType;
    }

    public void setUserType(Integer userType) {
        this.userType = userType;
    }

    public Integer getCtrlAuth() {
        return ctrlAuth;
    }

    public void setCtrlAuth(Integer ctrlAuth) {
        this.ctrlAuth = ctrlAuth;
    }

    public Integer getHostAuth() {
        return hostAuth;
    }

    public void setHostAuth(Integer hostAuth) {
        this.hostAuth = hostAuth;
    }

    public Integer getFkAuth() {
        return fkAuth;
    }

    public void setFkAuth(Integer fkAuth) {
        this.fkAuth = fkAuth;
    }

    public Date getCreateDttm() {
        return createDttm;
    }

    public void setCreateDttm(Date createDttm) {
        this.createDttm = createDttm;
    }

    public Date getUpdateDttm() {
        return updateDttm;
    }

    public void setUpdateDttm(Date updateDttm) {
        this.updateDttm = updateDttm;
    }
}

