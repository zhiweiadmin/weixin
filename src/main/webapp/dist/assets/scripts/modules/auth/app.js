define([
    'toolbox',
    'scripts/modules/auth/layout',
    'token',
    'jquery.qrcode',
    'jquery.md5'
    ], function(ToolBox, Layout, Token){

    var getUserInfo = function(callback){
        ToolBox.ajax({
            type: 'get',
            url: 'user/info',
            data: {
                token: ToolBox.getCookie('token')
            },
            dataType: 'json',
            success: function(res){
                if(res&&res.status == '100'&&res.data){
                    if(typeof callback == 'function'&&typeof res.data.tenant_ename == 'string'){
                        callback(res.data.tenant_ename);
                    }else{
                        location.href = 'error.html?' + $.param({
                            msg: '06'
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

    /*生成随机用户名*/
    var random_userName = function(tenantEname){
        var time = (new Date()).getTime();
        return $.md5(time, tenantEname);
    };

    /*注册云平台用户*/
    var register = function(tenantEname, userName){
        ToolBox.ajax({
            type: 'post',
            url: 'user/register',
            data: JSON.stringify({
                tenantEname: tenantEname,
                userName: userName
            }),
            dataType: 'json',
            success: function(res){
                if(res&&res.status == '100'){
                    getWeixinOpenId(tenantEname, userName);
                }else{
                    $('#intro').html(Layout.register_failure());
                }
            }
        });
    };

    var getWeixinOpenId = function(tenantEname, userName){
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
                    bindWeixin(tenantEname, userName);
                }else{
                    location.href = 'error.html?' + $.param({
                        msg: '05'
                    });
                }
            }
        });
    };

    /*绑定微信*/
    var bindWeixin = function(tenantEname, userName){
        ToolBox.ajax({
            type: 'post',
            url: 'weixin/bindAccount',
            data: JSON.stringify({
                tenantEname: tenantEname,
                userName: userName,
                password: '123456',
                weixin_id: ToolBox.getCookie('openId')
            }),
            dataType: 'json',
            success: function(res){
                if(res&&res.status == '100'){
                    $('#intro').html(Layout.register_success());
                }else{
                    location.href = 'error.html?' + $.param({
                        msg: '09'
                    });
                }
            }
        });
    };

    return {
        start: function(){
            if(typeof ToolBox.getParam("tenantEname") == 'string'){
                var tenantEname = ToolBox.getParam("tenantEname");
                var userName = normal_user_prefix + random_userName(tenantEname);
                register(tenantEname, userName);
            }else{
                Token.init(function(){
                    var token = ToolBox.getCookie('token');
                    getUserInfo(function(tenantEname){
                        $('#intro').html(Layout.qrcode_intro());
                        $('#main').qrcode("https://open.weixin.qq.com/connect/oauth2/authorize?appid="+
                            weixin_app_id + "&redirect_uri=" + 
                            encodeURI(domain + "/dist/htmls/auth.html?tenantEname=" + tenantEname) +
                            "&response_type=code&scope=snsapi_base#wechat_redirect");
                    });
                });
            }
        }
    };

});