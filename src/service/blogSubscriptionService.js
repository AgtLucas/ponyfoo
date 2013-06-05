'use strict';

var async = require('async'),
    mongoose = require('mongoose'),
    config = require('../config'),
    emailService = require('./emailService.js'),
    markdownService = require('./markdownService.js'),
    BlogSubscriber = require('../model/BlogSubscriber.js'),
    User = require('../model/User.js');

function update(model, enabled, done){
    BlogSubscriber.find(model, function(err, subscriber){
        if(err){
            return done(err);
        }

        if(!subscriber){
            if(model._id){ // unsubscribing a non-existent subscriber
                return done();
            }
            subscriber = new BlogSubscriber(model);
        }
        subscriber.enabled = enabled;
        subscriber.save(function(err){
            done(err, subscriber);
        });
    });
}

function sendConfirmation(subscriber, blog, done){
    var authority = config.server.authority(blog.slug),
        model = {
        to: subscriber.email,
        subject: blog.title + ' Subscription Confirmation',
        intro: 'Please confirm the subscription to ' + blog.title + ' updates',
        blog: {
            authority: authority,
            title: blog.title
        },
        confirm: {
            link: authority + '/email/confirm-subscription/' + subscriber._id
        },
        unsubscribe: authority + '/email/unsubscribe/' + subscriber._id
    };

    emailService.send('blog_update_subscription', model, done);
}

function sendNotification(entry, blog, recipients, done){
    var authority = config.server.authority(blog.slug),
        model = {
        to: recipients.to,
        merge: { locals: recipients.merge },
        subject: entry.title,
        intro: 'The blog has been updated!',
        blog: {
            authority: authority,
            title: blog.title
        },
        entry: {
            title: entry.title,
            permalink: authority + entry.permalink,
            tags: entry.tags,
            brief : markdownService.parse(entry.brief)
        }
    };

    emailService.send('notification/blog_update', model, done);
}

module.exports = {
    isSubscriber: function(user, done){
        BlogSubscriber.findOne({ userId: user._id, enabled: true }, function(err, subscriber){
            done(err, !!subscriber);
        });
    },
    subscribeUser: function(user, blog, done){
        update({
            blogId: blog._id,
            userId: user._id
        }, true, done);
    },
    subscribeEmail: function(email, blog, done){
        update({
            blogId: blog._id,
            email: email
        }, false, function(err, subscriber){
            if(err){
                return done(err);
            }

            sendConfirmation(subscriber, blog, done);
        });
    },
    unsubscribe: function(id, done){
        update({ _id: mongoose.Types.ObjectId(id) }, false, done);
    },
    confirmEmailSubscription: function(id, done){
        var query = { _id: mongoose.Types.ObjectId(id), enabled: false };

        BlogSubscriber.findOne(query, function(err, subscriber){
            if(err || !subscriber){
                return done(err, false);
            }

            subscriber.enabled = true;
            subscriber.save(function(err){
                done(err, subscriber);
            });
        });
    },
    notifySubscribers: function(entry, blog, done){
        var authority = config.server.authority(blog.slug),
            recipients = { to: [], merge: [] };

        BlogSubscriber.find({ blogId: blog._id }, function(err, subscribers){
            if(err){
                return done(err);
            }

            async.each(subscribers, function(subscriber, done){
                if(subscriber.email){
                    return complete(subscriber.email);
                }
                
                User.findOne({ _id: subscriber.userId }, function(err, user){
                    if(err){
                        return done(err);
                    }
                    complete(user.email);
                });

                function complete(email){
                    recipients.to.push({ email: email });
                    recipients.merge.push({
                        email: email,
                        model: {
                            unsubscribe_link: authority + '/email/unsubscribe/' + subscriber._id
                        }
                    });
                    done();
                }
            }, function(err){
                if(err){
                    return done(err);
                }

                sendNotification(entry, blog, recipients, done);
            });
        });
    }
};