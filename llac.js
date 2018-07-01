var module, define, require, llac;

if(typeof define != "function"){
    define = function(definition){
        llac = definition(require);
        if(typeof module == "object") module.exports = llac;
        define = null;
    }
}

define(function(require){
    var llac = function(){
        var outside = this;
        var call = function(){
            var args = Array.prototype.slice.call(arguments);
            call.callbacks.forEach(function(callback){
                callback.apply(outside, args);
            });
            call.args = args;
            return call;
        };
        call.callbacks = [];
        call.args = null;
        call.listen = function(callback, remove){
            if(typeof callback == 'function'){
                if(remove){
                    var i = call.callbacks.indexOf(callback);
                    if(i>-1){
                        call.callbacks.splice(i,1);
                    }
                }else if(call.args){
                    call.callbacks = [callback];
                    call.apply(call, call.args);
                }else{
                    call.callbacks.push(callback);
                }
            }
            return call.listen;
        };
        call.listen = call.listen.bind(call);
        call.listen.callback = call;
        call.callback = call;
        call.listenCall = function(){
            call.listen.apply(this, arguments);
            return call.callback;
        };
        call.callListen = function(){
            call.callback.apply(this, arguments);
            return call.listen;
        };
        call.listen.listenCall = call.listenCall;
        call.listen.callListen = call.callListen;
        return arguments.length?call.apply(this, arguments):call;
    }
    return llac;
});