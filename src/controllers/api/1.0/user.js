var mongoose = require('mongoose'),
    rest = require('../../../services/rest.js'),
    user = require('../../../models/user.js');

function get(req,res){
    var id = mongoose.Types.ObjectId(req.params.id);

    user.findOne({ _id: id}, function(err,document){
        if(err){
            rest.resHandler(err,{res:res});
            return;
        }

        rest.resHandler(err,{
            res:res,
            then: function(){
                rest.end(res,{
                    user: document
                });
            }
        });
    });
}

module.exports = {
    get: get
};