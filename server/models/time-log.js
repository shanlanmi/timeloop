var dateFormat = require('dateformat');
var rules = require('./lib/rules.js');
var _ = require('lodash');

module.exports = function(TimeLog) {

  /***************** Common method *******************/

  TimeLog.createTable = function() {
    var ds = TimeLog.app.dataSources.db;
    ds.automigrate(function () {
      ds.discoverModelProperties('TimeLog', function (err, props) {
        if (err) { console.error(err); }
        console.log(props);
      });
    });
  };

  var toLocal = function(date) {
    if (typeof date === "string" && /\+\d{2}/.test(date)) {
      date = new Date(date.replace(/\+.*$/, ""));
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
    var arr = str.replace(/",""$/, "").replace(/^"/, "").split(/","/);
    var today = new Date();
    var year = today.getFullYear();
    var start = new Date(arr[1]).setFullYear(year);
    var end = new Date(arr[2]).setFullYear(year);
    if (checkOverNight(start, end)) {
      var middleNight = toStartDay(end);
      return [{
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
    }
    return [{
      label: arr[0],
      saveDate: toUTC(toStartDay(start)),
      start: toUTC(start),
      end: toUTC(end),
    }];
  };

  /***************** Define remote method logic *******************/

  TimeLog.updateDatebase = function(data, callback) {
    var rawArr = data.split('\n');
    var finanlyArr = [];
    var saveDates = [];
    var destroyDates = [];
    var noTotal = false;
    function findSaveDates(oneSave) {
      var index = _.findIndex(saveDates, function(i) {
        return i.date === oneSave;
      });
      return index;
    }

    rawArr.forEach(function(item, index) {
      if (/Type,/.test(item) || item.length === 0 || noTotal) {
        return;
      }
      if (/^,/.test(item)) {
        noTotal = true;
        return;
      }

      var parseItem = parseSigleItem(item);

      parseItem.forEach(function(i) {
        finanlyArr.push(i);
        if (findSaveDates(i.saveDate) === -1) {
          saveDates.push({
            date: i.saveDate,
            count: 1,
          });
        } else {
          saveDates[findSaveDates(i.saveDate)].count += 1;
        }
      });
    });
    saveDates.forEach(function(oneSave) {
      if (oneSave.count === 1) {
        return;
      }
      destroyDates.push(oneSave.date);
    });
    var where = {
      saveDate: {
        inq: destroyDates
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
    var periodDay = period * oneDay;
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
      },
      order: 'start ASC',
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
          saveDate: saveDate,
          duration: (i.__data.end - i.__data.start) / 1000 / 60,
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
