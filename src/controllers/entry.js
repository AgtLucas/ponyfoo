var mongoose = require('mongoose'),
    models = require('../models/all.js'),
	model = models.entry,
	resHandler = function(res, err, success){
		res.writeHead(200, { 'Content-Type': 'application/json' });
		
		var test = !!err;		
		if (test){
			var json = JSON.stringify({
				error: true
			});
			res.write(json);
			res.end();
		}else{
			(success || res.end)();
		}
	},
	done = function(res, err){
		resHandler(res, err);
	};
	
module.exports = {
    get: function(req,res){
        var callback = function(err,documents){
			resHandler(res, err, function(){
                var json = JSON.stringify({
                    entries: documents
                });
                res.end(json);
            });
		};

        model.find({}).sort('-date').limit(8).exec(callback);
    },
	
	getOne: function(req,res){
        var id = req.params.id,
			callback = function(err,document){
                resHandler(res, err, function(){
					var json = JSON.stringify({
						entry: document
					});
					res.end(json);
				});
			};

        model.findOne({ _id: id }).exec(callback);
	},

    put: function(req,res){
        var document = req.body.entry,
			instance,
			callback = function(err){
				done(res,err);
			};

        instance = new model(document);
		instance.save(callback);
    },
	
	upd: function(req,res){
		var id = req.params.id,
            document = req.body.entry,
			callback = function(err){
				done(res,err);
			};
		
        document.updated = new Date();
        model.findOneAndUpdate({ _id: id }, document, {}, callback);
	},

	del: function(req,res){
		var id = req.params.id,
			callback = function(err){
				done(res,err);
			};
			
		model.remove({ _id: id }, callback);
	}
};