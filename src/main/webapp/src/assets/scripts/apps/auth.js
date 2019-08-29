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
        /*plugins*/
        'bootstrap': 'plugins/bootstrap/js/bootstrap.min',
        'toolbox': 'scripts/apps/toolbox',
        'jquery.validate': 'plugins/jquery-validation/js/jquery.validate.min',
        'jquery.validate.extend': 'scripts/plugins/jquery.validate.extend',
        'app': 'scripts/modules/auth/app',
        'token': 'scripts/apps/token',
        'jweixin': 'plugins/jweixin',
        'jquery.qrcode': 'plugins/jquery-qrcode/jquery.qrcode.min',
        'jquery.md5': 'plugins/jquery.md5'
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
        'bootstrap': {
            deps: ['css!plugins/bootstrap/css/bootstrap.min', 'jquery']
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
                'jquery.validate.extend'
            ]
        }
    },
    callback: function(){
        require(['app'], function(App){
            App.start();
        });
    }
});