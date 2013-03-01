var config = require('../config.js'),
    blog = require('../models/blog.js'),
    live;

function getStatus(done){
    if(live !== undefined){
        process.nextTick(done);
        return;
    }

    blog.count({}, function(err, count){
        live = count > 0;
        done();
    });
}

function getBlogSlug(req){
    var i = req.host.lastIndexOf('.' + config.server.tld),
        slug = req.host.substr(0, i);

    return slug;
}

function findBlog(req,res){
    getStatus(function(){
        var slug = getBlogSlug(req),
            reserve = config.server.tldReserved;

        if(!live){ // website isn't configured at all
            if (req.url !== '/' || slug !== config.server.defaultSlug){
                return res.redirect(config.server.host); // not 301 because the slug can be claimed
            }
            res.blog = 'dormant';
            return renderView(req,res);
        }

        if(reserve !== undefined && reserve.test(slug)){
            return res.redirect(config.server.host, 301); // this blog name is forbidden, 301 to the default blog.
        }

        // the website is live and the blog could be user-defined
        blog.findOne({ slug: slug }, function(err, document){
            if(document !== null){ // this is the blog we're going to use
                res.blog = document;
            }else{ // allow the user to grab the blog
                if (req.url !== '/'){
                    return res.redirect('/'); // not 301 because the slug can be claimed
                }
                res.blog = 'available';
            }
            renderView(req,res);
        });
    });
}

function renderView(req,res){
    var profile, locals, connected = req.user !== undefined;

    if(typeof res.blog === 'string'){
        profile = res.blog;
    }else{
        if(!connected){
            profile = 'anon';
            locals = JSON.stringify({
                profile: 'anon',
                connected: false
            });
        }else{
            if(req.user.blogger !== true){
                profile = 'registered';
            }else{
                profile = 'blogger';
            }
            locals = JSON.stringify({
                id: req.user._id,
                profile: profile,
                connected: true,
                blogger: req.user._id.equals(req.blog.owner)
            });
        }
        res.locals.assetify.js.add('!function(a){a.locals=' + locals + ';}(nbrut);');
    }

    res.render('layouts/' + profile + '.jade', { profile: profile });
}

module.exports = {
    hostValidation: function(req,res,next){
        var val = config.server.hostRegex;
        if (val !== undefined && !val.test(req.host)){
            res.redirect(config.server.authority + req.url, 301);
            return;
        }
        next();
    },
    get: findBlog
};