/**
 * Module dependencies.
 */
var express = require('express');
var mongoose = require('mongoose');

/**
 * Create Express server.
 */
var app = express();

/**
 * Bootstrap Express settings and routes
 */
require('./config/express')(app);
require('./routes')(app);

/**
 * Connect to MongoDB.
 */
mongoose.connect(process.env.MONGOLAB_URI || process.env.MONGODB);
mongoose.connection.on('error', function() {
  console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});

/**
 * Start Express server.
 */
app.listen(app.get('port'), function() {
  console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});

module.exports = app;
