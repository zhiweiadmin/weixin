define([
    'toolbox',
    'scripts/modules/index/layout',
    'scripts/modules/main_host/app'
], function(ToolBox, Layout,Main){
    /*frame*/
    var layout_init = function(){
        //设置背景图片 jiangzhiwei
        $("body").css("background-image","url(../assets/image/img/login.png)");
        $("body").css("background-size",'cover');
        $("body").css("background-attachment",'fixed');
        $("body").css("background-repeat",'no-repeat');
        $('#main').html(Layout.basic_frame());

    };

   //绑定事件
    var bindEvents = function () {
        //点击登陆
        $('#main').off('tap','#login').on('tap','#login',function (e) {
            e.stopPropagation();
            e.preventDefault();
            var username=$('.username').val();
            var password=$('.password').val();
            ToolBox.ajax({
                type:'post',
                url:'weixin/bindAccount',
                data:JSON.stringify({
                //    weixin_id:'100',
                    weixin_id:ToolBox.getCookie('openId'),
                    tenantEname:'bmyulin',
                    userName:username,
                    password:password,
                    hash:'test',
                }),
                dataType:'json',
                success:function (res) {
                    // //jiangzhiwei
                    // res.status = '100';
                    if(res&&res.status=='100'){
                        var token = res.data;
                        ToolBox.setCookie('token',token,1);
                        Main.start();
                        //jiangzhiwei
                        $("body").css("background-img",'none');
                        $("body").css("background",'linear-gradient(#83DECF, #fff) no-repeat 100% 100%');
                    }else{
                        ToolBox.alert_msg({
                            $container: $('#others'),
                            msg: res.msg
                        });
                    }
                }
            })
        })
    }

    //绑定页面
    var bind_account = function () {
        $("body").css("background-image","url(../assets/image/img/login.png)");
        $("body").css("background-size",'cover');
        $("body").css("background-attachment",'fixed');
        $("body").css("background-repeat",'no-repeat');
        $('#main').html(Layout.basic_frame());
        $('#main').css('width',ToolBox.screen_width);
    }
    //已绑定进入主页
    var binded_account = function (callback) {
        ToolBox.ajax({
            type: 'post',
            url: 'weixin/associatedLogin',
            data: JSON.stringify({
               //  weixin_id: '100',
                weixin_id:ToolBox.getCookie('openId')
            }),
            dataType: 'json',
            success: function(res){
                callback(res);
            }
        });
    }
//验证token
    var CheckToken=function (callback) {
        ToolBox.ajax({
            type:'get',
            url:'user/tokenValidate',
            data:{
                token:ToolBox.getCookie('token')
            },
            dataType:'json',
            success:function (res) {
                if(res&&res.status=='100'){
                    callback(res.data);
                }else{
                    layout_init();
                    bindEvents();
                }
            }
        })
    }

    return {
        /*start: function() {
            ToolBox.weixin_api_ready(function () {
                console.log('hi');
                layout_init();
                bindEvents();
            });
        }*/

        start:function () {
             binded_account(function (res) {
                 if(res.status=='100'){
                     //存token
                     ToolBox.setCookie('token',res.data,1);
                     Main.start();
                 }else{
                     bind_account();
                     bindEvents();
                 }
             })
        }
    };

});