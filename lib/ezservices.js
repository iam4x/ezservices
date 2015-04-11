// ezservices.js
"use strict";

var exec, util, events, clc, fs, path, tilde;
exec   = require('child_process').exec;
util   = require('util');
events = require('events');
clc    = require('cli-color');
fs     = require('fs');
path   = require('path');
tilde  = require('tilde-expansion');

// +-----------------------+
// |    EzService class    |
// +-----------------------+
//
// Each LaunchAgents found on the Mac will be instancied as an EzService
// Methods availables:
//    start | stop | restart
//

function EzService(path) {
  EzService.prototype.__proto__ = events.EventEmitter.prototype;
  this.path = path;
}

EzService.prototype = {
  start: function (alias) {
    var self = this;
    this.method = 'load';
    exec('launchctl load ' + this.path, function (err, stdout, stderr) {
      self.parseLogs(alias, err, stdout, stderr);
    });
  },
  stop: function (alias) {
    var self = this;
    this.method = 'unload';
    exec('launchctl unload ' + this.path, function (err, stdout, stderr) {
      self.parseLogs(alias, err, stdout, stderr);
    });
  },
  restart: function (alias) {
    var self = this;
    this.on(alias+':unloaded', function () {
      self.start(alias);
    });
    this.stop(alias);
  },
  status: function (alias) {
    exec('launchctl list | grep ' + alias, function (err, stdout, stderr) {
      var regex = new RegExp('\\b' + alias + '\\b');
      if (regex.test(stdout)) return console.log(clc.green(alias + ' is running.'));
      return console.log(clc.red(alias + ' is not running.'));
    });
  },
  edit: function (alias) {
    var editor = 'open -t';
    if (process.env.EDITOR) editor = process.env.EDITOR;
    exec(editor + ' ' + this.path, function (err, stdout, stderr) {
      if (err) return console.log(clc.red('Error with opening ' + alias + ' LaunchAgent plist.'));
      if (stderr === '' && stdout === '') return console.log(clc.green(alias + 'LaunchAgent plist opened.'));
    });
  },
  parseLogs: function (service, err, stdout, stderr) {
    if (err) {
      console.log(clc.red('Error with service : \'' + service + '\''));
      console.log(clc.red(stderr));
    } else {
      if ((stdout === '') && (stderr === '')) {
        // console.log(stdout);
        if (this.method === 'load') console.log(clc.green(service + ' correctly started.'));
        if (this.method === 'unload') console.log(clc.green(service + ' correctly stopped.'));
      }
      if (stderr) {
        // console.log(stderr);
        if (this.method === 'load') console.log(clc.blue(service + ' already started.'));
        if (this.method === 'unload') console.log(clc.blue(service + ' aleady stopped.'));
      }
      var event = service + ':' + this.method + 'ed';
      // console.log(event);
      this.emit(event);
    }
  }
};

// +--------------------+
// |  EzServices Class  |
// +--------------------+
//
// This is the class binded to the CLI 'ezservices'
// It will at start find all the availables LaunchAgents on the Mac
// and it will create EzService for each LaunchAgents found.
//
// It has an array of EzService, easy to call methods on them.
//
// Events:
//    - 'services:listed' is fired whend the services are found, kinda equivalent as a ready event.
//

function EzServices() {
  EzServices.prototype.__proto__ = events.EventEmitter.prototype;
  this.agentsDirectories = ['/Library/LaunchAgents/', '~/Library/LaunchAgents/'];
  this.services = [];

  // Get an array of all services
  var count    = 0;
  var services = [];
  var self     = this;
  var callback = function (path, error, stdout, stderr) {
    count++;
    if (stdout) {
      for (var i = 0; i < stdout.split('\n').length; i++) {
        if (stdout.split('\n')[i] !== '') services.push(path + stdout.split('\n')[i]);
      }
    }
    if (count  === self.agentsDirectories.length) {
      self.emit('services:listed', services);
    }
  };
  for (var i = 0; i < self.agentsDirectories.length; i++) {
    (function () {
      var path = self.agentsDirectories[i];
      exec('ls ' + self.agentsDirectories[i], function (error, stdout, stderr) {
        callback(path, error, stdout, stderr);
      });
    })();
  }

  // When we have the list of all services instance the EzService class for each
  this.on('services:listed', function (services) {
    for (var i = 0; i < services.length; i++) {
      self.services.push(new EzService(services[i]));
    }
  });
}

EzServices.prototype = {
  showService: function (servicesAsked) {
    if (servicesAsked[0] === 'all') return this.listServices();
    this.on('services:listed', function (services) {
      for (var i = 0; i < servicesAsked.length; i++) {
        var regex = new RegExp('\\b'+ servicesAsked[i] + '\\b');
        for (var _i = 0; _i < services.length; _i++) {
          if (regex.test(services[_i])) { console.log(clc.yellow(services[_i])) }
        }
      }
    });
  },
  listServices: function () {
    this.on('services:listed', function (services) {
      for (var i = 0; i < services.length; i++) { console.log(clc.yellow(services[i])) };
    });
  },
  execOperation: function (method, servicesAsked) {
    var self = this;
    this.on('services:listed', function () {
      var i = 0;
      if (servicesAsked[0] === 'all') {
        for (i; i < self.services.length; i++) {
          self.services[i][method](self.services[i].path);
        }
      } else {
        for (i; i < self.services.length; i++) {
          for (var _i = 0; _i < servicesAsked.length; _i++) {
            var serviceName = servicesAsked[_i];
            var regex = new RegExp('\\b' + serviceName + '\\b');
            if (regex.test(self.services[i].path)) {
              self.services[i][method](servicesAsked[_i]);
            }
          }
        }
      }
    });
  },
  removeService: function (service) {
    var self  = this;
    var count = 0;
    var found = false;
    var regex = new RegExp('\\b' + service + '\\b');
    this.on('services:listed', function (services) {
      for (var i = 0; i < services.length; i++) {
        count++;
        if (regex.test(services[i])) {
          found = true;
          tilde(services[i], function (filePath) {
            fs.unlink(filePath, function (err) {
              if (err) return console.log(clc.red('Error with removing the service\n', err));
              console.log(clc.green('Service correctly removed!'));
            });
          });
        }
        if (count === services.length && !found) return console.log(clc.red('Service not found.'));
      }
    });
  },
  installService: function (filePath) {
    var self     = this;
    var nbOfDir  = this.agentsDirectories.length;
    var filename = path.basename(filePath);
    var results  = [];
    fs.exists(filePath, function (exists){
      if (!exists) return console.log(clc.red('plist you want to install doesn\'t exists.'));
      for (var i = 0; i < self.agentsDirectories.length; i++) {
        tilde(self.agentsDirectories[i]+filename, function (newFilePath) {
          fs.exists(newFilePath, function (exists) {
            results.push(exists);
            if (results.length === nbOfDir) {
              if (results[0] || results[1]) return console.log(clc.blue("plist arlready installed."));
              var cmd = 'cp ' + filePath + ' ' + self.agentsDirectories[1];
              // console.log(cmd);
              exec(cmd, function(err, stdout, stderr) {
                if (err) return console.log(clc.red('Error with copying the file\n', stderr));
                if (stdout === '' && stderr === '') return console.log(clc.green('Your plist was correctly installed!'));
              });
            }
          });
        });
      }
    });
  }
};

module.exports = new EzServices();