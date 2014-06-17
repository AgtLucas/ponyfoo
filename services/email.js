'use strict';

var _ = require('lodash');
var path = require('path');
var campaign = require('campaign');
var winston = require('winston');
var env = require('../lib/env');
var production = env('NODE_ENV') === 'production';
var staging = env('NODE_ENV') === 'staging';
var client = createClient();
var defaults = {
  social: {
    twitter: {
      url: 'https://twitter.com/ponyfoo',
      handle: '@ponyfoo'
    },
    landing: {
      url: 'http://ponyfoo.com',
      name: 'Pony Foo'
    }
  }
};

function createClient () {
  var options = {
    templateEngine: require('campaign-jade')
  };
  if (staging) { // staging environments should trap emails
    options.trap = true;
  } else if (!production) { // during development, there's no reason to send any emails
    options.provider = campaign.providers.terminal();
  }
  return campaign(options);
}

function send (type, model, done) {
  var extended = _.assign({}, defaults, model);
  var template = path.resolve('views/emails', type);
  client.send(template, extended, done);
}

function logger (err) {
  if (err) {
    winston.error('Email sending failed', {
      err: err,
      args: arguments
    });
  } else {
    winston.debug('Email sent');
  }
}

module.exports = {
  send: send,
  logger: logger
};
