define([
    'toolbox',
    'text!templates/auth/layout.jst',
    'css!style/auth',
    ], function(ToolBox, LayoutTemplate){

    var template = _.template(LayoutTemplate);

    /*获取扫码提示*/
    var qrcode_intro = function(){
        return template({'tempId': 'qrcode-intro'});
    };

    /*授权注册账户成功*/
    var register_success = function(){
        return template({'tempId': 'register-success'});
    };

    /*授权注册账户失败*/
    var register_failure = function(){
        return template({'tempId': 'register-failure'});
    };

    return {
        qrcode_intro: qrcode_intro,
        register_success: register_success,
        register_failure: register_failure
    };

});