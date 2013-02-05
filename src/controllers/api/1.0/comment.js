var mongoose = require('mongoose'),
    rest = require('../../../services/rest.js'),
    discussion = require('../../../models/discussion.js'),
    comment = require('../../../models/comment.js');

function discuss(req,res){
    var id = mongoose.Types.ObjectId(req.params.entryId);
    document = new discussion({ entry: id });

    add(req,res,document);
}

function insert(req,res){
    discussion.findOne({ _id: req.params.id }, function(err, document){
        if(err){
            throw err;
        }
        add(req,res,document);
    });
}

function add(req,res,document){
    var model = {
        text: req.body.comment,
        author: {
            id: req.user._id,
            displayName: req.user.displayName,
            gravatar: req.user.gravatar
        }
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

module.exports = {
    get: list,
    discuss: discuss,
    ins: insert
};