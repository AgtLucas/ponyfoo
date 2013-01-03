var mongoose = require('mongoose'),
    schema = new mongoose.Schema({
        title: { type: String, require: true, trim: true },
        brief: { type: String, require: true },
        text: { type: String, require: true },
        date: { type: Date, require: true, default: Date.now }
    });

module.exports.model = mongoose.model('entry', schema);