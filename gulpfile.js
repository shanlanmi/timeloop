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
var browserSync = require('browser-sync');

var notifier = function(str) {
  return notify({
    onLast: true,
    message: str
  });
};

/***********************   run   ***********************/

/* usage example:
 * @ `gulp -m`: nodemon app
 * @ `gulp -b`: nodemon app with browserSync
 */
gulp.task('default', ['sass', 'pug'], function () {
  var opt = { script: 'server/server.js',
    ext: 'js json css html',
    ignore: ['ignored.js'],
    tasks: ['sass', 'pug'],
  };
  if (argv.m) {
    var stream = nodemon(opt);
    stream
      .on('start', function() {
        if (argv.b) {
          browserSync({
            files: "**",
            server: {
              baseUrl: "./"
            }
          }, function(err, bs) {
            console.log(bs.options.getIn(["urls", "local"]));
          });
        }
      })
      .on('restart', function () {
        setTimeout(function() {
          notifier('Restart node!');
        }, 3000);
      })
      .on('crash', function() {
        console.error('Application has crashed!\n');
        stream.emit('restart', 10);  // restart the server in 10 seconds
      });
  } else {
    sh.exec('node .');
  }
});

/***********************   watch   ***********************/

var watchs = {
  sass: ['./sass/**/*.scss', './sass/**/*.sass'],
  css: ['./client/css/*.css'],
  pug: ['./pug/**/*.pug'],
  html: ['./client/templates/**/*.html'],
  clientEs: ['./es6/client/**/*.es6'],
  serverEs: ['./es6/server/**/*.es6'],
  alljs: ['./client/**/*.js', './server/**/*.js']
};

gulp.task('pug', function() {
  var pugCompile = pug({pretty: true});
  pugCompile.on('error', function(err) {
    console.error(err);
    pugCompile.end()
  });
  var dest = './client/templates/';
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

// gulp.task('serverEs', function() {
  // var babelCompile = babel({presets: 'es2015'});
  // babelCompile.on('error', function(err) {
    // console.error(err);
    // babelCompile.end()
  // });
  // var dest = './server/';
  // return gulp.src(watchs.serverEs)
    // .pipe(changed(dest, {extension: '.js'}))
    // .pipe(babelCompile)
    // .pipe(notifier('server babel compile run again'))
    // .pipe(gulp.dest(dest));
// });

// gulp.task('clientEs', function() {
  // var babelCompile = babel({presets: 'es2015'});
  // babelCompile.on('error', function(err) {
    // console.error(err);
    // babelCompile.end()
  // });
  // var dest = './client/js/';
  // return gulp.src(watchs.serverEs)
    // .pipe(changed(dest, {extension: '.js'}))
    // .pipe(babelCompile)
    // .pipe(notifier('client babel compile run again'))
    // .pipe(gulp.dest(dest));
// });
