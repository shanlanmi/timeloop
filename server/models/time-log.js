var psErr = require('../../server/data/error-code.js');

module.exports = function(TimeLog) {

  TimeLog.createTable = function() {
    var ds = TimeLog.app.dataSources.db;
    // ds.createModel(schema_v1.name, schema_v1.properties, schema_v1.options);
    ds.automigrate(function () {
      ds.discoverModelProperties('TimeLog', function (err, props) {
        console.log(props);
      });
    });
  };

  var parseSigleItem = function (str) {
    var arr = str.replace(/",""$/, "").replace(/^"/, "").split(/","/);
    var today = new Date();
    var year = today.getFullYear();
    var start = new Date(year + arr[1]).toLocaleString() + "+08";
    var end = new Date(year + arr[2]).toLocaleString() + "+08";
    var saveDate = start.replace(/,.*$/, "");
    var output = {
      label: arr[0],
      saveDate,
      start,
      end
    };
    return output;
  };

  TimeLog.updateToday = function(data, callback) {
    var rawArr = data.split('\n');
    var finanlyArr = [];
    var noTotal = false;
    rawArr.forEach(function(item) {
      if (/Type,/.test(item) || item.length === 0 || noTotal) {
        return;
      }
      if (/^,/.test(item)) {
        noTotal = true;
        return;
      }
      finanlyArr.push(parseSigleItem(item));
    });
    var where = {
      saveDate: finanlyArr[1].saveDate 
    };
    TimeLog.destroyAll(where)
    .then(function(res) {
      return TimeLog.create(finanlyArr);
    }).then(function(res) {
      callback(null, "update success.");
    }).catch(function(err) {
      callback(err);
    });
  };

  /**
   * Defind remote method
   */
  TimeLog.remoteMethod('updateToday', {
    returns: { type: "string", arg: "update"},
    http: { verb: 'get', path: '/update', status: 200 },
    description: 'Read report.txt file and create new records in Postgres.'
  });
};
