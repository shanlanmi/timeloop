var _ = require('lodash');

var options = {

};

var analyseOneDay = function(oneDay) {
  var output = {};
  var sum;

  // get keys
  var keys = [];
  oneDay.forEach(function(obj) {
    keys.push(obj.label);
  });
  var counts = _.countBy(keys);
  var keys = _.uniq(keys);

  // get sum
  keys.forEach(function(key) {
    sum = 0;
    oneDay.forEach(function(oneTask) {
      if (oneTask.label === key) {
        return sum += oneTask.duration;
      }
      return null;
    });
    output[key] = {
      sum
    };
  });

  // get count
  keys.forEach(function(key) {
    output[key].count = counts[key];
  });
  return output;
  
};

var getSum = function(data) {
  var sumRes = [];
  var keys = Object.keys(data);

  keys.forEach(function(key) {
    var result = analyseOneDay(data[key]);
    sumRes.push({
      date: key,
      result: result
    });
  });
  return sumRes;
  
};

module.exports = function(data) {
  var output = getSum(data);

  return output;
  
};

