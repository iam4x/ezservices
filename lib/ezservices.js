// ezservices.js
"use strict";

var exec, util, events;
exec         = require('child_process').exec;
util         = require('util');
events       = require('events');

function EzServices() {
  EzServices.prototype.__proto__ = events.EventEmitter.prototype;
  this.agentsDirectories = ['/Library/LaunchAgents/', '~/Library/LaunchAgents/'];
  this.services = [];
}

EzServices.prototype = {
  getServicesList: function () {
    var count    = 0;
    var services = [];
    var self     = this;
    var callback = function (path, error, stdout, stderr) {
      count++;
      if (stdout) {
        for (var i = 0; i < stdout.split('\n').length; i++) {
          if (stdout.split('\n')[i] != '') services.push(path + stdout.split('\n')[i]);
        };
      }
      if (count  === self.agentsDirectories.length) {
        self.emit('servicesList:listed', services);
      }
    }
    for (var i = 0; i < self.agentsDirectories.length; i++) {
      (function () {
        var path = self.agentsDirectories[i];
        exec('ls ' + self.agentsDirectories[i], function (error, stdout, stderr) {
          callback(path, error, stdout, stderr);
        });
      })();
    };
  },
  // param @serviceName {array of services}
  listServices: function (serviceName) {
    // when we have the list, event 'servicesList:listed'
    this.on('servicesList:listed', function (services) {
      for (var i = 0; i < services.length; i++) {
        if (typeof serviceName === 'string') {
          var regex = new RegExp('\\b' + serviceName + '\\b');
          if (regex.test(services[i])) {
            return console.log(services[i]);
          }
          if (i === services.length-1) {
            console.log('No service found named: \'' + serviceName + '\'');
            return console.log('Use \'ezservices ls\' to list all availables services.');
          }
        } else {
          console.log(services[i]);
        }
      };
    });
    // ask gently for the list
    this.getServicesList();
  },
  // param @method {load|unload}
  // param @services {array of all available services}
  execAll: function (method, services) {
    var self = this;
    for (var i = 0; i < services.length; i++) {
      (function () {
        var cmd = 'launchctl ' + method + ' ' + services[i];
        var service = services[i];
        var callback = function (err, stdout, stderr) { self.parseLogs(service, err, stdout, stderr) }
        exec(cmd, callback);
      })();
    };
  },
  // param @methodName {start|stop}
  // param @serviceName {array of services|all}
  exec: function (methodName, serviceName) {
    var self = this;
    // Translate method name for launchctl
    var method = (function () {
      if (methodName == 'start') return 'load';
      if (methodName == 'stop') return 'unload';
    })();
    this.method = method;
    // After we have the list of the services (event 'servecList:list)
    // we can start our things
    this.on('servicesList:listed', function (services){
      // Start or stop all the services
      if (serviceName[0] == 'all') return this.execAll(method, services);
      // Start or stop the listed services
      for (var i = 0; i < serviceName.length; i++) {
        for (var _i = 0; _i < services.length; _i++) {
          (function () {
            var service = serviceName[i];
            var regex   = new RegExp('\\b' + service + '\\b');
            if (regex.test(services[_i])) {
              var cmd = 'launchctl ' + method + ' ' + services[_i];
              var callback = function (err, stdout, stderr) { self.parseLogs(service, err, stdout, stderr) }
              exec(cmd, callback);
            }
          })();
        };
      };
    });
    // Get the the list of the services, emmit event 'servicesList:listed'
    this.getServicesList();
  },
  // param @service {string, name of service}
  parseLogs: function (service, err, stdout, stderr) {
    if (err) {
      console.log('Error with service : \'' + service + '\'');
      console.log(err);
    } else {
      if ((stdout == '') && (stderr == '')) {
        if (this.method == 'load') console.log(service + ' correctly started.');
        if (this.method == 'unload') console.log(service + ' correctly stopped.');
      }
      if (stderr) {
        if (this.method == 'load') console.log(service + ' already started.');
        if (this.method == 'unload') console.log(service + ' aleady stopped.');
      }
    }
  }
}

module.exports = new EzServices();
