var table = function table(json) {

  var rawDate = JSON.parse(json);
  var weeks = [];

  google.charts.load('current', {'packages':['table']});
  google.charts.setOnLoadCallback(drawTable);


  function drawTable() {

    function addDate() {
      rawDate.forEach(function(oneDay) {
        var weekLable = ["Sun", "Mon", "Tue", "Web", "Thu", "Fri", "Sat"];
        var week = new Date(oneDay.saveDate).getDay();
        weeks.push(weekLable[week]);
        var displayDate = oneDay.saveDate.replace(/T.*$/, "").replace(/^\d+-/, "");
        data.addColumn("string", displayDate);
      });
    }

    function addWeeks() {
      weeks.unshift("Week");
      data.addRows([weeks]);
    }

    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Lable');
    addDate();
    addWeeks();
    // data.addRows([
    // ['Mike',  , true],
    // ['Jim',   {v:8000,   f: '$8,000'},  false],
    // ['Alice', {v: 12500, f: '$12,500'}, true],
    // ['Bob',   {v: 7000,  f: '$7,000'},  true]
    // ]);

    var table = new google.visualization.Table(document.getElementById('table_div'));

    table.draw(data, {showRowNumber: true, width: '100%', height: '100%'});
  }

};
