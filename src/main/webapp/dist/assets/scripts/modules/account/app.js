define([
    'toolbox',
    'scripts/modules/account/layout'
    ], function(ToolBox, Layout){

    /*绑定账户*/
    var bindAccount_layout = function(){
        Layout.account_bind_form();
        var options = {
            submitHandler: function(){
                ToolBox.confirm_alert({
                    $container: $('#others'),
                    afterCallback: function(){
                        var name = $('input[name="userName"]').val().trim();
                        var userName = name.substring(0, name.indexOf('@'));
                        var tenantEname = name.substring(name.indexOf('@')+1);
                        var password = $('input[name="password"]').val().trim();
                        bindAjax({
                            tenantEname: tenantEname,
                            userName: userName,
                            password: password
                        });
                    },
                    msg: ToolBox.getConstant('Constant-account-bind-confirm')
                });
            },
            rules: {
                userName: {
                    required: true
                },
                password: {
                    required: true
                }
            },
            messages: {
                userName: {
                    required: ToolBox.getConstant('Constant-account-bind-validate-userName')
                },
                password: {
                    required: ToolBox.getConstant('Constant-account-bind-validate-password')
                }
            }
        };
        ToolBox.validate.init(options, $('form'));
    };

    /*已绑定账户*/
    var bindedAccount_layout = function(){
        ToolBox.ajax({
            type: 'get',
            url: 'user/info',
            data: {
                token: ToolBox.getCookie('token')
            },
            dataType: 'json',
            success: function(res){
                if(res&&res.status == '100'){
                    Layout.binded_account(res.data);
                }
            }
        });
    };

    /*bing events*/
    var events_init = function(){
        $('#main').on('tap', '#bind', function(e){
            $('form').submit();
        });
        $('#main').on('tap', '#unbind', function(e){
            ToolBox.confirm_alert({
                $container: $('#others'),
                afterCallback: function(){
                    unbindAjax();
                },
                msg: ToolBox.getConstant('Constant-account-unbind-confirm')
            });
        });
    };

    /*绑定请求*/
    var bindAjax = function(data){
        if(typeof data != 'object' || typeof data.tenantEname != 'string' || 
            typeof data.userName != 'object' || typeof data.password != 'string')
        ToolBox.ajax({
            type: 'post',
            url: 'weixin/bindAccount',
            data: JSON.stringify({
                weixin_id:'100',
           //     weixin_id: ToolBox.getCookie('openId'),
                tenantEname: data.tenantEname,
                userName: data.userName,
                password: data.password
            }),
            dataType: 'json',
            success: function(res){
                if(res&&res.status == '100'){
                    var token = res.data;
                    ToolBox.setCookie('token', token, 1);
                    bindedAccount_layout();
                }else{
                    ToolBox.alert_msg({
                        $container: $('#others'),
                        msg: res.msg
                    });
                }
            }
        })
    };

    /*解绑请求*/
    var unbindAjax = function(){
        ToolBox.ajax({
            type: 'post',
            url: 'weixin/unbindAccount',
            data: JSON.stringify({
                token: ToolBox.getCookie('token'),
                weixin_id: ToolBox.getCookie('openId')
            }),
            dataType: 'json',
            success: function(){
                bindAccount_layout();
            }
        });
    };

    return {
        /*start: function(){
            events_init();
        },
        bindAccount_layout: bindAccount_layout,
        bindedAccount_layout: bindedAccount_layout
        */  
        
             
        start:function () {
            events_init();
            bindAccount_layout();
            bindedAccount_layout();
        }
        
    };

});