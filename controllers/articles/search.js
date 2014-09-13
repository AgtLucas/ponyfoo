'use strict';

var util = require('util');
var listOrSingle = require('./lib/listOrSingle');
var articleSearch = require('../../services/articleSearch');
var env = require('../../lib/env');
var authority = env('AUTHORITY');
var separator = /[+/,_: -]+/ig;

module.exports = function (req, res, next) {
  var terms = req.params.terms.split(separator);
  var title = util.format('Search results for "%s"', terms.join('", "'));
  var handle = listOrSingle(res, next);

  res.viewModel = {
    model: {
      title: title,
      meta: {
        canonical: authority + '/articles/search/' + terms.join('-'),
        description: 'This search results page contains all of the ' + title.toLowerCase()
      }
    }
  };

  articleSearch.query(terms, handle);
};
