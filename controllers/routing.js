'use strict';

var jade = require('jade/runtime');
var taunus = require('taunus');
var transports = require('transports');
var routes = require('./routes');
var verifyAccountEmail = require('./account/verifyEmail');
var registerAccount = require('./account/register');
var markdownImageUpload = require('./api/markdown/images');
var articleList = require('./api/articles/list');
var articleInsert = require('./api/articles/insert');
var articleUpdate = require('./api/articles/update');
var articleRemove = require('./api/articles/remove');
var articleRecompute = require('./api/articles/recompute')
var authorOnly = require('./author/only');
var errors = require('../lib/errors');

global.jade = jade; // let jade have it their way

module.exports = function (app) {
  app.put('/api/markdown/images', markdownImageUpload);

  app.get('/api/articles', articleList);
  app.put('/api/articles', authorOnly, articleInsert);
  app.patch('/api/articles/:slug', authorOnly, articleUpdate);
  app.delete('/api/articles/:slug', authorOnly, articleRemove);
  app.post('/api/articles/compute-relationships', authorOnly, articleRecompute);

  app.get('/account/verify-email/:token([a-f0-9]{24})', verifyAccountEmail);

  // app.post('/account/request-password-reset', passwordResetController.requestPasswordReset);
  // app.get('/account/password-reset/:token([a-f0-9]{24})', passwordResetController.validateToken);
  // app.post('/account/reset-password/:token([a-f0-9]{24})', passwordResetController.resetPassword);

  transports.routing(app, registerAccount);

  taunus.mount(app, routes);
  app.use(errors.handler);
};
