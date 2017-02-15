var psErr = require('../../server/data/error-code.js');
var dateFormat = require('dateformat');
var _ = require('lodash');
var rules = require('./lib/rules.js');

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

  var toLocal = function(date) {
    if (typeof date === "string" && /\+\d{2}/.test(date)) {
      data = new Date(date.replace(/\+.*$/, ""));
    }
    var local = date.toLocaleString('en-US', {
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    return local;
  };

  var toUTC = function(date) {
    date = new Date(date);
    return date.toISOString().replace(/Z/, "+00");
  };

  var toStartDay = function(date) {
    date = new Date(date);
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    return date;
  };

  var checkOverNight = function(start, end) {
    var getDay = function(str) {
      return new Date(str).getDate();
    };
    var startDay = getDay(start);
    var endDay = getDay(end);
    if (startDay === endDay) {
      return false;
    }
    return true;
  };

  var parseSigleItem = function(str) {
    var output = [];
    var arr = str.replace(/",""$/, "").replace(/^"/, "").split(/","/);
    var today = new Date();
    var year = today.getFullYear();
    var start = new Date(arr[1]).setFullYear(year);
    var end = new Date(arr[2]).setFullYear(year);
    if (checkOverNight(start, end)) {
      var middleNight = toStartDay(end);
      return output = [{
        label: arr[0],
        saveDate: toUTC(toStartDay(start)),
        start: toUTC(start),
        end: toUTC(middleNight),
      }, {
        label: arr[0],
        saveDate: toUTC(toStartDay(middleNight)),
        start: toUTC(middleNight),
        end: toUTC(end),
      }];
    } else {
      return output = [{
        label: arr[0],
        saveDate: toUTC(toStartDay(start)),
        start: toUTC(start),
        end: toUTC(end),
      }];
    }
  };

  /***************** Define remote method logic *******************/

  TimeLog.updateDatebase = function(data, callback) {
    var rawArr = data.split('\n');
    var finanlyArr = [];
    var saveDates = [];
    var noTotal = false;
    rawArr.forEach(function(item, index) {
      if (/Type,/.test(item) || item.length === 0 || noTotal) {
        return;
      }
      if (/^,/.test(item)) {
        return noTotal = true;
      }

      var parseItem = parseSigleItem(item);
      if (saveDates.indexOf(parseItem.saveDate) === -1) {
        saveDates.push(parseItem.saveDate);
      }

      parseItem.forEach(function(i) {
        finanlyArr.push(i);
      });
    });
    var where = {
      saveDate: {
        inq: saveDates
      }
    };
    TimeLog.destroyAll(where)
    .then(function(res) {
      console.info("Log: delete " + res.count + " records from database.");
      return TimeLog.create(finanlyArr);
    }).then(function(res) {
      console.info("Log: update database success.");
      return callback(null, "success.");
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
    var filter = {
      where: {
        and: [
          { saveDate: { gt: startDate } },
          { saveDate: { lte: saveDate } }
        ]
      }
    };

    var groupByDate = function groupByDate(arr) {
      var keys = [];
      var output = {};
      arr.forEach(function(i) {
        var saveDate = toLocal(i.__data.saveDate).replace(/\/\d{4}.*$/, "");
        var data = {
          label: i.__data.label,
          start: toLocal(i.__data.start),
          end: toLocal(i.__data.end),
          saveDate,
          duration: (i.__data.end - i.__data.start) / 1000 / 60
        };
        if (keys.indexOf(saveDate) === -1) {
          keys.push(saveDate);
          output[saveDate] = [];
        }
        output[saveDate].push(data);
      });
      return output;
    };

    TimeLog.find(filter).then(function(res) {
      var displayData = rules(groupByDate(res));
      callback(null, displayData);
    }).catch(function(err) {
      callback(err);
    });
    
  };

  /***************** Defind remote method *******************/

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
