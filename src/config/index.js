'use strict';

var path = require('path'),
    env = require('./env.js');

var config = {
    meta: require('./meta.js'),
    pkg: require(path.join(process.cwd(), '/package.json')),
    env: {
        current: env.NODE_ENV,
        get development(){ return this.current === 'development'; },
        get staging(){ return this.current === 'staging'; },
        get production(){ return this.current === 'production' || this.staging; }
    },
    statics: {
        folder: function(base){ return path.join(base, '/static'); },
        bin: function(base){ return path.join(base, '/static/.bin'); },
        faviconSource: path.resolve(__dirname, '../frontend/favicon.ico'),
        favicon: '/favicon.ico'
    },
    logging: { level: env.LOG_LEVEL },
    zombie: {
        enabled: env.ENABLE_ZOMBIE_CRAWLER,
        cache: 60000 * 60 // an hour, in ms
    },
    db: { uri: env.MONGOLAB_URI || env.MONGO_URI },
    security: {
        saltWorkFactor: env.SALT_WORK_FACTOR,
        sessionSecret: env.SESSION_SECRET
    },
    tracking: {
        analytics: env.GA_CODE,
        clicky: env.CLICKY_SITE_ID
    },
    sitemapIndex: {
        cache: 60000 * 30, // half an hour, in ms
        relative: '/sitemap_index.xml',
        physical: function(){
            return '/sitemaps/__index.xml';
        }
    },
    sitemap: {
        cache: 60000 * 30, // half an hour, in ms
        relative: '/sitemap.xml',
        physical: function(slug){
            return '/sitemaps/' + (slug || '__market') + '.xml';
        }
    },
    feed: {
        cache: 60000 * 30, // relatively short-lived cache survives for half an hour
        relative: '/rss/latest.xml',
        physical: function(slug){
            return '/rss/' + slug + '.xml';
        },
        limit: 12
    },
    get site() {
        return {
            doctype: '<!DOCTYPE html>',
            thumbnail: this.server.host + '/img/thumbnail.png',
            displayVersion: env.ENABLE_VERSION_DISPLAY,
            version: 'v' + this.pkg.version,
            get versionString(){ return '<!-- engine: ' + this.version + ' -->'; },
            name: env.PLATFORM_NAME
        };
    },
    remail: /^[a-z0-9.!#$%&'*+\/=?\^_`{|}~\-]+@[a-z0-9\-]+(?:\.[a-z0-9\-]+)*$/i,
    rlink: /\bhttps?:\/\/[\-a-z0-9+&@#\/%?=~_|!:,.;]*[\-a-z0-9+&@#\/%=~_|]/i,
    auth: {
        success: '/',
        login: '/user/login',
        logout: '/user/logout',
        ancient: '/user/login/ancient',
        facebook: {
            get enabled(){ return this.id && this.secret; },
            id: env.FACEBOOK_APP_ID,
            secret: env.FACEBOOK_APP_SECRET,
            link: '/user/login/facebook',
            callback: '/user/login/facebook/callback'
        },
        github: {
            get enabled(){ return this.id && this.secret; },
            id: env.GITHUB_CLIENT_ID,
            secret: env.GITHUB_CLIENT_SECRET,
            link: '/user/login/github',
            callback: '/user/login/github/callback'
        },
        google: {
            enabled: true,
            link: '/user/login/google',
            callback: '/user/login/google/callback'
        },
        linkedin: {
            get enabled(){ return this.id && this.secret; },
            id: env.LINKEDIN_API_KEY,
            secret: env.LINKEDIN_API_SECRET,
            link: '/user/login/linkedin',
            callback: '/user/login/linkedin/callback'
        }
    },
    uploads: { imgurKey: env.IMGUR_API_KEY },
    avatar: {
        url: 'http://www.gravatar.com/avatar/',
        query: '?d=identicon&r=PG',
        tiny: '&s=24',
        small: '&s=40',
        regular: '&s=60'
    },
    contact: require('./contact.js'),
    api: require('./api.js'),
    bin: require('./bin.js'),
    blog: require('./blog.js'),
    docs: require('./docs.js'),
    email: require('./email.js'),
    market: require('./market.js'),
    server: require('./server.js'),
    twitter: require('./twitter.js'),
    tokenExpiration: env.TOKEN_EXPIRATION
};

module.exports = config;