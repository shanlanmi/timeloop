var _ = require('lodash');

var Rules = function(data) {
  this.data = data;
  this.options = {
    count: {
      pomodoro: [
        'Upgrde',
        'Maintain',
        'Daily',
        'Read',
        'Weekly',
        'RSS',
        'Writing',
        'DevGrowUp',
        'Work',
        'P2P',
        'IndexFund',
        'Finance',
      ],
    },
    sum: {
      myTime: [
        'Upgrde',
        'Maintain',
        'Daily',
        'Read',
        'Weekly',
        'RSS',
        'Meditation',
        'Writing',
        'DevGrowUp',
        'Work',
        'P2P',
        'IndexFund',
        'Finance',
        'Sport',
        'healthCare',
        'Social',
        'Family',
        'Cat',
      ],
      sleep: ['CoreSleep', 'Nap'],
      works: [
        'DevGrowUp',
        'Work',
        'WorkTalk'
      ],
      passionalWorks: ['DevGrowUp'],
      fun: [
        'Cinema',
        'Shop',
        'QQ',
        'Game',
        'Waste',
      ],
    },
    agileGoals: {
      coreSleep: 3.5 * 60,
      lunch: 40,
      dinner: 30,
      cooking: 70,
      goodMorning: 40,
    },
    goals: {
      pomodoroTimes: 20,
      pomodoroAve: 30,
      pomodoroMax: 35,
      breakTime: 20,
      breakAve: 4,
      breakPomodoroPercent: 0.6,
      myTime: 11 * 60,
      myTimePercent: 0.5,
      napTime: 3,
      napMax: 35,
      passionalWorksPercent: 0.7,
      sleep: 4.5 * 60,
      fun: 60,
    },
  };
  this.output = {
    goals: Object.assign(this.options.goals, this.options.agileGoals),
    index: [],
  };

  this.init = function() {
    this.options.sum.pomodoro = this.options.count.pomodoro;
  };

  this.counts = {};
  this.sums = {};
  this.max = {};

  this.getCount = function(arr) {
    var self = this;
    var countKeys = Object.keys(this.options.count);
    this.data.forEach(function(oneData) {
      self.counts[oneData.date] = {};
      countKeys.forEach(function(countType) {
        var count = 0;
        self.options.count[countType].forEach(function(task) {
          if (oneData.result[task]) {
            count += oneData.result[task].count;
          }
        });
        self.counts[oneData.date][countType] = count;
      });
    });
  };

  this.getSumAndMax = function(arr) {
    var self = this;
    var sum;
    var max;
    var sumKeys = Object.keys(this.options.sum);
    this.data.forEach(function(oneData) {
      self.sums[oneData.date] = {};
      self.max[oneData.date] = {};
      sumKeys.forEach(function(sumType) {
        max = 0;
        sum = 0;
        self.options.sum[sumType].forEach(function(task) {
          if (oneData.result[task]) {
            sum += oneData.result[task].sum;
            max = max > oneData.result[task].sum ? max : oneData.result[task].sum;
          }
        });
        self.sums[oneData.date][sumType] = sum;
        self.max[oneData.date][sumType] = max;
      });
    });
  };

  this.getIndex = function() {
    var self = this;
    var dailyMin = 24 * 60;
    this.data.forEach(function(oneData) {
      var index = {
        date: oneData.date,
        rules: {},
      };
      var counts = self.counts[oneData.date];
      var sums = self.sums[oneData.date];
      var max = self.max[oneData.date];
      // pomodoroTimes
      index.rules.pomodoroTimes = counts.pomodoro;
      // pomodoroAve
      var pomodoroAve = sums.pomodoro === 0 ? 0 :
        Number((sums.pomodoro / counts.pomodoro).toFixed(0));
      index.rules.pomodoroAve = pomodoroAve;
      // pomodoroMax
      index.rules.pomodoroMax = max.pomodoro;
      // break
      if (oneData.result.BreakTime) {
        // breakTime
        index.rules.breakTime = oneData.result.BreakTime.count;
        // breakAve
        var breakAve = Number((oneData.result.BreakTime.sum /
          oneData.result.BreakTime.count).toFixed(0));
        index.rules.breakAve = breakAve;
        // breakPomodoroPercent
        var bpPercent = oneData.result.BreakTime.count === 0 ? 0 :
          Number((oneData.result.BreakTime.count / counts.pomodoro).toFixed(4));
        index.rules.breakPomodoroPercent = bpPercent;
      } else {
        index.rules.breakTime = 0;
        index.rules.breakAve = 0;
        index.rules.breakPomodoroPercent = 0;
      }
      // myTime
      index.rules.myTime = sums.myTime;
      // myTimePercent
      index.rules.myTimePercent = sums.myTime === 0 ? 0 :
        Number((sums.myTime / dailyMin).toFixed(4));
      // passionalWorksPercent
      var passionalWorksPercent = sums.passionalWorks === 0 ? 0 :
        Number((sums.passionalWorks / sums.works).toFixed(4));
      index.rules.passionalWorksPercent = passionalWorksPercent;
      // sleep
      index.rules.sleep = sums.sleep;
      // napTime
      index.rules.napTime = oneData.result.Nap ? oneData.result.Nap.count : 0;
      // napMax
      index.rules.napMax = oneData.result.Nap ? oneData.result.Nap.max : 0;
      // fun
      index.rules.fun = sums.fun;
      // sleep
      index.rules.sleep = sums.sleep;
      // agile goals
      var agileRules = function() {
        var goalNames = Object.keys(self.options.agileGoals);
        goalNames.forEach(function(goal) {
          var capitalizeName = goal[0].toUpperCase() + goal.substr(1);
          index.rules[goal] = oneData.result[capitalizeName] ?
            oneData.result[capitalizeName].sum : 0;
        });
      };
      agileRules();

      self.output.index.push(index);
    });
  };

  this.main = function() {
    this.init();
    this.getCount();
    this.getSumAndMax();
    this.getIndex();
    return this.output;
  };

};

var analyseOneDay = function(oneDay) {
  var output = {};
  var sum;
  var max;

  // get keys
  var keys = [];
  oneDay.forEach(function(obj) {
    keys.push(obj.label);
  });
  var counts = _.countBy(keys);
  keys = _.uniq(keys);

  // get sum and max
  keys.forEach(function(key) {
    sum = 0;
    max = 0;
    oneDay.forEach(function(oneTask) {
      if (oneTask.label === key) {
        sum += oneTask.duration;
        max = max > oneTask.duration ? max : oneTask.duration;
      }
      return null;
    });
    output[key] = {
      sum: sum,
      max: max,
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
  var myRules = new Rules(getSum(data));
  return myRules.main();
};

