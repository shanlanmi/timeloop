var gulp = require('gulp');
var path = require('path');
var changed = require('gulp-changed');
var fs = require('fs');
var sh = require('shelljs');
var notify = require("gulp-notify")
var nodemon = require('gulp-nodemon');
var argv = require('yargs').argv;
var pug = require('gulp-pug');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var request = require('request');
var reqOpt = require('./server/data/auto-request');

var notifier = function(str) {
  return notify({
    onLast: true,
    message: str
  });
};

/***********************   Run   ***********************/

var autoReq = function() {
  function callback(error, response, body) {
    if (!error && response.statusCode === 200) {
      console.info("\n>>> response start");
      var info = JSON.parse(body);
      console.log(info);
      console.info("<<< response end\n");
    }
  }
  if (argv.a) {
    var message = "Auto request: '" + reqOpt.method + " " + reqOpt.baseUrl + reqOpt.uri + "'";
    console.info(message);
    setTimeout(function () {
      request(reqOpt, callback);
    }, 8000);
  }
};

/**
 * daily
 */
gulp.task('default', ['source'], function () {
  sh.exec('open client/index.html');
  sh.exec('node .');
});
/* usage example:
 * @ `gulp run -m`: run app with nodemon
 * @ `gulp run -a`: run app with auto request
 */
gulp.task('run', ['source', 'sass', 'pug'], function () {
  var opt = { script: 'server/server.js',
    // verbose: true,
    ext: 'js json',
    ignore: ['ignored.js', 'client/js/*.js'],
    tasks: ['sass', 'pug'],
  };
  if (argv.m) {
    var stream = nodemon(opt);
    stream
      .on('start', function() {
        browserSync.reload();
      })
      .on('restart', function () {
        setTimeout(function() {
          notifier('Restart node!');
        }, 3000);
        autoReq();
      })
      .on('crash', function() {
        console.error('Application has crashed!\n');
        stream.emit('restart', 10);  // restart the server in 10 seconds
      });
  } else {
    sh.exec('node .');
  }
  autoReq();
});

/***********************   Watch   ***********************/

var watchs = {
  sass: ['./sass/**/*.scss', './sass/**/*.sass'],
  css: ['./client/css/*.css'],
  pug: ['./pug/**/*.pug'],
  html: ['./client/templates/**/*.html'],
  alljs: ['./client/**/*.js', './server/**/*.js']
};

gulp.task('pug', function() {
  var pugCompile = pug({pretty: true});
  pugCompile.on('error', function(err) {
    console.error(err);
    pugCompile.end()
  });
  var dest = './client';
  return gulp.src(watchs.pug)
    .pipe(changed(dest, {extension: '.html'}))
    .pipe(pugCompile)
    .pipe(notifier('pug compile run again'))
    .pipe(gulp.dest(dest));
});

gulp.task('sass', function() {
  var sassCompile = sass({pretty: true});
  sassCompile.on('error', function(err) {
    console.error(err);
    sassCompile.end()
  });
  var dest = './client/css/';
  return gulp.src(watchs.sass)
    .pipe(changed(dest, {extension: '.css'}))
    .pipe(sassCompile)
    .pipe(notifier('sass compile run again'))
    .pipe(gulp.dest(dest));
});

gulp.task('watch', function() {
  browserSync.init({
    files: "./client/**",
    server: "./client"
  });
  gulp.watch(watchs.sass, ['sass']);
  gulp.watch(watchs.pug, ['pug']);
});

/***********************   Watch   ***********************/
gulp.task('source', function() {
  sh.exec('rm ~/Documents/personal/timeloop/server/data/report.csv');
  var exist = fs.existsSync('/Users/shanlanmi/Downloads/report.csv');
  if (!exist) {
    console.error("'report.csv' is not exist, please get report data from <https://app.atimelogger.com/#/reports/4>");
  }
  sh.exec('cp ~/Downloads/report.csv ~/Documents/personal/timeloop/server/data/report.txt');
});

/***********************   DataSource   ***********************/

function createTableByModelDefinition(ds, models) {
  if (models && models.length > 0) {
    ds.automigrate(models, function (err) {
      if (err) return console.error(err);
      return console.log('Congratulation, auto migration completed!');
    });
  } else {
    return console.error('Please specify model name!');
  }
  return null;
}

/**
 * This task has some bug.
 *
 */
gulp.task('db:automigrate', function () {
  var app = require('./server/server.js');
  var ds = app.dataSources.db;

  if (!argv.m) {
    return console.error('Please specify task arguments! Available arguments: --m=model1[model2, model3...]');
  }
  var model = argv.m;

  console.dir(model);
  if (model) {
    ds.automigrate(model, function (err) {
      if (err) return console.error(err);
      return console.log('Congratulation, auto migration completed!');
    });
  } else {
    return console.error('Please specify model name!');
  }
  return null;
});
