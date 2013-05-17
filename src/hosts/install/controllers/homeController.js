'use strict';

var markdownService = require('../../../service/markdownService.js');

module.exports = {
    getIndex: function(req,res){
        res.render('home/index.jade', {
            profile: 'all',
            md: {
                env: markdownService.readFile('ENV.md'),
                tags: markdownService.readFile('TAGS.md')
            }
        });
    }
};