/**
 * Created by yipingw on 7/13/16.
 */

var gulp = require('gulp');
var path = require('path');
var fs = require('fs');
var sh = require('shelljs');
var nodemon = require('gulp-nodemon');
var argv = require('yargs').argv;

/**
 * try to push some notication.
 */
var notifier = function(str) { return; };
try {
  var notify = require("node-notifier");
  notifier = function(str) {
    return notify.notify(str);
  };
} catch (err) {
  if (err) {
    console.info("You may want to run 'npm install node-notifier' for getting some notify.");
  }
}

var outputPath = path.resolve(__dirname, 'server/models');

/***********************   envirnoment   ***********************/

/* usage example:
 * @ `gulp run --env=l`: node app as environment is local(default)
 * @ `gulp run --env=d`: node app as environment is development
 * @ `gulp run --env=s`: node app as environment is staging
 * @ `gulp run --env=p`: node app as environment is producation
 *
 * @ `gulp run --env=l -m`: nodemon app as environment is local(default)
 * @ `gulp run --env=d -m`: nodemon app as environment is development
 * @ `gulp run --env=s -m`: nodemon app as environment is staging
 * @ `gulp run --env=p -m`: nodemon app as environment is producation
 */
gulp.task('default', function () {
  var opt = { script: 'server/server.js',
    ext: 'js json',
    ignore: ['ignored.js'],
    env: { NODE_ENV: 'local' }
  };
  switch (argv.env) {
    case 'l':
      opt.env.NODE_ENV = 'local';
      break;
    case 's':
      opt.env.NODE_ENV = 'staging';
      break;
    case 'p':
      opt.env.NODE_ENV = 'producation';
      break;
    default:
      opt.env.NODE_ENV = 'development';
  }
  if (argv.m) {
    var stream = nodemon(opt);
    stream
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
    var cmd = 'NODE_ENV=' + opt.env.NODE_ENV + ' node .';
    sh.exec(cmd);
  }
  console.info("Current environment is >>" + opt.env.NODE_ENV + "<<.");

});

/***********************   db discover migration and update   ***********************/

var dataSource = ["postgresAppDs", "postgresCityData", "postgresPathSourceDs"];

function schemaCB(err, schema) {
  console.log("callback");
  if (schema) {
    console.log('Auto discovery success: ' + schema.name);
    var fileName =
      schema.name.replace(/([A-Z])/g, "-$1").toLowerCase().replace(/^-/, "").replace(/s$/, "");
    var jsName = outputPath + '/' + fileName + '.js';
    var jsonName = jsName + "on";
    fs.writeFile(jsName, "module.exports = function (" + schema.name.replace(/s$/, "") +
      ") {\n\n};", function (error) {
        if (error) {
          console.log(error);
        } else {
          console.log("JS saved to " + jsName);
        }
      });
    fs.writeFile(jsonName, JSON.stringify(schema, null, 2), function (error) {
      if (error) {
        console.log(error);
      } else {
        console.log("JSON saved to " + jsonName);
      }
    });
  }

  if (err) {
    console.error(err);
  }
}

/**
  * Discover model by database's table
  */
gulp.task('db:discover', function () {
  if (!argv.ds || !argv.t) {
    return console.error('Please specify task arguments! Available arguments: --ds=postgresAppDs | postgresCityData --t=tableName');
  }

  if (dataSource.indexOf(argv.ds) === -1) {
    return console.error('Data source does not exist!');
  }

  var ds = eval(argv.ds);

  return ds.discoverSchema(argv.t, { schema: 'public' }, schemaCB);
});

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

gulp.task('db:automigrate', function () {
  if (!argv.ds || !argv.m) {
    return console.error('Please specify task arguments! Available arguments: --ds=postgresAppDs | postgresCityData --m=model1[model2, model3...]');
  }

  if (dataSource.indexOf(argv.ds) === -1) {
    return console.error('Data source does not exist!');
  }

  var ds = eval(argv.ds);
  var models = argv.m.split(',');

  createTableByModelDefinition(ds, models);
  return null;
});

gulp.task('db:autoupdate', function () {
  if (!argv.ds || !argv.m) {
    return console.error('Please specify task arguments! Available arguments: --ds=postgresAppDs | postgresCityData, --m=modelName');
  }

  if (dataSource.indexOf(argv.ds) === -1) {
    return console.error('Data source does not exist!');
  }

  var ds = eval(argv.ds);

  return ds.autoupdate(argv.m, function (err) {
    if (err) return console.error(err);
    return console.log('auto update completed!');
  });
});

