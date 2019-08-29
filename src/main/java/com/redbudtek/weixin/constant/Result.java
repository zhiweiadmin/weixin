package com.redbudtek.weixin.constant;

public class Result {

    private Integer code;

    private String msg;

    private Object data;

    public Result(){
        code = 200;
    }

    public Result success(){
        code = 200;
        return this;
    }

    public Result fail(){
        code = 400;
        return this;
    }

    public Result setMsg(String msg){
        this.msg = msg;
        return this;
    }

    public Result setData(Object object){
        this.data = object;
        return this;
    }

}
