var mongoose = require('mongoose'),
    comment = require('./schema/comment.js'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    schema = new mongoose.Schema({
        blog: { type: ObjectId, index: { unique: false }, require: true },
        entry: { type: ObjectId, index: { unique: false }, require: true },
        date: { type: Date, index: { unique: false }, require: true, default: Date.now },
        comments: [comment]
    });

module.exports = mongoose.model('discussion', schema);