/***********************   db namespace   ***********************/

/***********************   db seed   ***********************/

// Seed common data
gulp.task('seed:init', function () {
  var app = require(path.resolve(__dirname, 'server/server'));
  migration.appFamilyConfig(app);
  migration.homepageText(app);
  migration.homepageBanner(app);
});

gulp.task("seed:hr-data", function () {
  var app = require(path.resolve(__dirname, 'server/server'));
  hrData.appFamilyConfig(app);
  hrData.homepageText(app);
  hrData.homepageBanner(app);
});

// Seed initial data for specified app
gulp.task('seed:app', function () {
  var appData = require('./tasks/seed-app-data');

  var appFamilyKeys = ['nursing', 'hr'];
  if (!argv.f || !argv.k) {
    return console.error('Please specify datasource, file path and app family key!');
  }

  if (Number(fs.statSync(path.normalize(argv.f)).size) === 0) {
    return console.error('File does not exist.');
  }

  if (appFamilyKeys.indexOf(argv.k) < 0) {
    return console.error('App family key does not exist.');
  }

  return appData(argv.f, argv.k)
    .then(function (result) {
      console.log('all done.');
    })
    .catch(function (err) {
      console.log(err);
    });
});

/***********************   strong-pm deploy   ***********************/
var devPM = "http://10.0.1.200:8701";
var producationPM = 'http://dev@pathsource.com:ilovepanda@frigate_bird.pathsource.com:8701';
var stagingPM = 'http://dev@pathsource.com:ilovepanda@frigate_bird_staging.pathsource.com:8701';

/**
 * Check the strong-pm status
 * @ `gulp pm:status --env=d` : check the development pm status
 * @ `gulp pm:status --env=s` : check the staging pm status
 * @ `gulp pm:status --env=p` : check the producation pm status
 */
gulp.task('pm:status', function () {
  var cmd;
  switch (argv.env) {
    case 'd':
      cmd = 'slc ctl -C ' + devPM + ' status';
      break;
    case 's':
      cmd = 'slc ctl -C ' + stagingPM + ' status';
      break;
    case 'p':
      cmd = 'slc ctl -C ' + producationPM + ' status';
      break;
    default:
      cmd = 'slc ctl -C ' + devPM + ' status';
  }
  sh.exec(cmd);
});

/**
 * Set the strong-pm environment
 * @ `gulp pm:env --env=d --name=frigate_bird` : set the development pm environment
 * @ `gulp pm:env --env=s --name=frigate_bird` : set the staging pm environment
 * @ `gulp pm:env --env=p --name=frigate_bird` : set the producation pm environment
 */
gulp.task('pm:env', function () {
  var envCmd,
    sizeCmd;
  var name = argv.name || 'frigate_bird';
  var getEnvCmd = function(pm, envValue) {
    return 'slc ctl -C ' + pm + ' env-set ' + name + ' NODE_ENV=' + envValue;
  };
  var getSizeCmd = function(pm) {
    return 'slc ctl -C ' + pm + ' set-size ' + name + ' 1';
  };

  switch (argv.env) {
    case 'd':
      envCmd = getEnvCmd(devPM, 'development');
      sizeCmd = getSizeCmd(devPM);
      break;
    case 's':
      envCmd = getEnvCmd(stagingPM, 'staging');
      sizeCmd = getSizeCmd(stagingPM);
      break;
    case 'p':
      envCmd = getEnvCmd(producationPM, 'producation');
      sizeCmd = getSizeCmd(producationPM);
      break;
    default:
      envCmd = getEnvCmd(devPM, 'development');
      sizeCmd = getSizeCmd(devPM);
  }
  sh.exec(envCmd);
  sh.exec(sizeCmd);
});

/**
  * Build project for deploy
  * @ `gulp build`    : slc build with tar
  * @ `gulp build -g` : slc build with git
  */
gulp.task('pm:build', function () {
  if (argv.g) {
    sh.exec('slc build');
  } else {
    sh.exec('slc build --pack');
  }
  notifier('Build over!');
});

/**
 * Deploy project
 * @ `gulp pm:deploy --env=d`    : build and deploy to development pm
 * @ `gulp pm:deploy --env=s`    : build and deploy to staging pm
 * @ `gulp pm:deploy --env=p`    : build and deploy to producation pm
 * @ `gulp pm:deploy --env=d -g` : build with git and deploy to producation pm
 */
