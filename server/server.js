'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');

var app = module.exports = loopback();

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();

  var request = require('request');
  function callback(error, response, body) {
    console.info("\n>>> response start");
    var info = JSON.parse(body);
    console.log(info);
    console.info("<<< response end\n");
  }

  var options = {
    baseUrl: 'http://127.0.0.1:3000/api/',
    uri: 'Messages/greet',
    method: 'GET',
    headers: {},
    // note: we need use >>snakeCase<< in qs
    qs: {
      msg: 0
    },
  };

  setTimeout(function () {
    request(options, callback);
  }, 500);
});
