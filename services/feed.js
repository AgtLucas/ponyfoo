'use strict';

var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var RSS = require('rss');
var contra = require('contra');
var winston = require('winston');
var util = require('util');
var moment = require('moment');
var Article = require('../models/Article');
var env = require('../lib/env');
var htmlService = require('./html');
var authority = env('AUTHORITY');
var contact = 'Nicolas Bevacqua <nico@bevacqua.io>';
var location = path.join(__dirname, '../.bin/static/feed.xml');

function generate (articles, done) {
  var absolutes = {};
  var tags = _(articles).pluck('tags').flatten().unique().value();
  var now = moment();
  var feed = new RSS({
    title: 'Pony Foo',
    description: 'Latest articles published on Pony Foo',
    generator: 'bevacqua/ponyfoo',
    feed_url: authority + '/articles/feed',
    site_url: authority,
    image_url: authority + '/img/ponyfoo.png',
    author: contact,
    managingEditor: contact,
    webMaster: contact,
    copyright: util.format('%s, %s', contact, now.format('YYYY')),
    language: 'en',
    categories: tags,
    pubDate: now.clone().toDate(),
    ttl: 15,
  });

  contra.each(articles, absolutize, fill);

  function absolutize (article, done) {
    htmlService.absolutize(article.introductionHtml, function (err, html) {
      if (err) {
        done(err); return;
      }
      absolutes[article._id] = html;
    });
  }

  function fill (err) {
    if (err) {
      done(err); return;
    }

    articles.forEach(function insert (article) {
      feed.item({
        title: article.title,
        description: absolutes[article._id],
        url: authority + article.permalink,
        categories: article.tags,
        author: contact,
        date: moment(article.publication).toDate()
      });
    });

    done(null, feed.xml());
  }
}

function rebuild () {
  contra.waterfall([fetch, generate, persist], done);

  function fetch (next) {
    Article.find({ status: 'published' }).sort('-publication').exec(next);
  }

  function persist (xml, next) {
    mkdirp.sync(path.dirname(location));
    fs.writeFile(location, xml, next);
  }

  function done (err) {
    if (err) {
      winston.warn('Error trying to regenerate RSS feed', err); return;
    }
    winston.debug('Regenerated RSS feed');
  }
}

module.exports = {
  rebuild: rebuild
};
