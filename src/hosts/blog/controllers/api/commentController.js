'use strict';

var async = require('async'),
    api = require('../../../../config').api,
    Discussion = require('../../../../model/Discussion.js'),
    Comment = require('../../../../model/Comment.js'),
    Entry = require('../../../../model/Entry.js'),
    validation = require('../../../../service/validationService.js'),
    commentService = require('../../../../service/blogCommentService.js'),
    rest = require('../../../../service/restService.js'),
    crud = require('../../../../service/crudService.js')(Discussion);

function discuss(req,res){
    var discussion = new Discussion({
        entry: req.params.entryId,
        blog: req.blog._id
    });

    add(req,res,discussion,true);
}

function reply(req,res){
    Discussion.findOne({ _id: req.params.id, blog: req.blog._id }, function(err, discussion){
        if(err){
            throw err;
        }
        add(req,res,discussion,false);
    });
}

function validate(req,res){
    return validation.validate(req,res,{
        document: { text: req.body.comment },
        rules: [
            { field: 'text', length: 10, message: 'Your comment must be at least 10 characters long' },
            { field: 'text', length: { max: 3000 }, required: false, message: 'Your markdown can\'t exceed 3k characters in length' }
        ]
    });
}

function add(req,res,discussion,root){
    if(!validate(req,res)){
        return;
    }

    var model = new Comment({
        blog: req.blog._id,
        text: req.body.comment,
        author: {
            id: req.user._id,
            displayName: req.user.displayName,
            gravatar: req.user.gravatar,
            blogger: req.user.blogger // used just by the css class hook on the client-side
        },
        root: root
    });

    discussion.comments.push(model);
    discussion.save(function(err){
        rest.resHandler(err,{
            res: res,
            then: function(){
                rest.end(res, {
                    discussion: discussion._id,
                    comment: actionMapper(req)(model)
                });

                Entry.findOne({ _id: discussion.entry }, function(err, entry){
                    if(err){
                        return console.error(err);
                    }

                    commentService.notifySubscribers({
                        blog: req.blog,
                        blogger: req.blogger,
                        discussion: discussion,
                        comment: model,
                        entry: entry
                    }, function(err){
                        if(err){
                            console.error(err);
                        }
                    });
                });
            }
        });
    });
}

function list(req,res){
    Discussion.find({
        entry: req.params.entryId,
        blog: req.blog._id
    }).sort('date').exec(callback);

    function discussionObjects(discussions){
        if(!req.user){
            return discussions;
        }

        return discussions.map(function(d){
            d = d.toObject();
            d.comments = d.comments.map(actionMapper(req));

            return d;
        });
    }

    function callback(err,documents){
        rest.resHandler(err, {
            res: res,
            then: function(){
                rest.end(res,{
                    discussions: discussionObjects(documents)
                });
            }
        });
    }
}

function editable(comment){
    return new Date() - comment.date < api.comments.editableFor;
}

function actionMapper(req){
    return function(c){
        var actions;

        if (c.toObject !== undefined){
            c = c.toObject();
        }

        if(req.user.blogger){
            actions = {
                remove: true,
                edit: true
            };
        }else if(c.author.id.equals(req.user._id)){
            actions = { remove: true };

            if(editable(c)){
                actions.edit = true;
            }
        }
        c.actions = actions;
        return c;
    };
}

function findComment(req, res, then){
    Discussion.findOne({ _id: req.params.id, blog: req.blog._id }, function(err, discussion){
        if(err){
            rest.resHandler(err,{res:res});
            return;
        }

        var comment = discussion.comments.id(req.params.commentId), blogger, authorized;
        if (comment === null){
            rest.notFound(req,res);
            return;
        }

        blogger = req.user.blogger === true;
        authorized = blogger ||  comment.author.id.equals(req.user._id);

        if(!authorized){
            rest.unauthorized(req,res);
            return;
        }

        then(discussion, comment, function (err){
            rest.resHandler(err,{res:res});
        });
    });
}

function del(req, res){
    findComment(req, res, function(discussion, comment, done){
        if(comment.root){
            discussion.remove(done);
        }else{
            comment.remove();
            discussion.save(done);
        }
    });
}

function edit(req,res){
    findComment(req,res, function(discussion, comment, done){
        if(req.user.blogger !== true && !editable(comment)){
            rest.badRequest(req,res, {
                validation: [
                    'Your comment can\'t be edited anymore'
                ]
            });
            return;
        }

        if (!validate(req,res)){
            return;
        }

        comment.text = req.body.comment;
        discussion.save(done);
    });
}

function discussions(req,res){
    crud.list({
        listName: 'discussions',
        query: { blog: req.blog._id },
        limit: api.paging.limit,
        page: req.params.page,
        sort: '-date',
        mapper: function(documents, cb){
            async.map(documents, function(document, done){
                Entry.findOne({ _id: document.entry }, function(err, entry){
                    if(err){
                        done(err);
                        return;
                    }

                    done(null, {
                        _id: document._id,
                        comments: document.comments,
                        last: document.comments[document.comments.length - 1],
                        entry: {
                            _id: document.entry,
                            permalink: entry.permalink,
                            title: entry.title
                        }
                    });
                });
            }, function(err, documents){
                if(err){
                    cb(err);
                    return;
                }

                cb(null, documents.sort(function(a, b){
                    return a.last.date < b.last.date ? -1 : 1;
                }));
            });
        }
    }, rest.wrapCallback(res));
}

module.exports = {
    get: list,
    discussions: discussions,
    discuss: discuss,
    reply: reply,
    del: del,
    edit: edit
};