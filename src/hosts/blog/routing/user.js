'use strict';

var config = require('../../config.js'),
    controller = require('../../controllers/user.js'),
    providers = ['facebook','github','google','linkedin'];

function configure(server){
    server.get(config.auth.register, controller.guard);
    server.get(config.auth.login, controller.guard);
    server.get(config.auth.logout, controller.logout);

    server.post(config.auth.register, controller.guard, controller.register, controller.redirect);
    server.post(config.auth.login, controller.guard, controller.local, controller.redirect);

    function configureProvider(name){
        if(!config.auth[name].enabled){
            return;
        }
        server.get(config.auth[name].link, controller.rememberReturnUrl, controller[name].auth);
        server.get(config.auth[name].callback, controller[name].callback, controller.redirect);
    }

    for(var key in providers){
        configureProvider(providers[key]);
    }
}

module.exports = {
    configure: configure
};