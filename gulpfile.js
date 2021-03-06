var gulp = require('gulp');
var changed = require('gulp-changed');
var fs = require('fs');
var sh = require('shelljs');
var notify = require("gulp-notify");
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
    if (error && /8118/.test(error.Error)) {
      console.error("Error: need open port 8118 proxy.");
      return;
    }
    if (error) {
      console.error(error);
      return;
    }
    if (!error && response.statusCode === 200) {
      console.info("\n>>> response start");
      var info = JSON.parse(body);
      console.log(info);
      console.info("<<< response end\n");
    }
  }
  if (argv.a) {
    var message = "Auto request: '" + reqOpt.method + " " + reqOpt.baseUrl + reqOpt.uri + "'";
    setTimeout(function () {
      console.info(message);
      request(reqOpt, callback);
    }, 8000);
  }
};

/**
 * daily
 */
gulp.task('default', ['source'], function () {
  sh.exec('node .');
  setTimeout(() => {
    sh.exec('open http://localhost:3100/');
  }, 2000);
});

/**
 * update database
 */
gulp.task('data', ['source'], function () {
  sh.exec('node .');
});

/* usage example:
 * @ `gulp run -m`: run app with nodemon
 * @ `gulp run -a`: run app with auto request
 */
gulp.task('dev', ['source', 'sass', 'pug'], function () {
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
  html: ['./client/**/*.html'],
  alljs: ['./client/**/*.js', './server/**/*.js']
};

gulp.task('pug', function() {
  var pugCompile = pug({ pretty: true });
  pugCompile.on('error', function(err) {
    console.error(err);
    pugCompile.end();
  });
  var dest = './client';
  return gulp.src(watchs.pug)
    .pipe(changed(dest, { extension: '.html' }))
    .pipe(pugCompile)
    .pipe(notifier('pug compile run again'))
    .pipe(gulp.dest(dest));
});

gulp.task('sass', function() {
  var sassCompile = sass({ pretty: true });
  sassCompile.on('error', function(err) {
    console.error(err);
    sassCompile.end();
  });
  var dest = './client/css/';
  return gulp.src(watchs.sass)
    .pipe(changed(dest, { extension: '.css' }))
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

gulp.task('exit', function() {
  process.exit();
});

/***********************   Watch   ***********************/
gulp.task('source', function() {
  var filenames = ['report', 'download'];
  try {
    filenames.forEach(function(filename) {
      sh.exec('rm ~/Documents/personal/timeloop/server/data/' + filename + '.csv');
    });
  } catch (err) {}
  var currentFileDir;
  filenames.forEach(function(filename) {
    var dir = '/Users/shanlanmi/Downloads/' + filename + '.csv';
    if (fs.existsSync(dir)) {
      currentFileDir = dir;
    }
  });
  if (!currentFileDir) {
    console.error('csv file is not exist, please get data from <https://app.atimelogger.com/#/reports/4>');
    return;
  }
  if (argv.d) {
    sh.exec('cp ' + currentFileDir + ' ~/Documents/personal/timeloop/server/data/report.txt');
  } else {
    console.log('mv ' + currentFileDir + ' ~/Documents/personal/timeloop/server/data/report.txt');
    sh.exec('mv ' + currentFileDir + ' ~/Documents/personal/timeloop/server/data/report.txt');
  }
});

