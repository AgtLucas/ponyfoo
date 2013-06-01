'use strict';

var config = require('./config'),
    mongoose = require('mongoose'),
    mongoUri = config.db.uri;

function connect(done){
    mongoose.connect(mongoUri);
    mongoose.connection.on('error', function(err){
        console.error('MongoDB connection failed. Ensure MongoDB is installed, up, and running.');
        done(err);
    });
    mongoose.connection.on('open', function() {
        console.log('Connected to Mongoose');
        done();
    });
}

module.exports = {
    connect: connect
};