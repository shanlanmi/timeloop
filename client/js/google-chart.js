/* global google */

var table = function table(json) {

  /**
   * deal with data from api
   */
  var rawData = JSON.parse(json);
  console.dir(rawData);
  var labels = [];

  function capitalizeName(str) {
    return str[0].toUpperCase() + str.substr(1);
  }

  /**
   * start load goole chart
   */
  google.charts.load('current', { packages: ['table'] });

  function drawTable() {
    var data = new google.visualization.DataTable();

    /**
     * add columns
     */
    var weeks = [];
    function addDateColumn() {
      rawData.index.forEach(function(oneDay) {
        var weekLable = ["Sun", "Mon", "Tue", "Web", "Thu", "Fri", "Sat"];
        var week = new Date(oneDay.date).getDay();
        weeks.push(weekLable[week]);
        data.addColumn("string", oneDay.date);
      });
      data.addColumn("string", "Goal");
    }

    function addWeeksColumn() {
      weeks.unshift("Week");
      weeks.push("");
      data.addRows([weeks]);
    }

    data.addColumn('string', 'Lable');
    addDateColumn();
    addWeeksColumn();

    /**
     * add rows
     */
    var rows = [];

    function checkGoal(label, value) {
      // gt means hight cell when value is greet then goal
      var gt = ['fun'];
      var hightlight = "hightlight";

      if (gt.indexOf(label)) {
        if (value > rawData.goals[label]) {
          return hightlight;
        }
      }
      if (value < rawData.goals[label]) {
        return hightlight;
      }
      return "";

    }

    function addLabels() {
      var name;
      var goalKeys = Object.keys(rawData.goals);
      labels = goalKeys.sort();
      labels.forEach(function(label, index) {
        var row = [];
        name = capitalizeName(label);
        row.push(name);
        rawData.index.forEach(function(i) {
          row.push("");
        });
        rows.push(row);
      });
    }

    function addGoals() {
      var name;
      labels.forEach(function(label, index) {
        name = String(rawData.goals[label]);
        rows[index].push(name);
      });
    }

    function addRules() {
      var name;
      var specifyClass = "";
      rawData.index.forEach(function(oneDay, dateIndex) {
        labels.forEach(function(label, labelIndex) {
          name = String(oneDay.rules[label]);
          specifyClass = checkGoal(label, oneDay.rules[label]);
          data.setCell(labelIndex + 1, dateIndex + 1, name, name, { className: specifyClass });
        });
      });
    }

    function allRows(argument) {
      addLabels();
      addGoals();
      data.addRows(rows);
      addRules();
    }
    allRows();

    // data.addRows([
    // ['Mike',  , true],
    // ['Jim',   {v:8000,   f: '$8,000'},  false],
    // ['Alice', {v: 12500, f: '$12,500'}, true],
    // ['Bob',   {v: 7000,  f: '$7,000'},  true]
    // ]);

    var table = new google.visualization.Table(document.getElementById('table_div'));

    table.draw(data, { showRowNumber: true, width: '100%', height: '100%' });
  }

  google.charts.setOnLoadCallback(drawTable);

};
