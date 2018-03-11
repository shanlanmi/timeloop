var path = require('path');
var loopback = require('loopback');

module.exports = function(app) {
  // Install a "/ping" route that returns "pong"
  function dir(relative) {
    var path = require('path');
    return path.resolve(__dirname, '../..', relative);
  }

  app.get('/', function(req, res) {
    res.sendFile(dir('client/index.html'));
  });

  app.get('/task', function(req, res) {
    res.sendFile(dir('client/task.html'));
  });
};
