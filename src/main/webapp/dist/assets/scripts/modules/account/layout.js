define([
    'toolbox',
    'text!templates/account/layout.jst',
    'css!style/account',
    ], function(ToolBox, LayoutTemplate){

    var template = _.template(LayoutTemplate);

    /*账户绑定的表单*/
    var account_bind_form = function(){
        $('#main').html(template({'tempId': 'account-bind-form'}));
    };

    /*已绑定*/
    var binded_account = function(data){
        if(typeof data != 'object' || typeof data.user_name != 'string' ||
            typeof data.tenant_ename != 'string'){
            location.href = 'error.html?' + $.param({
                msg: '06'
            });
            return false;
        }
        $('#main').html(template({'tempId': 'binded-account', 'data': data}));
    };

    return {
        account_bind_form: account_bind_form,
        binded_account: binded_account
    };

});