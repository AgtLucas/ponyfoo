'use strict';

var config = require('../config'),
    markdownService = require('./markdownService.js'),
    emailService = require('./emailService.js'),
    userService = require('./userService.js'),
    User = require('../model/User.js');

function notifySubscribers(payload, done){
    var authority = config.server.authority(payload.blog.slug),
        recipients = { to: [], merge: [] },
        query = { 
            _id: {
                $in: payload.discussion.comments.map(function(comment){
                    return comment.author.id;
                }).concat([payload.blogger._id])
            },
            commentNotifications: true
        };

    var targets = [];

    User.find(query, function(err, users){
        if(err){
            return done(err);
        }

        var existing = [
            payload.blogger._id.toString(),
            payload.comment.author.id.toString()
        ];

        users.forEach(function(user){
            if(existing.indexOf(user._id.toString()) === -1){
                targets.push(user);
            }
        });

        targets.forEach(function(target){
            var link = authority + '/user/profile/' + target._id + '/edit';
            
            recipients.to.push({ email: target.email });
            recipients.merge.push({
                email: target.email,
                model: {
                    unsubscribe_html: "notification <a href='" + link + "'>settings</a>"
                }
            });
        });

        userService.getGravatar(payload.comment.author.id, function(err, gravatar){
            if(err){
                return done(err);
            }

            sendNotification(payload, gravatar, recipients, done);
        });
    });
}

function sendNotification(payload, gravatar, recipients, done){
    var authority = config.server.authority(payload.blog.slug),
        permalink = authority + payload.entry.permalink,
        model = {
            to: recipients.to,
            merge: { locals: recipients.merge },
            subject: 'Fresh comments on "' + payload.entry.title + '"!',
            intro: 'Someone posted a comment on a thread you\'re watching!',
            commenter: {
                profile: authority + '/user/profile/' + payload.comment.author.id,
                displayName: payload.comment.author.displayName
            },
            comment: markdownService.parse(payload.comment.text),
            thread: {
                permalink: permalink + '#thread-' + payload.discussion._id
            },
            entry: {
                title: payload.entry.title,
                permalink: permalink
            },
            images: [{
                name: 'gravatar',
                type: gravatar.mime,
                content: gravatar.data.toString('base64')
            }]
        };

    emailService.send('notification/blog_comment', model, done);
}

module.exports = {
    notifySubscribers: notifySubscribers
};