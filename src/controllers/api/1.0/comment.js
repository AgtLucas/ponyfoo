var mongoose = require('mongoose'),
    rest = require('../../../services/rest.js'),
    discussion = require('../../../models/discussion.js'),
    comment = require('../../../models/comment.js');

function discuss(req,res){
    var id = mongoose.Types.ObjectId(req.params.entryId);
    document = new discussion({ entry: id });

    add(req,res,document,true);
}

function reply(req,res){
    discussion.findOne({ _id: req.params.id }, function(err, document){
        if(err){
            throw err;
        }
        add(req,res,document,false);
    });
}

function add(req,res,document,root){
    var model = {
        text: req.body.comment,
        author: {
            id: req.user._id,
            displayName: req.user.displayName,
            gravatar: req.user.gravatar
        },
        root: root
    };

    document.comments.push(new comment(model));
    document.save(function(err){
        rest.resHandler(err,{
            res: res,
            then: function(){
                rest.end(res, {
                    discussion: document._id,
                    comment: model
                });
            }
        });
    });
}

function list(req,res){
    var id = mongoose.Types.ObjectId(req.params.entryId);
    discussion.find({ entry: id }).sort('date').exec(callback);

    function callback(err,documents){
        rest.resHandler(err, {
            res: res,
            then: function(){
                rest.end(res,{
                    discussions: documents
                });
            }
        });
    }
}

function del(req,res){
    var id = mongoose.Types.ObjectId(req.params.id),
        commentId = mongoose.Types.ObjectId(req.params.commentId);

    discussion.findOne({ _id: id }, function(err, discussion){
        if(err){
            rest.resHandler(err,{res:res});
            return;
        }

        var comment = discussion.comments.id(commentId),
            author = req.user.author === true,
            authorized = author ||  comment.author.id === req.user._id;

        if(authorized){
            if(comment.root){
                discussion.remove(done);
            }else{
                comment.remove(done);
            }
        }

        function done(err){
            rest.resHandler(err,{res:res});
        }
    });
}

function edit(req,res){
    // TODO either as the author, or if it's the owner.
    // TODO owner can edit for half an hour, after that, no more edits.
    // TODO update text, mark as edited (set updated field).
}

module.exports = {
    get: list,
    discuss: discuss,
    reply: reply,
    del: del,
    edit: edit
};