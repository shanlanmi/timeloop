/* global table */


// hide table
document.querySelector('#table_div').style.display = 'none';
document.querySelector('.spinner').style.display = 'block';

var lastDisplay;
function loadDoc(period) {
  if (typeof period !== "number") {
    period = 1;
  }
  lastDisplay = period;
  document.querySelector('#table_div').style.display = 'none';
  document.querySelector('.spinner').style.display = 'block';
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState === 4 && xhttp.status === 200) {
      table(xhttp.responseText);
      document.querySelector('.spinner').style.display = 'none';
      document.querySelector('#table_div').style.display = 'block';
    }
  };
  xhttp.open("GET", "http://127.0.0.1:3100/api/Timelogs/month?period=" + period, true);
  xhttp.send();
}

setTimeout(function() {
  loadDoc(16);
}, 6500);

document.querySelector('#switcher').onclick = function() {
  if (lastDisplay !== 1) {
    loadDoc(1);
  } else {
    loadDoc(16);
  }
};
