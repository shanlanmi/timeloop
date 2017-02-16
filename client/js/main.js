/* global table */


// hide table
document.querySelector('#table_div').style.display = 'none';
document.querySelector('.spinner').style.display = 'block';

function loadDoc() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState === 4 && xhttp.status === 200) {
      table(xhttp.responseText);
      // document.getElementById("table_div").style.display = 'block';
      document.querySelector('#table_div').style.display = 'block';
    }
  };
  xhttp.open("GET", "http://127.0.0.1:3100/api/Timelogs/month?period=16", true);
  xhttp.send();
}

setTimeout(function() {
  loadDoc();
}, 4500);
