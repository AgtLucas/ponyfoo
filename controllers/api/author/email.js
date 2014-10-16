'use strict';

var validator = require('validator');
var emailService = require('../../../services/email');
var subscriberService = require('../../../services/subscriber');
var markdownCompositeService = require('../../../services/markdownComposite');
var htmlService = require('../../../services/html');

module.exports = function (req, res, next) {
  var subject = req.body.subject;
  var teaser = req.body.teaser;
  var body = req.body.body;

  if (invalid()) {
    return;
  }

  var bodyHtml = markdownCompositeService.compile(body, { absolutize: true });

  subscriberService.broadcast('raw', {
    subject: subject,
    teaser: teaser,
    rawBody: bodyHtml
  });
  res.json({});

  function invalid () {
    var messages = [];
    if (!validator.isLength(subject, 4)) {
      messages.push('The email subject is way too short!');
    }
    if (!validator.isLength(teaser, 4)) {
      teaser = subject;
    }
    if (!validator.isLength(body, 10)) {
      messages.push('The email body should have some substance, don\'t you think?');
    }
    if (messages.length) {
      res.status(400).json({ messages: messages });
      return true;
    }
  }
};
