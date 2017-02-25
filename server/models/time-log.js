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

  var getSaveDate = function(startDate) {
    var start = new Date(startDate);
    return dateFormat(start, 'isoDate');
  };

  var rawToArr = function(raw) {

    var noTotal = false;
    var output = [];
    var splitArr = raw.split('\n');
    splitArr.forEach(function(item) {
      if (/Type,/.test(item) || item.length === 0 || noTotal) {
        return;
      }
      if (/^,/.test(item)) {
        noTotal = true;
        return;
      }
      output.push(item);
    });
    return output;

  };

  var parseArr = function(arr) {
    var output = [];
    arr.forEach(function(str) {
      var arr = str.replace(/",""$/, "").replace(/^"/, "").split(/","/);
      var today = new Date();
      var year = today.getFullYear();
      var start = new Date(arr[1]).setFullYear(year);
      var end = new Date(arr[2]).setFullYear(year);
      if (checkOverNight(start, end)) {
        var middleNight = toStartDay(end);
        output.push({
          label: arr[0],
          saveDate: getSaveDate(start),
          start: toUTC(start),
          end: toUTC(middleNight),
        });
        output.push({
          label: arr[0],
          saveDate: getSaveDate(middleNight),
          start: toUTC(middleNight),
          end: toUTC(end),
        });
        return;
      }
      output.push({
        label: arr[0],
        saveDate: getSaveDate(start),
        start: toUTC(start),
        end: toUTC(end),
      });
    });
    return output;
  };

  var sigleCoreFilter = function(arr) {

    var saveDateCounts = [];
    var sigleCoreDates = [];
    var outputArr = [];
    var saveDateArr = [];
    function findSaveDates(oneSave) {
      return _.findIndex(saveDateCounts, function(i) {
        return i.date === oneSave;
      });
    }
    arr.forEach(function(item) {
      if (findSaveDates(item.saveDate) === -1) {
        saveDateCounts.push({
          date: item.saveDate,
          count: 1,
        });
      } else {
        saveDateCounts[findSaveDates(item.saveDate)].count += 1;
      }
    });
    saveDateCounts.forEach(function(oneSave) {
      if (oneSave.count < 2) {
        sigleCoreDates.push(oneSave.date);
      } else {
        saveDateArr.push(oneSave.date);
      }
    });
    arr.forEach(function(item) {
      if (sigleCoreDates.indexOf(item.saveDate) === -1) {
        outputArr.push(item);
      }
    });
    return [outputArr, saveDateArr];

  };


  /***************** Define remote method logic *******************/

  TimeLog.updateDatebase = function(data, callback) {
    var dateArr = rawToArr(data);
    dateArr = parseArr(dateArr);
    var filterResult = sigleCoreFilter(dateArr);
    dateArr = filterResult[0];
    var destroyDates = filterResult[1];

    var where = {
      saveDate: {
        inq: destroyDates
      }
    };
    TimeLog.destroyAll(where)
    .then(function(res) {
      console.info("Log: delete " + res.count + " records from database.");
      return TimeLog.create(dateArr);
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
    yesterday.setHours(23);
    yesterday.setMinutes(59);
    var endDate = yesterday.toISOString();
    var startDate = dateFormat(new Date(new Date(endDate) - periodDay), 'isoDate');
    date = date || endDate;
    var filter = {
      where: {
        and: [
          { start: { gt: startDate } },
          { start: { lte: endDate } }
        ]
      },
      order: 'start ASC',
    };

    var groupByDate = function groupByDate(arr) {
      var keys = [];
      var output = {};
      arr.forEach(function(i) {
        var saveDate = i.__data.saveDate;
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
