var path = require('path');
var loopback = require('loopback');

module.exports = function(app) {
  // Install a "/ping" route that returns "pong"
  function pt(relative) {
    return path.resolve(__dirname, '../..', relative);
  }

  app.get('/ping', function(req, res) {
    res.sendFile(pt('client/college/list.html'));
  });

  app.get('/college/list', function(req, res) {
    res.sendFile(pt('client/college/list.html'));
  });
};