gulp.task('pm:deploy', ['pm:build'], function () {
  var cmd,
    pm;
  switch (argv.env) {
    case 'd':
      cmd = 'slc deploy ' + devPM;
      pm = 'development';
      break;
    case 's':
      cmd = 'slc deploy ' + stagingPM;
      pm = 'staging';
      break;
    case 'p':
      cmd = 'slc deploy ' + producationPM;
      pm = 'producation';
      break;
    default:
      cmd = 'slc deploy ' + devPM;
      pm = 'development';
  }
  sh.exec(cmd);
  notifier('Deploy to ' + pm + ' pm over!');
});

/**
 * Remove project
 * @ `gulp pm:remove --env=d --id=1`    : remove the server in development pm
 * @ `gulp pm:remove --env=s --id=1`    : remove the server in staging pm
 * @ `gulp pm:remove --env=p --id=1`    : remove the server in producation pm
 * `--id` default value is 1.
 */
gulp.task('pm:remove', function () {
  var cmd,
    pm;
  var id = argv.id || 1;
  switch (argv.env) {
    case 'd':
      cmd = 'slc ctl -C ' + devPM + ' remove ' + id;
      pm = 'development';
      break;
    case 's':
      cmd = 'slc ctl -C ' + stagingPM + ' remove ' + id;
      pm = 'staging';
      break;
    case 'p':
      cmd = 'slc ctl -C ' + producationPM + ' remove ' + id;
      pm = 'producation';
      break;
    default:
      cmd = 'slc ctl -C ' + devPM + ' remove ' + id;
      pm = 'development';
  }
  sh.exec(cmd);
  notifier('Remove the server in ' + pm + ' pm over!');
});

/***********************   dev environment task   ***********************/

var devConfig = {
  host: '10.0.1.200',
  port: 22,
  username: 'pathsource',
  // TODO: need remove password
  password: 'daoyuan123'
};

var displayLog = function() {
  return function(file) {
    console.log(file.contents.toString().replace(/^.*\*{3}/, ""));
  };
};

/**
 * git pull in dev environment
 * @ `gulp dev:pull --b=refactor_bole_api` : specify the git branch
 */
gulp.task('dev:pull', function() {

  var branch = argv.b || 'refactor_bole_api';
  var pull = [
    'cd /home/pathsource/frigate_bird/',
    'git checkout ' + branch,
    'git pull',
  ];

  var pullText = "=> 'git pull' is done.";
  console.info("=> 'git pull' start");
  return gulpSSH
    .shell(pull, { filePath: 'shell.log' })
    .on('data', displayLog())
    .pipe(gulp.dest('logs'))
    .on('end', function() {
      notifier(pullText);
      console.info(pullText);
    });
});

/**
 * using strong-pm `slc build` in dev environment
 * @ `gulp dev:build --b=refactor_bole_api` : specify the git branch
 */
gulp.task('dev:build', ['dev:pull'], function() {

  var build = [
    'cd /home/pathsource/frigate_bird/',
    'slc build --install --scripts'
  ];
  var buildText = "=> 'slc build' is done.";

  console.info("=> 'slc build' start");
  return gulpSSH
    .shell(build, { filePath: 'shell.log' })
    .on('data', displayLog())
    .pipe(gulp.dest('logs'))
    .on('end', function() {
      notifier(buildText);
      console.info(buildText);
    });
});

/** Deploy project
 * @ `gulp dev:deploy --env=d`    : build and deploy to development pm
 * @ `gulp dev:deploy --env=s`    : build and deploy to staging pm
 * @ `gulp dev:deploy --env=p`    : build and deploy to producation pm
 * @ `gulp dev:deploy --env=d`    : build with tar and deploy to producation pm
 * @ `--b=refactor_bole_api`      : specify the git branch
 */
gulp.task('dev:deploy', ['dev:pull', 'dev:build'], function() {

  var deploy = [
    'cd /home/pathsource/frigate_bird/'
  ];
  var deployText = "=> 'slc deploy' is done.";
  switch (argv.env) {
    case 'd':
      deploy.push('slc deploy ' + devPM);
      break;
    case 's':
      deploy.push('slc deploy ' + stagingPM);
      break;
    case 'p':
      deploy.push('slc deploy ' + producationPM);
      break;
    default:
      deploy.push('slc deploy ' + devPM);
  }

  console.info("=> 'slc deploy' start'");
  return gulpSSH
    .shell(deploy, { filePath: 'shell.log' })
    .on('data', displayLog())
    .pipe(gulp.dest('logs'))
    .on('end', function() {
      notifier(deployText);
      console.info(deployText);
    });
});

