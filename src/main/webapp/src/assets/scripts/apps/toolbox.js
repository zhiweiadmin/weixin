define([
    'text!templates/toolbox.jst',
    'jweixin'
    ], function(ToolBoxTemplate, WX){

    var template = _.template(ToolBoxTemplate);

    var getConstant = function(tempId){
        return template({'tempId': tempId});
    };

    /*alert*/
    var alert_msg = function(options){
        if(typeof options != 'object'){
            return false;
        }
        var $container = options['$container'];
        var msg = options['msg'];
        var beforeCallback = options['beforeCallback'];
        var afterCallback = options['afterCallback'];
        if(typeof beforeCallback == 'function'){
            beforeCallback();
        }
        $container.html(template({'tempId': 'alert', 'data': msg}));
        if(typeof afterCallback == 'function'){
            $('#alert button.btn-block').on('tap', function(){
                afterCallback();
            });   
        }
        $('.modal-backdrop').remove();
        $('#alert').modal('show');
    };

    /*屏幕宽度*/
    var screen_width = document.documentElement.clientWidth;

    /*屏幕高度*/
    var screen_height = document.documentElement.clientHeight;

    /*confirm alert*/
    var confirm_alert = function(options){
        if(typeof options != 'object'){
            return false;
        }
        var $container = options['$container'];
        var msg = options['msg'];
        var beforeCallback = options['beforeCallback'];
        var afterCallback = options['afterCallback'];
        if(typeof beforeCallback == 'function'){
            beforeCallback();
        }
        $container.html(template({'tempId': 'confirm-alert', 'data': msg}));
        if(typeof afterCallback == 'function'){
            $('#confirm-alert a.btn.blue').on('tap', function(){
                afterCallback();
            });   
        }
        $('.modal-backdrop').remove();
        $('#confirm-alert').modal('show');
    };

    var getCookie = function(c_name){
        if (document.cookie.length > 0) {
            c_start = document.cookie.indexOf(c_name + "=");
            if (c_start != -1) {
                c_start = c_start + c_name.length + 1;
                c_end = document.cookie.indexOf(";", c_start);
                if (c_end == -1)
                    c_end = document.cookie.length;
                return unescape(document.cookie.substring(c_start,
                    c_end));
            }
        }
        return "";
    };

    var setCookie = function(c_name, value, expiredays){
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + expiredays);
        document.cookie = c_name
            + "="
            + escape(value)
            + ((expiredays == null) ? "" : ";expires="
            + exdate.toGMTString());
    };

    var getParam = function(name){
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
        var r = window.location.search.substr(1).match(reg); 
        if (r != null) return r[2]; return null; 
    };

    var ajax = function(options){
        if(typeof options != 'object'){
            return false;
        }
        if(options.local != true){
            options.url = apiUrl + options.url;
        }
        options.error = function(err){
            location.href = 'error.html?' + $.param({
                            msg: '01'
                        });
        }
        $.ajax(options);
    };

    var validate = function(){

        /*基本的参数*/
        var _baseOptions = function(){
            var baseOptions = {
                errorElement: 'span',
                errorClass: 'help-block',
                ignore: '.ignore',
                focusInvalid: true,
                highlight: function(element){
                    if($(element).closest('.form-group').length > 0){
                        $(element).closest('.form-group').addClass('has-error');
                    }
                },
                unhighlight: function(element){
                    if($(element).closest('.form-group').length > 0){
                        $(element).closest('.form-group').removeClass('has-error');
                    }
                },
                success: function(label){
                    if(label.closest('.form-group').length > 0){
                        label.closest('.form-group').removeClass('has-error');
                    }
                }
            };

            return baseOptions;
        };

        /*初始化*/
        var _initialize = function(args, form){
            //args: {}
            //invalidHandler: fn
            //submitHandler: fn
            //rules: {}
            //messages: {}
            //errorPlacement: fn
            if(typeof args == 'undefined' || typeof form == 'undefined'){
                return;
            }
            var keys = _.keys(args);
            //intersection 取交集
            if(_.intersection(keys, ['invalidHandler', 'submitHandler', 'rules', 'messages', 'errorPlacement', 'highlight', 'unhighlight']).sort().toString() 
                != keys.sort().toString()){
                return;
            }
            var clonedOptions = _.clone(_baseOptions());
            _.extend(clonedOptions, args);
            args = clonedOptions;
            form.validate(args);
        };

        return {
            init: _initialize
        };
        
    }();

    var weixin_api_ready = function(callback){
        ajax({
            type: 'get',
            url: '/access/configs',
            data: {
                token: getCookie('token'),
                url: location.href.split('#')[0]
            },
            local: true,
            dataType: 'json',
            success: function(res){
                if(res&&res.status == '100'){
                    WX.config({
                        debug: false,
                        appId: res.data.appId,
                        timestamp: res.data.timestamp,
                        nonceStr: res.data.nonceStr,
                        signature: res.data.signature,
                        jsApiList: ['scanQRCode','getLocation']
                    });
                    WX.ready(function(){
                        if(typeof callback == 'function'){
                            callback();
                        }
                    });
                    WX.error(function(res){
                        //验证失败
                        location.href = 'error.html?' + $.param({
                            msg: '04'
                        });
                    });
                }
            }
        });  
    };

    /*扫一扫*/
    var scanCode = function(callback){
        WX.scanQRCode({
            needResult: 1,
            scanType: ['qrCode', 'barCode'],
            success: function(res){
                var result = res.resultStr;
                callback(result);
            }
        });
    };

    /*获取地点*/
    var getLocation = function(callback){
        WX.getLocation({
            type: 'wgs84',
            success: function(res){
                var longitude = res.longitude;
                var latitude = res.latitude;
                callback(longitude,latitude);
               /* ajax({
                    type: 'get',
                    url: '/access/location',
                    local: true,
                    data: {
                        longitude: longitude,
                        latitude: latitude
                    },
                    dataType: 'json',
                    success: function(res){
                        if(res&&res.status == '100'&&res.data){
                            var obj =res.data.substring(29);
                            obj = obj.substring(0,obj.length-1);
                            obj = eval('('+obj+')');
                            var address = obj.result.formatted_address;
                            if(typeof callback == 'function'){
                                callback(address);
                            }
                        }
                    }
                });*/
            }
        });
    };

    /*检查序列号是否合法*/
    var checkSerialNumber = function(str, callback){
        if(typeof str != 'string'){
            alert_msg({
                $container: $('#others'),
                msg: getConstant('Constant-addDevice-serialNumber-invalid')
            });
            return false;
        }
        if(!/([0-9]+);(.+);(.+)/.test(str)){
            alert_msg({
                $container: $('#others'),
                msg: getConstant('Constant-addDevice-serialNumber-invalid')
            });
            return false;
        }
        //split
        var arr = str.split(';');
        if(typeof arr[0] != 'string' || typeof arr[1] != 'string' || typeof arr[2] != 'string'){
            alert_msg({
                $container: $('#others'),
                msg: getConstant('Constant-addDevice-serialNumber-invalid')
            });
            return false;
        }
        ajax({
            type: 'get',
            url: '/access/aes_ecb',
            local: true,
            data: {
                encrypted: arr[0] + ";" + arr[1]
            },
            dataType: 'json',
            success: function(res){
                if(res&&res.status == '100'&&res.data){
                    var code = res.data;
                    var half_code = code.substring(code.length/2);
                    if(half_code == arr[2] && typeof callback == 'function'){
                        checkSerialNumberReady(arr[0], callback);
                    }else{
                        alert_msg({
                            $container: $('#others'),
                            msg: getConstant('Constant-addDevice-serialNumber-failed')
                        });
                    }
                }else{
                    alert_msg({
                        $container: $('#others'),
                        msg: getConstant('Constant-addDevice-serialNumber-encrypt-error')
                    });
                }
            }
        });
    };

    /*检查序列号是否可用*/
    var checkSerialNumberReady = function(serialNumber, callback){
        ajax({
            type: 'get',
            url: 'register/isUsed',
            data: {
                token: getCookie('token'),
                serialNumber: serialNumber
            },
            dataType: 'json',
            success: function(res){
                if(res&&res.status == '130'){
                    if(typeof callback == 'function'){
                        callback(serialNumber);
                    }
                }else{
                    alert_msg({
                        $container: $('#others'),
                        msg: getConstant('Constant-addDevice-serialNumber-isUsed')
                    });
                }
            }
        });
    };

    /*毫秒数->yyyy-MM-dd*/
    var yyyyMMdd = function(msec){
        if(!msec){
            return '';
        }
        if(typeof msec != 'number'){
            msec = parseInt(msec);
        }
        var date = new Date(msec);
        var Y = date.getFullYear();
        var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
        var D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate());
        var time = Y + getConstant('year') + M + getConstant('month') + D + getConstant('day');
        return time;
    };

    /*判断是否在机型中*/
    var checkDeviceType = function(type){
        // var result = false;
        // _.each(device_type, function(o){
        //     if(o.name == type){
        //         result = true;
        //         return false;
        //     }
        // });
        // return result;
        return true;
    };

    var select2_options = function () {
       return {
           placeholder: getConstant('ConstantView-select2-placeholder'),
           allowClear: false,
           data: [],
           maximumSelectionLength: 10,
           tags: true,
           theme: 'bootstrap',
           language: 'zh-CN'
       }
    }

    var data_array=[];

    var prePared_data=function (data) {
        data_array=data;
    }
    var get_pre_data=function () {
        return data_array;
    }

   /* toolbox.select2 = function(){

        var _basicOptions = function(){
            return {
                placeholder: toolbox.getConstant('ConstantView-select2-placeholder'),
                allowClear: false,
                data: [],
                maximumSelectionLength: 10,
                tags: true,
                theme: 'bootstrap',
                language: 'zh-CN'
            };
        };

        return {
            getOptions: _basicOptions
        };

    }();*/


    return {
        prePared_data:prePared_data,
        get_pre_data:get_pre_data,
        getConstant: getConstant,
        alert_msg: alert_msg,
        screen_width: screen_width,
        screen_height: screen_height,
        confirm_alert: confirm_alert,
        getCookie: getCookie,
        setCookie: setCookie,
        getParam: getParam,
        ajax: ajax,
        validate: validate,
        weixin_api_ready: weixin_api_ready,
        scanCode: scanCode,
        checkSerialNumber: checkSerialNumber,
        yyyyMMdd: yyyyMMdd,
        getLocation: getLocation,
        checkDeviceType: checkDeviceType,
        select2_options:select2_options
    };

});