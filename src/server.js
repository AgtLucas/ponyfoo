'use strict';

var config = require('./config.js'),
    express = require('express'),
    server = express();

function vhosted(hostname, vhost){
    var pattern = hostname + '.' + config.server.tld,
        rhost = new RegExp('^' + pattern.replace(/[*]/g, '(.*?)') + '$', 'i');

    var middleware = function(req, res, next){
        if (!middleware.vhost){
            return next();
        }

        if(rhost){
            if(!req.headers.host){
                return next();
            }
            var host = req.headers.host.split(':')[0];
            if(!rhost.test(host)){
                return next();
            }
        }

        if (typeof vhost === 'function'){
            return vhost(req, res, next);
        }
        middleware.vhost.emit('request', req, res);
    };

    middleware.vhost = vhost;
    middleware.stop = function(){
        middleware.vhost = null;
    };
    return middleware;
}

function execute(opts, done){
    var db = require('./server/db.js');

    db.connect(function(){
        var market = config.server.slugged ? config.server.slugMarket : false;
        if (market){
            server.use(vhosted(market, require('./hosts/market/vhost.js')));
        }

        // TODO: install vhost should be disabled after configuration.
        server.use(vhosted('*', require('./hosts/install/vhost.js')));
        server.use(vhosted('*', require('./hosts/blog/vhost.js')));

        server.listen(port, function(){
            console.log('Web server listening on *.%s:%s', port, config.server.tld);

            server.on('close', done);
        });
    });
}

module.exports = {
    execute: execute
};