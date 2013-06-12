'use strict';

var mongoose = require('mongoose'),
    moment = require('moment'),
    config = require('../config'),
    Pingback = require('./schema/Pingback.js'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    schema = new mongoose.Schema({
        blog: { type: ObjectId, index: { unique: false }, require: true },
        title: { type: String, require: true, trim: true },
        slug: { type: String, require: true, trim: true },
        brief: { type: String, require: true },
        text: { type: String, require: true },
        date: { type: Date, index: { unique: false }, require: true, 'default': Date.now },
		updated: { type: Date, require: true, 'default': Date.now },
        previous: { type: ObjectId, index: { unique: false }, 'default': null },
        next: { type: ObjectId, index: { unique: false }, 'default': null },
        tags: [String],
        pingbacksEnabled: { type: Boolean, 'default': true },
        pingbacks: [Pingback],
        pings: [String]
    },{ id: false, toObject: { getters: true }, toJSON: { getters: true } });

schema.virtual('permalink').get(function(){
    var date = moment(this.date).format('YYYY/MM/DD'),
        permalink = '/' + date + '/' + this.slug;

    return permalink;
});

module.exports = mongoose.model('entry', schema);