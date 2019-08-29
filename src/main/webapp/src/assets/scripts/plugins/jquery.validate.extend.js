define([
    'jquery.validate'
    ], function(){

    /*空调型号验证*/
    $.validator.addMethod('air_conditioner_type', function(value, element, params){

        if(params != true){
            return false;
        }
        if(value == -1){
            return false;
        }

        return true;

    }, 'must choose air conditioner type');

    /*联系电话验证*/
    $.validator.addMethod('phone', function(value, element, params){

        if(params != true){
            return false;
        }
        var regex = /^[0-9]{11}$/;
        if(!regex.test(value)){
            return false;
        }else{
            return true;
        }

    }, 'phone must be number');

});