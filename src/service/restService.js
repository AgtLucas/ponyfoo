'use strict';

var utilityService = require('./utilityService.js');

function head(res,code) {
    res.writeHead(code, {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
    });
}

function encode(value){
    return JSON.stringify(value);
}

function write(res,value){
    var encoded = encode(value);
    res.write(encoded);
}

function end(res,value){
    var encoded = encode(value);
    res.end(encoded);
}

function meta(opts){
    var json = {
        meta: {
            code: opts.code,
            message: opts.message,
            data: opts.data || {}
        }
    };

    if(opts.err){
        utilityService.log.err(opts.err);
    }

    head(opts.res,opts.code);
    end(opts.res,json);
}

function resHandler(err, opts){
    var test = !!err;
    if (test){
        meta({
            res: opts.res,
            code: 500,
            message: 'internal server error',
            err: err
        });
    }else{
        if(opts.writeHead !== false){
            head(opts.res,200);
        }
        if(!opts.then){
            end(opts.res,{});
        }else{
            opts.then.apply(null, opts.args);
        }
    }
}

function unauthorized(req, res){
    var connected = !!req.user;
    meta({
        res: res,
        code: connected ? 403 : 401,
        message: 'api endpoint unauthorized'
    });
}

function notFound(req, res){
    meta({
        res: res,
        code: 404,
        message: 'api endpoint not found'
    });
}

function badRequest(req, res, data){
    meta({
        res: res,
        code: 400,
        message: 'bad request',
        data: data || {}
    });
}

function ok(req, res, data){
    meta({
        res: res,
        code: 200,
        message: 'success',
        data: data || {}
    });
}
function wrapCallback(res, map){
    return function (err,response){
        resHandler(err, {
            res: res,
            then: function(){
                end(res,map ? map(response) : response);
            }
        });
    };
}

module.exports = {
    head: head,
    write: write,
    end: end,
    resHandler: resHandler,
    unauthorized: unauthorized,
    notFound: notFound,
    badRequest: badRequest,
    wrapCallback: wrapCallback,
    meta: meta
};