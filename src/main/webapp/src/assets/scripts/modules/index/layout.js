define([
    'toolbox',
    'text!templates/index/layout.jst',
    'css!style/index',
    'css!style/animate'
], function(ToolBox, LayoutTemplate){

    var template = _.template(LayoutTemplate);

    /*基础frame*/
    var basic_frame = function(){
        return template({'tempId': 'account-bind-form'});
    };

    return {
        basic_frame: basic_frame,
    };

});