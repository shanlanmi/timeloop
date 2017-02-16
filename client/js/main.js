/* global table */

function loadDoc() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState === 4 && xhttp.status === 200) {
      table(xhttp.responseText);
    }
  };
  xhttp.open("GET", "http://127.0.0.1:3100/api/Timelogs/month?period=16", true);
  xhttp.send();
}

loadDoc();
