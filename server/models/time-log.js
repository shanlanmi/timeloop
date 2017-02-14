var psErr = require('../../server/data/error-code.js');
var dateFormat = require('dateformat');

module.exports = function(TimeLog) {

  /***************** Common method *******************/

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

  /***************** Define remote method logic *******************/

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

  TimeLog.month = function(date, period, callback) {
    period = period || 30;
    var oneDay = 24 * 60 * 60 * 1000;
    var periodDay = (period - 1) * oneDay;
    var yesterday = new Date(new Date() - oneDay);
    var saveDate = dateFormat(yesterday, 'isoDate');
    var startDate = dateFormat(new Date(new Date(saveDate) - periodDay), 'isoDate');
    date = date || saveDate;
    console.dir(yesterday);
    var filter = {
      where: {
        and: [
          { saveDate: { gt: startDate } },
          { saveDate: { lte: saveDate } }
        ]
      }
    };
    TimeLog.find(filter).then(function(res) {
      callback(null, res);
    }).catch(function(err) {
      callback(err);
    });
    // console.dir(startDate);
    // callback(null, saveDate);
    
  };

  /***************** Defind remote method *******************/

  TimeLog.remoteMethod('updateToday', {
    returns: { type: "string", arg: "update"},
    http: { verb: 'get', path: '/update', status: 200 },
    description: 'Read report.txt file and create new records in Postgres.'
  });

  TimeLog.remoteMethod('month', {
    accepts: [{
      arg: "date",
      type: "string",
      description: "Which day is the basic day? e.g.'2017-03-03'",
      http: { source: "query" },
      required: false
    }, {
      arg: "period",
      type: "number",
      description: "How many the nearest day query for ?",
      http: { source: "query" },
      required: false
    }],
    returns: { type: "object", root: true },
    http: { verb: "get", path: "/month", status: 200 },
    description: "Display the time log of the specify days."
  });

};
