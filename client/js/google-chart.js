var table = function table(json) {

  var rawDate = JSON.parse(json);
  var weeks = [];
  console.dir(rawDate);

  google.charts.load('current', {'packages':['table']});
  google.charts.setOnLoadCallback(drawTable);


  function drawTable() {

    function addDate() {
      rawDate.forEach(function(oneDay) {
        var weekLable = ["星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
        var week = new Date(oneDay.saveDate).getDay();
        weeks.push(weekLable[week]);
        data.addColumn("string", oneDay.saveDate.replace(/T.*$/, ""));
      });
    }

    function addWeeks() {
      weeks.unshift("星期");
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
