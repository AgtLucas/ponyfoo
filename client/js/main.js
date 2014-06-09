'use strict';

var $ = require('dominus');
var ponymark = require('ponymark');
var taunus = require('taunus');
var routes = require('./routes');
var main = $.findOne('.ly-main');

global.$ = $;

ponymark.configure({
  imageUploads: '/api/markdown-images'
});

taunus.mount(main, routes);
