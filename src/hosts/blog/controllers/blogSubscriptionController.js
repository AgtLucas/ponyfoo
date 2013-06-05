'use strict';

var config = require('../../../config'),
    restService = require('../../../service/restService.js'),
    subscriptionService = require('../../../service/blogSubscriptionService.js');

module.exports = {
    postSubscribe: function(req, res, next){
        var success;

        if(req.user){
            success = 'All set!';
            subscriptionService.subscribeUser(req.user, req.blog, respond);
        }else if('email' in req.body){
            if(!req.body.email || !config.remail.test(req.body.email)){
                invalid('That doesn\'t look like a valid email address');
            }else{
                success = 'Great! Make sure to verify your email';
                subscriptionService.subscribeEmail(req.body.email, req.blog, respond);
            }
        }else{
            invalid('What are you trying to prove?');
        }

        function respond(err, subscriber){
            if(err){
                return next(err);
            }

            restService.ok(req, res, {
                validation: [success]
            });
        }

        function invalid(message){
            restService.badRequest(req, res, {
                validation: [message]
            });
        }
    },
    postUnsubscribe: function(req, res, next){

    }
};