define([
    'toolbox'
    ], function(ToolBox){

    //获取微信openId
    var getWeixinOpenId = function(){
        var code = ToolBox.getParam('code');
        if(typeof code != 'string'){
            location.href = 'error.html?' + $.param({
                msg: '02'
            });
            return false;
        }
        ToolBox.ajax({
            type: 'get',
            url: '/access/webAuth',
            local: true,
            data: {
                code: code
            },
            dataType: 'json',
            success: function(res){
                if(res&&res.status == '100'&&res.data){
                    var openId = res.data;
                    ToolBox.setCookie('openId', openId, 1);
                    checkWeixin();
                }else{
                    console.log(res);
                    location.href = 'error.html?' + $.param({
                        msg: '05'
                    });
                }
            }
        });
    };

    //微信openId关联登录云平台
    var checkWeixin = function(){
        ToolBox.ajax({
            type: 'post',
            url: 'weixin/associatedLogin',
            data: JSON.stringify({
                weixin_id: ToolBox.getCookie("openId")
            }),
            dataType: 'json',
            success: function(res){
                if(res&&res.status == '100'){
                    var token = res.data;
                    ToolBox.setCookie('token', token, 1);
                    switch(type){
                        case 0:
                            checkUserName();
                            break;
                        case 1:
                            if(typeof correct_callback == 'function'){
                                correct_callback();
                            }
                            break;
                    }
                }else{
                    if(typeof error_callback == 'function'){
                        error_callback();
                    }else{
                        location.href = 'error.html?' + $.param({
                            msg: '03'
                        });
                    }
                }
            }
        });
    };

    /*检查用户名*/
    var checkUserName = function(){
        ToolBox.ajax({
            type: 'get',
            url: 'user/info',
            data: {
                token: ToolBox.getCookie('token')
            },
            dataType: 'json',
            success: function(res){
                if(res&&res.status == '100'&&res.data){
                    var user_name = res.data.user_name;
                    if(typeof user_name == 'string' && user_name.indexOf(normal_user_prefix) == -1){
                        if(typeof correct_callback == 'function'){
                            correct_callback();
                        }
                    }else{
                        location.href = 'error.html?' + $.param({
                            msg: '08'
                        });
                    }
                }else{
                    location.href = 'error.html?' + $.param({
                        msg: '07'
                    });
                }
            }
        });
    };

    var correct_callback, error_callback, type;

    return {
        init: function(){
            type = 0;
            correct_callback = arguments[0] || {};
            error_callback = arguments[1] || {};
            getWeixinOpenId();
        },
        init_normalUser: function(){
            type = 1;
            correct_callback = arguments[0] || {};
            error_callback = arguments[1] || {};
            getWeixinOpenId();
        }
    };

});