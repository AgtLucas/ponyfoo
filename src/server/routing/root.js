var config = require('../../config.js'),
    sitemap = require('../../logic/sitemap.js'),
    opensearch = require('../../logic/opensearch.js'),
    feed = require('../../logic/feed.js');

module.exports = {
    configure: function (server){
        server.get(config.sitemap.relative, sitemap.get);
        server.get(config.opensearch.relative, opensearch.get);
        server.get(config.feed.relative, feed.get);
    }
};