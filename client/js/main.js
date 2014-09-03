'use strict';

var $ = require('dominus');
var jade = require('jade/runtime');
var ponymark = require('ponymark');
var taunus = require('taunus');
var moment = require('moment');
var markdownService = require('../../services/markdown');
var setupMeasly = require('./setupMeasly');

global.$ = $; // merely for debugging convenience
global.jade = jade; // let jade have it their way
global.moment = moment; // let rome use our moment instance
global.taunus = taunus; // debugging is king!
global.md = markdownService.compile; // pretty useful too

var wiring = require('./wiring');
var main = $.findOne('.ly-main');

taunus.once('render', function (container, viewModel) {
  if (viewModel.env.name !== 'production') {
    return;
  }
  require('./vendor/ga');
  require('./vendor/clicky');
  require('./vendor/twitter.widget');
  require('./lib/twitter');
});

ponymark.configure({
  markdown: markdownService.compile,
  imageUploads: '/api/markdown/images'
});

setupMeasly();

taunus.mount(main, wiring);
