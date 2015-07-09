'use strict';

var Colors = require('colors');
var Moment = require('moment');

var internals = {};


module.exports = internals.Colorterm = function() {

  if (!(this instanceof internals.Colorterm)) {
    return new internals.Colorterm();
  }

  return this.init();

}

//
//
//
internals.Colorterm.prototype.init = function() {

  var self = this;

  // https://nodejs.org/api/console.html
  var methods = ['log', 'info', 'error', 'warn', 'dir', 'time', 'timeEnd', 'trace', 'assert'];

  methods.forEach(function (method) {
    if (self[method]) return;

    self[method] = function() {
      return console[method].apply(console, arguments);
    };
  });

  return self;

}

//
//
//
internals.Colorterm.prototype.log = function (object) {
  if (typeof object === 'string' || object instanceof String) {
    var record = {
      event: 'log',
      timestamp: new Date().getTime(),
      data: object
    };

    object = record;
  }

  this._formatLog(object);
}


//
//
//
internals.Colorterm.prototype._formatEvent = function (event) {
  // var output = StringPadder.padLeft(level + ' |', 10);

  switch(event) {
    case 'log':
      return Colors.bold.white.dim(event);
      break;
    case 'info':
      return Colors.bold.cyan(event);
      break;
    case 'warn':
      return Colors.bold.yellow(event);
      break;
    case 'error':
      return Colors.bold.red(event);
      break;
    case 'dir':
      return Colors.bold.magenta(event);
      break;
    default:
      return Colors.white(event);
  }
}

internals.Colorterm.prototype._formatTimestamp = function (timestamp) {
  var moment = Moment.utc(timestamp);

  // moment.local();

  return Colors.italic.dim(moment.format('HH:mm:ss.SSS'));
}

//
//
//
internals.Colorterm.prototype._formatLog = function (object) {
  var string = '%event: %timestamp %data';
  var substitutions = {
    '%event': this._formatEvent(object.event),
    '%timestamp': this._formatTimestamp(object.timestamp),
    '%data': object.data
  };

  string = string.replace(/%\w+/g, function (all) {
    return substitutions[all] || all;
  });

  this._stdout(string);
}

internals.Colorterm.prototype._stdout = function (output) {
  process.stdout.write(output + '\n');
}


//
// internals.Colorterm.prototype.log = function () {
//   process.stdout.write('log called' + '\n');
// }
//
// internals.Colorterm.prototype.debug = function () {
//   process.stdout.write('debug called' + '\n');
// }

// internals.Colorterm.prototype.log = function () {
//   process.stdout.write('hi' + '\n');
// }

//
// var Colors = require('colors');
// var Moment = require('moment');
// var Util = require("util");
//
// var PrettyJSON = require('prettyjson');
// var StringPadder = require('string-padder');
//
// var Colorterm;
//
// module.exports = Colorterm = function(prefix, parent, patch) {
//   var object;
//   var noFormat = false;
//   // Fiddle optional arguments
//   patch = Array.prototype.slice.call(arguments, -1)[0];
//   if (typeof patch === 'object') {
//     noFormat = patch.noFormat;
//     patch = patch.patch;
//   }
//   if (typeof patch !== "boolean") patch = false;
//   if (typeof prefix === "object" && prefix !== null) {
//     parent = prefix;
//     prefix = undefined;
//   }
//
//   if (patch && parent) {
//     // Modify given object when patching is requested
//     object = parent;
//   }
//   else {
//     // Otherwise create new object
//     object = {};
//     if (parent && parent._prefixes) {
//       // and inherit prefixes from the given object
//       object._prefixes = parent._prefixes.slice();
//     }
//   }
//
//   // Append new prefix
//   if (!object._prefixes) object._prefixes = [];
//   if (prefix) object._prefixes.push(prefix);
//
//   object.log = messageOverlay('log', object._prefixes, noFormat);
//   object.info = messageOverlay("info", object._prefixes, noFormat);
//   object.warn = messageOverlay('warn', object._prefixes, noFormat);
//   object.error = messageOverlay('error', object._prefixes, noFormat);
//   object.dir = messageOverlay('dir', object._prefixes, noFormat);
//
//   consoleProxy(object);
//
//   return object;
// }
//
// Colorterm.getStream = function() {
//   return process.stderr;
// }
//
// Colorterm.writeStream = function(level, prefixes, message) {
//   var substitutions = {
//     '%time': Colors.italic.dim(Colorterm.getTime()),
//     '%level': levelFormat(level),
//     '%message': message
//   }
//
//   if (prefixes.length > 0) {
//     substitutions['%prefixes'] = Colors.white('('+prefixes.join(',')+')');
//     var line = '%level %time %prefixes %message';
//   }
//   else {
//     var line = '%level %time %message';
//   }
//
//   // var time = Colors.italic.underline.dim('%s'.replace('%s', colorterm.getTime()));
//   // var line = time + level + ":";
//   // if (prefixes.length > 0) line += " " + prefixes.join(",");
//   // line += " " + msg;
//
//   var line = line.replace(/%\w+/g, function(all) {
//     return substitutions[all] || all;
//   });
//
//   Colorterm.getStream().write(line + "\n");
//
//   if (level == 'dir') {
//     var options = {
//       keysColor: 'magenta',
//       numberColor: 'white',
//       stringColor: 'grey',
//       dashColor: 'green'
//     }
//
//     Colorterm.getStream().write(PrettyJSON.render(message, options) + '\n');
//   }
// }
//
//
// Colorterm.getTime = function() {
//   var timestamp = new Date().getTime()
//   var moment = Moment.utc(timestamp);
//
//   moment.local();
//
//   return moment.format('HH:mm:ss.SSS')
// };
//
// function messageOverlay(level, prefixes, noFormat) {
//   return function () {
//     // Handle formatting and circular objects like in the original
//     // console.log(message);
//     // console.log(Array.prototype.slice.call(arguments));
//     // console.log(Util.format.apply(this, arguments));
//     // var message = noFormat ? Array.prototype.slice.call(arguments) : Util.format.apply(this, arguments);
//
//     switch(level) {
//       case 'dir':
//         var message = Array.prototype.slice.call(arguments, -1)[0];
//         break;
//       default:
//         var message = noFormat ? Array.prototype.slice.call(arguments) : Util.format.apply(this, arguments);
//     }
//
//     Colorterm.writeStream(level, prefixes, message);
//   };
// }
//
// function levelFormat(level) {
//   var output = StringPadder.padLeft(level + ' |', 10);
//
//   switch(level) {
//     case 'log':
//       return Colors.bold.white.dim(output);
//       break;
//     case 'info':
//       return Colors.bold.cyan(output);
//       break;
//     case 'warn':
//       return Colors.bold.yellow(output);
//       break;
//     case 'error':
//       return Colors.bold.red(output);
//       break;
//     case 'dir':
//       return Colors.bold.magenta(output);
//       break;
//     default:
//       return Colors.white(output);
//   }
// }
//
// function consoleProxy(object) {
//   var methods = ['time', 'timeEnd', 'trace', 'assert'];
//
//   methods.forEach(function(method) {
//     if (object[method]) return;
//
//     object[method] = function(){
//       return console[method].apply(console, arguments);
//     };
//   });
// }
