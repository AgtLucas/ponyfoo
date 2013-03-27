'use strict';

var config = require('../../../config.js'),
    logic = require('../../../logic/blog.js'),
    blog = require('../../../models/blog.js'),
    crud = require('../../../services/crud.js')(blog),
    validate = require('./blog-validation.js').validate,
    user = require('../../../models/user.js'),
    rest = require('../../../services/rest.js');

function update(req,res){
    var document = validate(req,res);
    if (document === undefined){
        return;
    }

    crud.update({ _id: req.blog._id }, document, {
        res: res
    });
}

function claimValidation(req,res,next){
    if(logic.dormant){ // dormant
        return awaken(req,res,next);
    }
    if(!config.server.slugged){
        return next(); // claiming is disabled
    }

    // attempt to claim
    var slug = logic.getSlug(req),
        slugTest = config.server.slugRegex;

    if(slugTest !== undefined && !slugTest.test(slug)){
        return next(); // this slug is an alias of the main blog.
    }

    if(!req.user){ // users must be connected to claim a blog
        return next();
    }

    blog.findOne({ owner: req.user._id }, function(err, document){
        if(err){
            throw err;
        }
        if(document !== null){ // users can own a single blog at most
            return flashValidation(req,res,'You already own a blog!');
        }
        if(!isValid(req,res)){
            return;
        }

        blog.findOne({ slug: slug }, function(err, document){
            if(document !== null){
                return flashValidation(req,res,'This blog already has an owner!');
            }
            create(req,res);
        });
    });
}

function isValid(req,res,isAwakening){
    var email = req.body['user.email'],
        password = req.body['user.password'],
        title = req.body['blog.title'];

    if(isAwakening && !email || !password){ // the most basic form of validation, since it's just the super admin
        return flashValidation(req,res,'Oops, you should fill out every field');
    }
    if(!title){
        return flashValidation(req,res,'Oops, you forgot to pick a blog title!');
    }
    return true;
}
function awaken(req,res){
    var email = req.body['user.email'],
        password = req.body['user.password'],
        title = req.body['blog.title'],
        document;

    if(!isValid(req,res,true)){
        return;
    }

    document = new user({
        email: email,
        displayName: email.split('@')[0],
        password: password
    });
    document.save(function then(err,user){
        if(err){
            throw err;
        }
        req.login(user,function(err){
            if(err){
                throw err;
            }
            
            create(req,res,{
                user: user,
                slug: config.server.defaultBlog
            });
        });
    });
}

function create(req,res,opts){
    var o = opts || {},
        owner = o.user || req.user,
        slug = o.slug || logic.getSlug(req),
        title = req.body['blog.title'];

    new blog({
        owner: owner._id,
        slug: slug,
        title: title,
        social: {
            rss: true
        }
    }).save(function(){
        var host = config.server.hostSlug(slug);
        logic.live = true;
        res.redirect(host);
    });
}

function flashValidation(req,res,message){
    req.flash('validation', message);
    res.redirect('/');
}

function forbidden(res){
    rest.end(res,{
        status: 'forbidden'
    });
}

function market(req,res,next){
    if(req.blogStatus !== 'market'){
        return next();
    }

    var slug = req.body.slug;
    if(!slug || typeof slug !== 'string'){
        return forbidden(res);
    }

    if(!/^[a-z0-9][a-z0-9\-]{2,}[a-z0-9]$/i.test(slug)){
        return forbidden(res);
    }

    var slugTest = config.server.slugRegex;
    if (slugTest !== undefined && !slugTest.test(slug)){
        return forbidden(res);
    }

    blog.count({ slug: slug }, function(err,count){
        if(err){
            throw err;
        }

        rest.end(res,{
            status: count === 0 ? 'available' : 'taken'
        });
    });
}

module.exports = {
    update: update,
    claim: claimValidation,
    market: market
};