require.config({
    baseUrl: '../assets',
    waitSeconds: 0,
    urlArgs: 't=' + timestamp,
    paths: {
        'text': 'plugins/text',
        'css': 'plugins/css.min',
        'underscore': 'plugins/underscore-min',
        'jquery': 'plugins/jquery.min',
        'jquery.mobile': 'plugins/jquery.mobile.min',
        'mobiscroll': 'plugins/mobiscroll/mobiscroll',
        /*plugins*/
        'bootstrap': 'plugins/bootstrap/js/bootstrap.min',
        'toolbox': 'scripts/apps/toolbox',
        'jquery.validate': 'plugins/jquery-validation/js/jquery.validate.min',
        'jquery.validate.extend': 'scripts/plugins/jquery.validate.extend',
        'app': 'scripts/modules/index/app',
        'token': 'scripts/apps/token',
        'jweixin': 'plugins/jweixin',
        'bootstrap-switch':'plugins/bootstrap-switch/js/bootstrap-switch.min',
        'honeySwitch':'plugins/honeySwitch/lib/honeySwitch',
        'bootstrap-datetimepicker':'plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker',
        'bootstrap-datetimepicker-CN':'plugins/bootstrap-datetimepicker/js/locales/bootstrap-datetimepicker.zh-CN',
        'progress':'plugins/circle-progress',
        'lCalendar':'plugins/lCalendar/js/lCalendar',
        'icheck':'plugins/icheck/js/icheck'
    },
    shim: {
        'underscore': {
            deps: ['jquery'],
            exports: '_'
        },
        'jquery': {
            exports: '$'
        },
        'jquery.mobile': {
            deps: ['jquery']
        },
        'mobiscroll': {
            deps: ['jquery']
        },
        'bootstrap': {
            deps: ['css!plugins/bootstrap/css/bootstrap.min','css!plugins/font-awesome/css/font-awesome' ,'css!plugins/animate','jquery']
        },
        'bootstrap-switch':{
            deps:['css!plugins/bootstrap-switch/css/bootstrap-switch','jquery','bootstrap']
        },
        'bootstrap-datetimepicker':{
            deps:['css!plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker','bootstrap']
        },
        'bootstrap-datetimepicker-CN':{
            deps:['bootstrap','bootstrap-datetimepicker']
        },
        'lCalendar':{
            deps:['css!plugins/lCalendar/css/lCalendar','jquery']
        },
        'icheck':{
             deps:['css!plugins/icheck/css/all']
        },
        'select2':{
            deps:['css!plugins/select2/css/select2.min','css!plugins/select2/css/select2-bootstrap.min']
        },
        'honeySwitch':{
            deps:['css!plugins/honeySwitch/lib/honeySwitch','jquery']
        },
        'toolbox': {
            deps: [
                'underscore',
                'jweixin'
            ]
        },
        'jquery.validate': {
            deps: ['jquery']
        },
        'app': {
            deps: [
                'text',
                'css',
                'bootstrap',
                'jquery.mobile',
                'jquery.validate',
                'jquery.validate.extend',
            ]
        }
    },
    callback: function(){
        require(['app','toolbox'], function(App,ToolBox){
           App.start();
        });
    }
});