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
  var sums = _.sumBy(oneDay, function(obj) {
    return obj.duration;
  })
  keys.forEach(function(key) {
    sum = 0;
    oneDay.forEach(function(oneTask) {
      if (oneTask.label !== key) { return; }
      sum += oneTask.duration;
    });
    output[key] = {
      sum
    };
  });

  // get count
  keys.forEach(function(key) {
    output[key].count = counts[key];
  });

  console.dir(output);
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

