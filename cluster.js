'use strict';

require('./chdir');

var fs = require('fs');
var path = require('path');
var recluster = require('recluster');
var options = { workers: 2, backoff: 10 };
var cluster = recluster('./app.js', options);
var pidfile = path.resolve('.pid');

fs.writeFileSync(pidfile, process.pid.toString() + '\n');

log('warming up...');

cluster.run();

process.on('SIGUSR2', function() {
  log('got SIGUSR2, reloading...');
  cluster.reload();
});

process.on('SIGINT', function () {
  process.exit();
});

process.on('exit', function () {
  log('shutting down...');
  fs.unlinkSync(pidfile);
});

function log (message) {
  console.log('\nCluster', process.pid, message);
}
